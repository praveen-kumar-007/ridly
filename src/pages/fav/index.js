import React, { useContext } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { PlayerContext } from '../../context/PlayerContext';
import SocialActions from '../../components/socialActions';
import ProgressBar from '../../components/progressBar';
import Equalizer from '../../components/equalizer';
import MediaControls from '../../components/mediaControls';
import '../feed/feed.css';

export default function Fav() {
  const { favorites } = useFavorites();
  const { playPlaylist, isPlaying, togglePlay, currentTrack } = useContext(PlayerContext);

  const handleTrackVisible = (index) => {
    if (currentTrack?.youtubeId !== favorites[index]?.youtubeId) {
        playPlaylist(favorites, index);
    }
  };

  return (
    <div className='resso-feed-container'>
      {favorites.length === 0 ? (
        <div className="loader">Your library is empty. Go like some songs!</div>
      ) : (
        <div className="resso-scroll-snap">
          {favorites.map((track, index) => {
            const imageUrl = track.image ? track.image[track.image.length - 1]['#text'] : '';
            const isPlayingThis = currentTrack && currentTrack.youtubeId === track.youtubeId;
            
            return (
              <div 
                className="resso-track-card" 
                key={`${track.youtubeId}-${index}`}
                onMouseEnter={() => handleTrackVisible(index)}
              >
                  <div className="resso-bg-blur" style={{ backgroundImage: `url(${imageUrl})` }}></div>
                  <SocialActions track={track} />
                  
                  <div className="resso-content">
                      <img 
                        src={imageUrl} 
                        alt={track.name} 
                        className={`resso-art ${isPlayingThis && isPlaying ? 'spinning' : ''}`} 
                        onClick={() => isPlayingThis ? togglePlay() : playPlaylist(favorites, index)}
                      />
                      
                      <div className="resso-info">
                          <div className="resso-title-container">
                              <h1 className="resso-title">{track.name}</h1>
                              <Equalizer isPlaying={isPlayingThis && isPlaying} />
                          </div>
                          <h2 className="resso-artist">{track.artist ? track.artist.name || track.artist : 'Unknown Artist'}</h2>
                          <p className="resso-reason">Liked Songs</p>
                          <MediaControls track={track} />
                      </div>
                  </div>
                  <ProgressBar track={track} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
