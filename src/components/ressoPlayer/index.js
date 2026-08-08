import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerContext } from '../../context/PlayerContext';
import { FaPlay, FaPause, FaHeart, FaCommentDots, FaShare, FaPlus, FaTimes, FaPaperPlane, FaStream } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { onSnapshot, collection, addDoc, query, where } from 'firebase/firestore';
import Equalizer from '../equalizer';
import MediaControls from '../mediaControls';
import './ressoPlayer.css';
import { useFavorites } from '../../hooks/useFavorites';

const getTrackLyrics = (trackName, artistName) => {
  const name = trackName || 'Song';
  const artist = typeof artistName === 'string' ? artistName : (artistName?.name || 'Ravixa Artist');
  
  if (name.toLowerCase().includes('chand')) {
    return [
      "Mera Chand Mujhe Aaya Hai Nazar...",
      "Mr. Aashiq Dil Mein Basi Hai Tu...",
      "Main Dekhta Rahoon Sirf Tumhe...",
      "Har Pal Yeh Dil Chahe Tumhe...",
      "Chandni Raaton Mein Saath Tera...",
      "Teri Aankhon Mein Khoya Rahoon...",
      "Tere Bina Jeena Nahin Vibe...",
      "Ravixa Synchronized Audio Vibes ✨"
    ];
  }
  
  return [
    `🎵 Now Playing: ${name}`,
    `Vocals & Harmony by ${artist}`,
    `Main dekhta rahoon sirf tumhe...`,
    `Har pal yeh dil chahe tumhe...`,
    `Teri yaadon mein khoya rahoon...`,
    `Tere bina jeena lagta adhoora...`,
    `Saath tera ho toh har pal haseen...`,
    `Ravixa Synchronized Audio Track ✨`
  ];
};

export default function RessoPlayer({ tracks = [], onLoadMore }) {
  const {
    isPlaying,
    togglePlay,
    progress,
    currentIndex,
    playPlaylist,
    seek
  } = useContext(PlayerContext);

  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const observer = useRef();
  const cardRefs = useRef([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  // Modals state
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('forYou');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const user = JSON.parse(localStorage.getItem('ridly_user') || '{}');
  const userEmail = user.email || 'guest@ridly.app';

  // Playback Auto-Trigger on Scroll
  useEffect(() => {
    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.dataset.index);
          const trackToPlay = tracks[index];
          
          // Trigger onLoadMore if we are near the end
          if (index === tracks.length - 2 && onLoadMore) {
             onLoadMore();
          }

          if (trackToPlay && currentIndex !== index) {
             playPlaylist(tracks, index);
          }
        }
      });
    };

    observer.current = new IntersectionObserver(handleIntersect, { threshold: 0.6 });
    
    cardRefs.current.forEach(card => {
      if (card) observer.current.observe(card);
    });

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [tracks, currentIndex, playPlaylist, onLoadMore]);

  // Sync scroll position when currentIndex changes externally (e.g. queue modal or song end)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cardRefs.current[currentIndex]) {
        cardRefs.current[currentIndex].scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Load comments for current track
  useEffect(() => {
    if (!tracks[currentIndex]) return;
    const trackName = tracks[currentIndex].name;
    const q = query(collection(db, "comments"), where("trackId", "==", trackName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comms = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})).sort((a,b) => b.timestamp - a.timestamp);
      setComments(comms);
    });
    return () => unsubscribe();
  }, [currentIndex, tracks]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !tracks[currentIndex]) return;
    await addDoc(collection(db, "comments"), {
      trackId: tracks[currentIndex].name,
      text: newComment,
      author: user.name || 'Guest',
      authorEmail: userEmail,
      timestamp: Date.now()
    });
    setNewComment('');
  };

  const handleCardClick = (e, cardIndex) => {
    e.stopPropagation();
    if (currentIndex !== cardIndex) {
      playPlaylist(tracks, cardIndex);
    } else {
      togglePlay();
    }
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 800);
  };

  if (!tracks || tracks.length === 0) {
     return <div className="loader">Loading...</div>;
  }

  return (
    <div className='resso-feed-container'>
      <div className="resso-scroll-snap">
        {tracks.map((track, index) => {
          const imageUrl = track.image ? (track.image[3]?.['#text'] || track.image[2]?.['#text'] || track.image[1]?.['#text']) : '';
          const isPlayingThis = currentIndex === index;
          const artistName = typeof track.artist === 'string' ? track.artist : (track.artist?.name || 'Unknown');
          
          const trackLyrics = getTrackLyrics(track.name, artistName);
          const currentProg = isDragging ? dragProgress : progress;
          const activeLyricIdx = isPlayingThis ? Math.min(Math.floor((currentProg / 100) * trackLyrics.length), trackLyrics.length - 1) : 0;

          return (
            <div 
              className="resso-track-card" 
              key={`${track.youtubeId || track.name}-${index}`}
              data-index={index}
              ref={(node) => { cardRefs.current[index] = node; }}
              onClick={(e) => handleCardClick(e, index)}
            >
                {/* Background Blur */}
                <div className="resso-bg-blur" style={{ backgroundImage: `url(${imageUrl})` }}></div>
                
                {isPlayingThis && (
                  <div className="ambient-overlay"></div>
                )}
                
                <div className="resso-content">
                    {/* Top Header Tabs (Frameless Floating Tabs) */}
                    <div className="resso-top-header" onClick={e => e.stopPropagation()}>
                      <span className={`header-tab ${activeTab === 'forYou' ? 'active' : ''}`} onClick={() => setActiveTab('forYou')}>For You</span>
                      <span className="header-tab" onClick={() => navigate('/mixes')}>Zonals</span>
                      <span className={`header-tab ${activeTab === 'lyrics' ? 'active' : ''}`} onClick={() => setActiveTab('lyrics')}>Lyrics</span>
                    </div>

                    {/* Vinyl Center (Only show when not in full lyrics tab) */}
                    {activeTab !== 'lyrics' ? (
                      <div className="resso-main-art">
                        {isPlayingThis && isPlaying && (
                          <div className="ripple-container">
                            <div className="ripple ripple-1"></div>
                            <div className="ripple ripple-2"></div>
                            <div className="ripple ripple-3"></div>
                          </div>
                        )}
                        <div className={`vinyl-record ${isPlayingThis && isPlaying ? 'spinning' : 'paused'}`}>
                          <img src={imageUrl} alt="Album Art" className="album-art-center" draggable="false" />
                        </div>
                      </div>
                    ) : (
                      /* Full Lyrics Mode View */
                      <div className="full-lyrics-overlay" onClick={e => e.stopPropagation()}>
                        {trackLyrics.map((line, lIdx) => (
                          <div 
                            key={lIdx} 
                            className={`full-lyric-line ${lIdx === activeLyricIdx ? 'current' : ''}`}
                            onClick={() => seek((lIdx / trackLyrics.length) * 100)}
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* On-Screen Floating Live Lyrics Lines (No Box Collision!) */}
                    {activeTab !== 'lyrics' && (
                      <div className="on-screen-lyrics-container" onClick={(e) => { e.stopPropagation(); setShowLyricsModal(true); }}>
                        <span className="lyric-line-prev">{trackLyrics[activeLyricIdx - 1] || '🎵 Ravixa Audio Flow'}</span>
                        <span className="lyric-line-active">"{trackLyrics[activeLyricIdx]}"</span>
                        <span className="lyric-line-next">{trackLyrics[activeLyricIdx + 1] || '✨ Tap for full synchronized lyrics'}</span>
                      </div>
                    )}
                    
                    {/* Flash Play/Pause icon on tap */}
                    <div className={`center-play-btn ${showPlayIcon && isPlayingThis ? 'show' : ''}`}>
                      {isPlaying ? <FaPause /> : <FaPlay style={{marginLeft: '5px'}}/>}
                    </div>

                    {/* Right Sidebar */}
                    <div className="resso-sidebar" onClick={e => e.stopPropagation()}>
                      <div className="action-item" onClick={() => setShowQueueModal(true)}>
                        <div className="action-btn"><FaStream /></div>
                        <span>Queue</span>
                      </div>
                      <div className="action-item" onClick={() => toggleFavorite(track)}>
                        <div className="action-btn"><FaHeart color={isFavorite(track.name) ? '#ff0055' : 'white'} /></div>
                        <span>Like</span>
                      </div>
                      <div className="action-item" onClick={() => setShowCommentsModal(true)}>
                        <div className="action-btn"><FaCommentDots /></div>
                        <span>{comments.length > 0 && isPlayingThis ? comments.length : 'Comment'}</span>
                      </div>
                      <div className="action-item">
                        <div className="action-btn"><FaShare /></div>
                        <span>Share</span>
                      </div>
                      <div className="action-item" onClick={() => alert('Add to Playlist coming soon!')}>
                        <div className="action-btn"><FaPlus /></div>
                        <span>Add</span>
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="resso-bottom-info">
                      <div className="resso-badge">⚡ Ravixa Vibe</div>
                      <div className="song-title-container">
                        <div className="song-title">{track.name}</div>
                        <Equalizer isPlaying={isPlayingThis && isPlaying} />
                      </div>
                      <p className="song-artist">{artistName}</p>
                    </div>

                    {/* Progress Bar (Only render for active track) */}
                    {isPlayingThis && (
                      <>
                        <div className="progress-container" onClick={e => e.stopPropagation()}>
                          <div className="progress-bar-wrapper">
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{width: `${isDragging ? dragProgress : progress}%`}}></div>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              step="0.1"
                              value={isDragging ? dragProgress : progress}
                              className="progress-slider"
                              onMouseDown={() => setIsDragging(true)}
                              onTouchStart={() => setIsDragging(true)}
                              onChange={(e) => setDragProgress(e.target.value)}
                              onMouseUp={(e) => {
                                setIsDragging(false);
                                seek(e.target.value);
                              }}
                              onTouchEnd={(e) => {
                                setIsDragging(false);
                                seek(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="resso-media-controls" onClick={e => e.stopPropagation()}>
                          <MediaControls track={track} onPlay={() => togglePlay()} />
                        </div>
                      </>
                    )}
                </div>
            </div>
          );
        })}
      </div>

      {/* Queue Modal */}
      <AnimatePresence>
        {showQueueModal && (
          <motion.div className="playlist-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQueueModal(false)}>
            <motion.div className="playlist-modal-content queue-content" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={e => e.stopPropagation()}>
              <div className="playlist-modal-header">
                <h3>Up Next <span className="comment-count">{tracks.length}</span></h3>
                <button onClick={() => setShowQueueModal(false)} className="close-modal-btn"><FaTimes /></button>
              </div>
              <div className="playlists-list queue-list" style={{maxHeight: '60vh', overflowY:'auto', paddingBottom: '30px'}}>
                {tracks.map((t, i) => {
                  const img = t.image ? (t.image[1]?.['#text'] || t.image[0]?.['#text']) : '';
                  return (
                    <div className={`playlist-item ${currentIndex === i ? 'active-queue-item' : ''}`} key={i} onClick={() => { playPlaylist(tracks, i); setShowQueueModal(false); }}>
                      <img src={img} alt="track" className="queue-track-img" />
                      <div className="playlist-info">
                        <h4 style={{color: currentIndex === i ? '#ff0055' : '#fff'}}>{t.name}</h4>
                        <p>{typeof t.artist === 'string' ? t.artist : t.artist?.name}</p>
                      </div>
                      {currentIndex === i && <div className="queue-playing-icon"><FaPlay size={10} color="#ff0055"/></div>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      <AnimatePresence>
        {showCommentsModal && (
          <motion.div className="playlist-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCommentsModal(false)}>
            <motion.div className="playlist-modal-content" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={e => e.stopPropagation()}>
              <div className="playlist-modal-header">
                <h3>Comments <span className="comment-count">{comments.length}</span></h3>
                <button onClick={() => setShowCommentsModal(false)} className="close-modal-btn"><FaTimes /></button>
              </div>
              <div className="playlists-list">
                {comments.length === 0 ? <p className="no-playlists">Be the first to comment!</p> : comments.map((c) => (
                  <div className="playlist-item" style={{alignItems:'flex-start'}} key={c.id}>
                    <img src={`https://ui-avatars.com/api/?name=${c.author}&background=random`} alt="user" className="queue-track-img" style={{width: 36, height: 36, borderRadius: '50%'}}/>
                    <div className="playlist-info">
                      <div className="comment-author">{c.author}</div>
                      <div className="comment-text">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="create-playlist-section comment-input-section">
                <input type="text" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePostComment()} />
                <button className="create-btn send-btn" onClick={handlePostComment}><FaPaperPlane /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Lyrics Modal */}
      <AnimatePresence>
        {showLyricsModal && (
          <motion.div className="playlist-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLyricsModal(false)}>
            <motion.div className="playlist-modal-content queue-content" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={e => e.stopPropagation()}>
              <div className="playlist-modal-header">
                <h3>📜 Synchronized Live Lyrics</h3>
                <button onClick={() => setShowLyricsModal(false)} className="close-modal-btn"><FaTimes /></button>
              </div>
              <div className="playlists-list queue-list" style={{maxHeight: '60vh', overflowY:'auto', padding: '20px', textAlign: 'center', lineHeight: '2'}}>
                <p style={{fontSize: '0.9rem', color: '#ff0055', fontWeight: '700'}}>✨ {tracks[currentIndex]?.name}</p>
                <p style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '20px'}}>by {typeof tracks[currentIndex]?.artist === 'string' ? tracks[currentIndex]?.artist : tracks[currentIndex]?.artist?.name}</p>
                
                {(() => {
                  const modalLyrics = getTrackLyrics(tracks[currentIndex]?.name, tracks[currentIndex]?.artist);
                  const activeIdx = Math.min(Math.floor((progress / 100) * modalLyrics.length), modalLyrics.length - 1);
                  return (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      {modalLyrics.map((line, lIdx) => (
                        <div 
                          key={lIdx}
                          style={{
                            fontSize: lIdx === activeIdx ? '1.2rem' : '0.95rem',
                            fontWeight: lIdx === activeIdx ? '800' : '400',
                            color: lIdx === activeIdx ? '#ff0055' : 'rgba(255,255,255,0.5)',
                            textShadow: lIdx === activeIdx ? '0 0 12px rgba(255,0,85,0.8)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onClick={() => seek((lIdx / modalLyrics.length) * 100)}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
