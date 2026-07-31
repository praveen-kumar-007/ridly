import React, { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import './player.css';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom, FaRedo } from 'react-icons/fa';

export default function Player() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    progress, 
    seek,
    nextTrack,
    prevTrack,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    currentTime,
    duration,
    formatTime
  } = useContext(PlayerContext);

  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    seek(percentage);
  };

  const imageUrl = currentTrack && currentTrack.image ? currentTrack.image[3]['#text'] || currentTrack.image[2]['#text'] : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400';
  const trackName = currentTrack ? currentTrack.name : 'Select a track from Trending';
  const artistName = currentTrack ? currentTrack.artist.name : '';

  return (
    <div className='screen-container'>
      <div className="player-wrapper">
        <div className="player-glass-panel glass-panel">
          
          <div className="album-art-container">
            <img 
              src={imageUrl} 
              alt="Album Art" 
              className={`album-art ${isPlaying ? 'spinning' : ''}`}
            />
          </div>

          <div className="song-info">
            <h2 className="song-title">{trackName}</h2>
            <p className="song-artist">{artistName}</p>
          </div>

          <div className="progress-container">
            <div className="time-info">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="progress-bar-bg" onClick={handleSeek}>
              <div className="progress-bar-fill" style={{width: `${progress}%`}}></div>
            </div>
          </div>

          <div className="controls">
            <button 
              className={`control-btn small ${isShuffle ? 'active-toggle' : ''}`} 
              onClick={toggleShuffle}
              style={{ color: isShuffle ? 'var(--primary-color)' : 'var(--text-muted)' }}
            >
              <FaRandom />
            </button>
            <button className="control-btn" onClick={prevTrack}><FaStepBackward /></button>
            <button 
              className="control-btn play-btn" 
              onClick={togglePlay}
            >
              {isPlaying ? <FaPause /> : <FaPlay style={{marginLeft: '4px'}} />}
            </button>
            <button className="control-btn" onClick={nextTrack}><FaStepForward /></button>
            <button 
              className={`control-btn small ${isRepeat ? 'active-toggle' : ''}`} 
              onClick={toggleRepeat}
              style={{ color: isRepeat ? 'var(--primary-color)' : 'var(--text-muted)' }}
            >
              <FaRedo />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
