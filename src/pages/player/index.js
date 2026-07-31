import React, { useContext, useState } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import './player.css';
import { FaPlay, FaPause, FaHeart, FaCommentDots, FaShare, FaPlus, FaStepBackward, FaStepForward } from 'react-icons/fa';

export default function Player() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    progress, 
    seek,
    nextTrack,
    prevTrack,
    currentTime,
    duration,
    formatTime
  } = useContext(PlayerContext);

  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEndY, setTouchEndY] = useState(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEndY(null);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStartY || !touchEndY) return;
    const distance = touchStartY - touchEndY;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;
    
    if (isUpSwipe) {
      nextTrack(); // Swipe up -> Next track
    } else if (isDownSwipe) {
      prevTrack(); // Swipe down -> Prev track
    }
  };

  // Allow mouse drag/swipe for desktop users as well
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setTouchStartY(e.clientY);
    setTouchEndY(null);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setTouchEndY(e.clientY);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      handleTouchEnd();
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation(); // Prevent swipe interaction from triggering
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    seek(percentage);
  };

  const imageUrl = currentTrack && currentTrack.image ? currentTrack.image[3]['#text'] || currentTrack.image[2]['#text'] : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400';
  const trackName = currentTrack ? currentTrack.name : 'Select a track from Trending';
  const artistName = currentTrack ? (typeof currentTrack.artist === 'string' ? currentTrack.artist : currentTrack.artist.name) : '';

  return (
    <div 
      className='resso-player-container'
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Blurred Background */}
      <div 
        className="resso-background" 
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>
      <div className="resso-overlay"></div>

      <div className="resso-content">
        {/* Top Header */}
        <div className="resso-header">
          <p>Now Playing</p>
        </div>

        {/* Main Album Art (Spinning Vinyl) */}
        <div className="resso-main-art">
          <div className={`vinyl-record ${isPlaying ? 'spinning' : 'paused'}`}>
            <img src={imageUrl} alt="Album Art" className="album-art-center" draggable="false" />
          </div>
        </div>

        {/* Right Sidebar Actions */}
        <div className="resso-sidebar" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
          <div className="action-item">
            <div className="action-btn"><FaHeart /></div>
            <span>Like</span>
          </div>
          <div className="action-item">
            <div className="action-btn"><FaCommentDots /></div>
            <span>Comment</span>
          </div>
          <div className="action-item">
            <div className="action-btn"><FaShare /></div>
            <span>Share</span>
          </div>
          <div className="action-item">
            <div className="action-btn"><FaPlus /></div>
            <span>Add</span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="resso-bottom" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
          <div className="song-info">
            <h2 className="song-title">{trackName}</h2>
            <p className="song-artist">{artistName}</p>
          </div>

          <div className="progress-container">
            <div className="progress-bar-bg" onClick={handleSeek}>
              <div className="progress-bar-fill" style={{width: `${progress}%`}}></div>
            </div>
            <div className="time-info">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="controls">
            <button className="control-btn small" onClick={prevTrack}><FaStepBackward /></button>
            <button 
              className="control-btn play-btn" 
              onClick={togglePlay}
            >
              {isPlaying ? <FaPause /> : <FaPlay style={{marginLeft: '4px'}} />}
            </button>
            <button className="control-btn small" onClick={nextTrack}><FaStepForward /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
