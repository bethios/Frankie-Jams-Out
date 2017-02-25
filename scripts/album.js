var setSong = function(songNumber){
    if(currentSoundFile){
        currentSoundFile.stop();
    }

    currentlyPlayingSongNumber = Number(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber -1];

    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });
    setVolume(currentVolume);
};

var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setVolume = function(volume){
    if(currentSoundFile){
        currentSoundFile.setVolume(volume);
        currentVolume = volume;
    }
};

var getSongNumberCell = function(number){
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function(songNumber, songName, songLength){
    var template=
        '<tr class="album-view-song-item">'
     + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
     +  '   <td class="song-item-title">' + songName + '</td>'
     +  '   <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
     +  '</tr>'
     ;
    
    var $row = $(template);

    var clickHandler = function(){
        var songNumber = Number($(this).attr('data-song-number'));

        if(currentlyPlayingSongNumber !== null){
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
            updatePlayerBarSong();
        }

        if(currentlyPlayingSongNumber !== songNumber){
            $(this).html(pauseButtonTemplate);
            setSong(songNumber);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
            /*
            So the commented out area is how bloc wants it to be done.  But I just added
            a line to the setVolume function that changes the current volume to be the volume selected
            on the seek bar in setUpSeekBars.  I believe it achieves the same thing.
            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'});
            */

            updatePlayerBarSong();
        }else if(currentlyPlayingSongNumber === songNumber){
            if(currentSoundFile.isPaused() === true){
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
            }else{
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
            }
        }
    };

    var onHover = function(event){
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = Number(songNumberCell.attr('data-song-number'));

        if(songNumber !== currentlyPlayingSongNumber){
            songNumberCell.html(playButtonTemplate);
        }
    };

    var offHover = function(event){
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = Number(songNumberCell.attr('data-song-number'));

        if(songNumber !== currentlyPlayingSongNumber){
            songNumberCell.html(songNumber);
        }
    };

    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};

var setCurrentAlbum = function(album) {
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');

    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();

    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }

};

var setCurrentTimeInPlayerBar = function(currentTime){
    $('.current-time').text(currentTime);
};

var setTotalTimeInPlayerBar = function(totalTime){
    $('.total-time').text(totalTime);
};

var filterTimeCode = function(timeInSeconds){
    var totalSeconds = parseFloat(timeInSeconds);
    var minutes = Math.floor(totalSeconds/60);
    var seconds = Math.floor(totalSeconds % 60);

    if(seconds < 10 ){
        seconds = "0" + seconds.toString();
    }

    return (minutes + ":" + seconds);
};

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');

            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(filterTimeCode(this.getTime()));
            setTotalTimeInPlayerBar(filterTimeCode(this.getDuration()));
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');

    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;

        if($(this).hasClass('volume-bar')){
            setVolume(seekBarFillRatio * 100);
        }else{
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        }

        updateSeekPercentage($(this), seekBarFillRatio);
    });

    $seekBars.find('.thumb').mousedown(function(event) {
        var $seekBar = $(this).parent();

        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio);
            }

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });

        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};

/*var trackIndex = function(album, song){
    return album.songs.indexOf(song);
};
*/

var updatePlayerBarSong = function() {
    $(".currently-playing .song-name").text(currentSongFromAlbum.title);
    $(".currently-playing .artist-song-mobile").text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $(".currently-playing .artist-name").text(currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
};

var togglePlayFromPlayerBar = function(){
    var currentlyPlayingCell= getSongNumberCell(currentlyPlayingSongNumber);

    if(currentSoundFile.isPaused()){
        currentlyPlayingCell.html(pauseButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPauseButton);
        currentSoundFile.play();
    }else if(currentSoundFile !== null && currentSoundFile.isPaused() === false){
        currentlyPlayingCell.html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
        currentSoundFile.pause();
    }
};

var skipSong = function(directionToSkip){
    var lastSongIndex = currentlyPlayingSongNumber -1;
    var lastSongNumber = Number(currentlyPlayingSongNumber);
    var nextToPlayIndex;
    var nextSongNumber;

    if(directionToSkip === 'nextSong'){
        nextToPlayIndex = lastSongIndex + 1;
        nextSongNumber = lastSongNumber + 1;

        if(nextToPlayIndex >= currentAlbum.songs.length){
            nextToPlayIndex = 0;
            nextSongNumber = 1;
        }
    }else if(directionToSkip === 'previousSong'){
        nextToPlayIndex = lastSongIndex - 1;
        nextSongNumber = lastSongNumber -1;

        if(nextToPlayIndex < 0){
            nextToPlayIndex += currentAlbum.songs.length;
            nextSongNumber += currentAlbum.songs.length;
        }
    }

    setSong(nextSongNumber);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();

    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var songRows = document.getElementsByClassName('album-view-song-item');

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';

var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';

    var playerBarPlayButton = '<span class="ion-play"></span>';
    var playerBarPauseButton = '<span class="ion-pause"></span>';


var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

var barPlayPause = $('.main-controls .play-pause');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(function(){
        return skipSong('previousSong')
    });

    $nextButton.click(function(){
        return skipSong('nextSong')
    });

    barPlayPause.click(togglePlayFromPlayerBar);
});

var listOfAlbums = [albumMarconi, albumCrazy, albumPicasso];

function switchCovers(){
    if(currentlyPlayingSongNumber) {
        currentlyPlayingSongNumber = null;
        currentSoundFile.pause();
    }

    currentSoundFile.pause();


    setCurrentAlbum(listOfAlbums[0]);
    listOfAlbums.push(listOfAlbums.shift());
}

var albumImage = document.getElementsByClassName('album-cover-art')[0];

albumImage.addEventListener("click", switchCovers);

