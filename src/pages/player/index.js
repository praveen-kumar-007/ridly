import React, { useContext, useState, useEffect } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import './player.css';
import { FaPlay, FaPause, FaHeart, FaCommentDots, FaShare, FaPlus, FaStepBackward, FaStepForward } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';

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
    formatTime,
    currentIndex
  } = useContext(PlayerContext);

  const [direction, setDirection] = useState(1); // 1 for up/next, -1 for down/prev

  const handlers = useSwipeable({
    onSwipedUp: () => {
      setDirection(1);
      nextTrack();
    },
    onSwipedDown: () => {
      setDirection(-1);
      prevTrack();
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 10 // smaller delta for more responsive swipes
  });

  // Handle desktop mouse wheel scroll
  useEffect(() => {
    let timeoutId;
    const handleWheel = (e) => {
      if (timeoutId) return; // simple debounce
      timeoutId = setTimeout(() => {
        if (e.deltaY > 0) {
          setDirection(1);
          nextTrack();
        } else if (e.deltaY < 0) {
          setDirection(-1);
          prevTrack();
        }
        timeoutId = null;
      }, 300);
    };

    const container = document.getElementById('resso-player-container');
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      clearTimeout(timeoutId);
    };
  }, [nextTrack, prevTrack]);

  const handleSeek = (e) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    seek(percentage);
  };

  const imageUrl = currentTrack && currentTrack.image ? currentTrack.image[3]['#text'] || currentTrack.image[2]['#text'] : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400';
  const trackName = currentTrack ? currentTrack.name : 'Select a track from Trending';
  const artistName = currentTrack ? (typeof currentTrack.artist === 'string' ? currentTrack.artist : currentTrack.artist.name) : '';

  const variants = {
    enter: (direction) => {
      return {
        y: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.9
      };
    },
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        y: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.9
      };
    }
  };

  return (
    <div id="resso-player-container" className='resso-player-container' {...handlers}>
      {/* Background is stationary to reduce motion sickness, just fades */}
      <AnimatePresence>
        <motion.div 
           key={imageUrl}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.8 }}
           className="resso-background" 
           style={{ backgroundImage: `url(${imageUrl})` }}
        />
      </AnimatePresence>
      <div className="resso-overlay"></div>

      <div className="resso-header">
        <p>Now Playing</p>
      </div>

      {/* Main Track Content - Slides Up/Down */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="resso-content-wrapper"
        >
          <div className="resso-content">
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
                <button className="control-btn small" onClick={() => { setDirection(-1); prevTrack(); }}><FaStepBackward /></button>
                <button 
                  className="control-btn play-btn" 
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                >
                  {isPlaying ? <FaPause /> : <FaPlay style={{marginLeft: '4px'}} />}
                </button>
                <button className="control-btn small" onClick={() => { setDirection(1); nextTrack(); }}><FaStepForward /></button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
