import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { searchTracks } from '../../api';
import { PlayerContext } from '../../context/PlayerContext';
import SocialActions from '../../components/socialActions';
import ProgressBar from '../../components/progressBar';
import Equalizer from '../../components/equalizer';
import MediaControls from '../../components/mediaControls';
import './feed.css';

export default function Feed() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageToken, setPageToken] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [topArtistName, setTopArtistName] = useState('');
  const { playPlaylist, isPlaying, togglePlay, currentTrack, setQueue, isLoadingQueueTrack } = useContext(PlayerContext);
  const observer = useRef();
  const autoPlayObserver = useRef();
  const cardRefs = useRef([]);
  const location = useLocation();

  useEffect(() => {
    const fetchRecommendations = async (token = '', queryOverride = null) => {
      let targetQuery = queryOverride || location.state?.moodQuery || searchQuery;
      let calculatedTopArtist = location.state?.moodQuery ? 'Your Chosen Vibe' : 'Trending Hits';
      
      if (!targetQuery) {
          try {
              const storedUser = localStorage.getItem('ridly_user');
              let historyKey = 'ridly_play_history';
              if (storedUser) {
                const user = JSON.parse(storedUser);
                historyKey = `ridly_play_history_${user.email}`;
              }
              
              const historyStr = localStorage.getItem(historyKey) || '[]';
              const history = JSON.parse(historyStr);
              if (history.length > 0) {
                  const counts = history.reduce((acc, artist) => {
                      acc[artist] = (acc[artist] || 0) + 1;
                      return acc;
                  }, {});
                  const topArtist = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                  calculatedTopArtist = `Based on ${topArtist}`;
                  targetQuery = `${topArtist} latest new songs 2024`;
              } else {
                  calculatedTopArtist = 'Daily New Releases';
                  targetQuery = '2024 new released songs latest hits'; 
              }
          } catch (e) {
              calculatedTopArtist = 'Daily New Releases';
              targetQuery = '2024 new released songs latest hits';
          }
          setSearchQuery(targetQuery);
          setTopArtistName(calculatedTopArtist);
      }
  
      const data = await searchTracks(targetQuery, token, 15);
      
      // PRELOAD IMAGES AGGRESSIVELY FOR ZERO-DELAY RENDERING
      data.tracks.forEach(track => {
          const imgUrl = track.image ? track.image[track.image.length - 1]['#text'] : null;
          if (imgUrl) {
              const img = new Image();
              img.src = imgUrl;
          }
      });

      if (!token) {
        setTracks(data.tracks);
        setQueue(data.tracks); // Sync queue initially
      } else {
        setTracks(prev => {
           const updated = [...prev, ...data.tracks];
           setQueue(updated); // Sync queue dynamically when scrolling
           return updated;
        });
      }
      setPageToken(data.nextPageToken);
      setLoading(false);
    };

    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.moodQuery]);

  const lastTrackElementRef = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pageToken) {
        searchTracks(searchQuery, pageToken, 15).then(data => {
            if (data && data.tracks) {
              setTracks(prev => {
                const updated = [...prev, ...data.tracks];
                setQueue(updated); // Sync queue dynamically
                return updated;
              });
              setPageToken(data.nextPageToken);
            }
        });
      }
    });
    if (node) observer.current.observe(node);
  };

  // Auto-play observer to play music automatically when card enters viewport
  useEffect(() => {
    if (autoPlayObserver.current) autoPlayObserver.current.disconnect();
    
    autoPlayObserver.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.dataset.index);
          const trackToPlay = tracks[index];
          
          if (trackToPlay) {
             if (currentTrack?.youtubeId !== trackToPlay.youtubeId) {
                // If it's a new track, load and play it
                playPlaylist(tracks, index);
             } else if (!isPlaying) {
                // If it's the current track but it's paused, resume it
                togglePlay();
             }
          }
        }
      });
    }, { threshold: 0.6 }); // Trigger when 60% of the card is visible

    cardRefs.current.forEach(card => {
      if (card) autoPlayObserver.current.observe(card);
    });

    return () => {
      if (autoPlayObserver.current) autoPlayObserver.current.disconnect();
    };
  }, [tracks, currentTrack, isPlaying, playPlaylist, togglePlay]);

  return (
    <div className='resso-feed-container'>
      {loading && tracks.length === 0 ? (
        <div className="loader">Building your Vibe...</div>
      ) : (
        <div className="resso-scroll-snap">
          {tracks.map((track, index) => {
            const imageUrl = track.image ? track.image[track.image.length - 1]['#text'] : ''; // High res
            const isPlayingThis = currentTrack && currentTrack.youtubeId === track.youtubeId;
            const isLast = index === tracks.length - 1;
            
            return (
              <div 
                className="resso-track-card" 
                key={`${track.youtubeId}-${index}`}
                data-index={index}
                ref={(node) => {
                  if (isLast) lastTrackElementRef(node);
                  cardRefs.current[index] = node;
                }}
              >
                  <div className="resso-bg-blur" style={{ backgroundImage: `url(${imageUrl})` }}></div>
                  <SocialActions track={track} />
                  
                  <div className="resso-content">
                      <div className="resso-art-container" onClick={() => isPlayingThis ? togglePlay() : playPlaylist(tracks, index)}>
                        <img 
                          src={imageUrl} 
                          alt={track.name} 
                          className={`resso-art ${isPlayingThis && isPlaying && !isLoadingQueueTrack ? 'spinning' : ''}`} 
                          style={{ opacity: isLoadingQueueTrack && isPlayingThis ? 0.5 : 1 }}
                        />
                        {isLoadingQueueTrack && isPlayingThis && (
                           <div className="loading-spinner">Loading...</div>
                        )}
                      </div>
                      
                      <div className="resso-info">
                          <div className="resso-title-container">
                              <h1 className="resso-title">{track.name}</h1>
                              <Equalizer isPlaying={isPlayingThis && isPlaying && !isLoadingQueueTrack} />
                          </div>
                          <h2 className="resso-artist">{track.artist ? track.artist.name || track.artist : 'Unknown Artist'}</h2>
                          <p className="resso-reason">{topArtistName}</p>
                          <MediaControls track={track} onPlay={() => isPlayingThis ? togglePlay() : playPlaylist(tracks, index)} />
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
