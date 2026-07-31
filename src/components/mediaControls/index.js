import React, { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import { FaStepBackward, FaStepForward, FaRandom, FaRedoAlt } from 'react-icons/fa';
import './mediaControls.css';

export default function MediaControls({ track }) {
  const { currentTrack, nextTrack, prevTrack, isShuffle, toggleShuffle, isRepeat, toggleRepeat } = useContext(PlayerContext);
  
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

  return (
    <div className={`media-controls-overlay ${isActive ? 'active' : ''}`}>
        <div className="control-btn" onClick={(e) => { createRipple(e); toggleShuffle(); }}>
           <FaRandom color={isShuffle ? 'var(--primary-color)' : 'rgba(255,255,255,0.5)'} size={20} />
        </div>
        <div className="control-btn skip-btn" onClick={(e) => { createRipple(e); prevTrack(); }}>
           <FaStepBackward color="white" size={24} />
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
