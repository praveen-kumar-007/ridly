import React, { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import { FaStepBackward, FaStepForward, FaRandom, FaRedoAlt, FaPlay, FaPause } from 'react-icons/fa';
import './mediaControls.css';

export default function MediaControls({ track, onPlay }) {
  const { currentTrack, nextTrack, prevTrack, isShuffle, toggleShuffle, isRepeat, toggleRepeat, togglePlay, isPlaying } = useContext(PlayerContext);
  
  // Only show active controls if this is the currently playing track
  const isActive = currentTrack && currentTrack.youtubeId === track.youtubeId;

  const createRipple = (e) => {
    const button = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }
    button.appendChild(circle);
  };

  const handlePlayPause = (e) => {
      createRipple(e);
      if (onPlay) {
          onPlay();
      } else {
          togglePlay();
      }
  };

  return (
    <div className={`media-controls-overlay ${isActive ? 'active' : ''}`}>
        <div className="control-btn" onClick={(e) => { createRipple(e); toggleShuffle(); }}>
           <FaRandom color={isShuffle ? 'var(--primary-color)' : 'rgba(255,255,255,0.5)'} size={20} />
        </div>
        
        <div className="control-btn skip-btn" onClick={(e) => { createRipple(e); prevTrack(); }}>
           <FaStepBackward color="white" size={24} />
        </div>
        
        {/* Play/Pause Button */}
        <div className="control-btn play-pause-btn" onClick={handlePlayPause} style={{ transform: 'scale(1.3)', margin: '0 15px' }}>
           {isActive && isPlaying ? (
              <FaPause color="var(--primary-color)" size={28} />
           ) : (
              <FaPlay color="white" size={28} style={{ marginLeft: '4px' }} />
           )}
        </div>
        
        <div className="control-btn skip-btn" onClick={(e) => { createRipple(e); nextTrack(); }}>
           <FaStepForward color="white" size={24} />
        </div>
        
        <div className="control-btn" onClick={(e) => { createRipple(e); toggleRepeat(); }}>
           <FaRedoAlt color={isRepeat ? 'var(--primary-color)' : 'rgba(255,255,255,0.5)'} size={20} />
        </div>
    </div>
  );
}
