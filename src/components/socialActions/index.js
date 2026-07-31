import React, { useState, useEffect, useContext } from 'react';
import { FaHeart, FaRegHeart, FaCommentDots, FaMicrophoneAlt, FaTimes, FaShare, FaListUl, FaWhatsapp, FaInstagram, FaLink } from 'react-icons/fa';
import { useFavorites } from '../../hooks/useFavorites';
import { PlayerContext } from '../../context/PlayerContext';
import './socialActions.css';

export default function SocialActions({ track }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { queue, currentIndex } = useContext(PlayerContext);
  
  const [showComments, setShowComments] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const isFav = isFavorite(track.name);
  const commentKey = `resso_comments_${track.youtubeId || track.name}`;

  useEffect(() => {
    const savedComments = localStorage.getItem(commentKey);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      setComments([]);
    }
  }, [commentKey]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const user = JSON.parse(localStorage.getItem('ridly_user') || '{"name":"Guest"}');
    const newCommentObj = { author: user.name, text: newComment, id: Date.now() };
    const updatedComments = [...comments, newCommentObj];
    
    setComments(updatedComments);
    localStorage.setItem(commentKey, JSON.stringify(updatedComments));
    setNewComment('');
  };

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
    <>
      <div className="resso-social-sidebar">
        <div className="social-action-btn" onClick={(e) => { createRipple(e); toggleFavorite(track); }}>
          {isFav ? <FaHeart color="var(--accent-color)" size={28} /> : <FaRegHeart color="white" size={28} />}
        </div>
        <div className="social-action-btn" onClick={(e) => { createRipple(e); setShowComments(true); }}>
          <FaCommentDots color="white" size={28} />
          <span className="social-count">{comments?.length || 0}</span>
        </div>
        <div className="social-action-btn" onClick={(e) => { createRipple(e); setShowLyrics(true); }}>
          <FaMicrophoneAlt color="white" size={28} />
        </div>
        <div className="social-action-btn" onClick={(e) => { createRipple(e); setShowQueue(true); }}>
          <FaListUl color="white" size={24} />
        </div>
        <div className="social-action-btn" onClick={(e) => { createRipple(e); setShowShare(true); }}>
          <FaShare color="white" size={24} />
        </div>
      </div>

      {/* Slide-out Comments Panel */}
      <div className={`resso-slide-panel ${showComments ? 'open' : ''}`}>
        <div className="panel-header">
          <h3>Comments ({comments?.length || 0})</h3>
          <FaTimes className="close-panel" onClick={() => setShowComments(false)} />
        </div>
        <div className="panel-content">
          {comments?.map((c) => (
            <div key={c.id} className="comment-item">
              <strong>{c.author}</strong>
              <p>{c.text}</p>
            </div>
          ))}
          {(!comments || comments.length === 0) && <p className="no-comments">Be the first to vibe!</p>}
        </div>
        <form onSubmit={handleAddComment} className="comment-form">
          <input 
            type="text" 
            placeholder="Add a comment..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit">Post</button>
        </form>
      </div>

      {/* Slide-out Lyrics Panel */}
      <div className={`resso-slide-panel ${showLyrics ? 'open' : ''}`}>
        <div className="panel-header">
          <h3>Lyrics</h3>
          <FaTimes className="close-panel" onClick={() => setShowLyrics(false)} />
        </div>
        <div className="panel-content lyrics-content">
          <h1>{track.name}</h1>
          <h2>{track.artist?.name || track.artist || 'Unknown'}</h2>
          <p className="mock-lyrics">
            (Premium lyrics synchronized via API)<br/><br/>
            Scrolling gracefully...<br/><br/>
            🎵 🎵 🎵
          </p>
        </div>
      </div>

      {/* Slide-out Share Panel */}
      <div className={`resso-slide-panel share-panel ${showShare ? 'open' : ''}`}>
        <div className="panel-header">
          <h3>Share to...</h3>
          <FaTimes className="close-panel" onClick={() => setShowShare(false)} />
        </div>
        <div className="panel-content share-content">
           <div className="share-option">
              <div className="share-icon whatsapp"><FaWhatsapp size={32} /></div>
              <span>WhatsApp</span>
           </div>
           <div className="share-option">
              <div className="share-icon instagram"><FaInstagram size={32} /></div>
              <span>Story</span>
           </div>
           <div className="share-option">
              <div className="share-icon link"><FaLink size={32} /></div>
              <span>Copy Link</span>
           </div>
        </div>
      </div>

      {/* Slide-out Queue Panel */}
      <div className={`resso-slide-panel ${showQueue ? 'open' : ''}`}>
        <div className="panel-header">
          <h3>Up Next ({queue?.length > 0 ? queue.length - currentIndex - 1 : 0})</h3>
          <FaTimes className="close-panel" onClick={() => setShowQueue(false)} />
        </div>
        <div className="panel-content queue-content">
           {queue && queue.slice(currentIndex + 1, currentIndex + 11).map((qTrack, idx) => (
             <div key={idx} className="queue-item">
                <span className="queue-idx">{idx + 1}</span>
                <div className="queue-info">
                   <p className="queue-title">{qTrack.name}</p>
                   <p className="queue-artist">{qTrack.artist?.name || qTrack.artist}</p>
                </div>
             </div>
           ))}
           {(!queue || queue.length === 0) && <p className="no-comments">No tracks in queue. Keep swiping!</p>}
        </div>
      </div>
    </>
  );
}
