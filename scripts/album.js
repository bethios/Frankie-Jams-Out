var setSong = function(songNumber){
    currentlyPlayingSongNumber = Number(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber -1];
};

var getSongNumberCell = function(number){
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function(songNumber, songName, songLength){
    var template=
        '<tr class="album-view-song-item">'
     + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
     +  '   <td class="song-item-title">' + songName + '</td>'
     +  '   <td class="song-item-duration">' + songLength + '</td>'
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
            updatePlayerBarSong();
        }else if(currentlyPlayingSongNumber === songNumber){
            $(this).html(playButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPlayButton);
            setSong(null);
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

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');


$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    $previousButton.click(function(){
        return skipSong('previousSong')
    });

    $nextButton.click(function(){
        return skipSong('nextSong')
    });

});

var listOfAlbums = [albumMarconi, albumCrazy, albumPicasso];

function switchCovers(){
    setCurrentAlbum(listOfAlbums[0]);
    
    listOfAlbums.push(listOfAlbums.shift());
}

var albumImage = document.getElementsByClassName('album-cover-art')[0];

albumImage.addEventListener("click", switchCovers);


