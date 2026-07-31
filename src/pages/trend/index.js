import React, { useState, useEffect, useContext, useRef } from 'react';
import { getTopTracks } from '../../api';
import { PlayerContext } from '../../context/PlayerContext';
import SocialActions from '../../components/socialActions';
import ProgressBar from '../../components/progressBar';
import Equalizer from '../../components/equalizer';
import MediaControls from '../../components/mediaControls';
import '../feed/feed.css';

export default function Trend() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageToken, setPageToken] = useState('');
  const { playPlaylist, isPlaying, togglePlay, currentTrack, setQueue } = useContext(PlayerContext);
  const observer = useRef();

  useEffect(() => {
    const fetchTrending = async (token = '') => {
      const data = await getTopTracks(token, 15);
      if (!token) {
        setTracks(data.tracks);
        setQueue(data.tracks);
      } else {
        setTracks(prev => {
          const updated = [...prev, ...data.tracks];
          setQueue(updated);
          return updated;
        });
      }
      setPageToken(data.nextPageToken);
      setLoading(false);
    };

    fetchTrending();
  }, [setQueue]);

  const [isFetchingPage, setIsFetchingPage] = useState(false);

  const lastTrackElementRef = (node) => {
    if (loading || isFetchingPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pageToken && !isFetchingPage) {
        setIsFetchingPage(true);
        getTopTracks(pageToken, 15).then(data => {
            if (data && data.tracks) {
              setTracks(prev => {
                const updated = [...prev, ...data.tracks];
                setQueue(updated);
                return updated;
              });
              setPageToken(data.nextPageToken);
            }
            setIsFetchingPage(false);
        });
      }
    });
    if (node) observer.current.observe(node);
  };

  return (
    <div className='resso-feed-container'>
      {loading && tracks.length === 0 ? (
        <div className="loader">Loading Trending India...</div>
      ) : tracks.length === 0 ? (
        <div className="loader" style={{ fontSize: '1rem', padding: '20px', textAlign: 'center' }}>
          We hit a snag! The Music API limit might be reached.<br/>Please try again in a few minutes.
        </div>
      ) : (
        <div className="resso-scroll-snap">
          {tracks.map((track, index) => {
            const imageUrl = track.image ? track.image[track.image.length - 1]['#text'] : '';
            const isPlayingThis = currentTrack && currentTrack.youtubeId === track.youtubeId;
            const isLast = index === tracks.length - 1;
            
            return (
              <div 
                className="resso-track-card" 
                key={`${track.youtubeId}-${index}`}
                ref={isLast ? lastTrackElementRef : null}
              >
                  <div className="resso-bg-blur" style={{ backgroundImage: `url(${imageUrl})` }}></div>
                  <SocialActions track={track} />
                  
                  <div className="resso-content">
                      <img 
                        src={imageUrl} 
                        alt={track.name} 
                        className={`resso-art ${isPlayingThis && isPlaying ? 'spinning' : ''}`} 
                        onClick={() => isPlayingThis ? togglePlay() : playPlaylist(tracks, index)}
                      />
                      
                      <div className="resso-info">
                          <div className="resso-title-container">
                              <h1 className="resso-title">{track.name}</h1>
                              <Equalizer isPlaying={isPlayingThis && isPlaying} />
                          </div>
                          <h2 className="resso-artist">{track.artist ? track.artist.name : 'Unknown Artist'}</h2>
                          <p className="resso-reason">Trending in India</p>
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
