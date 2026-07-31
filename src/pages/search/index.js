import React, { useState, useContext, useRef } from 'react';
import { searchTracks } from '../../api';
import { PlayerContext } from '../../context/PlayerContext';
import { FaSearch } from 'react-icons/fa';
import SocialActions from '../../components/socialActions';
import ProgressBar from '../../components/progressBar';
import Equalizer from '../../components/equalizer';
import MediaControls from '../../components/mediaControls';
import '../feed/feed.css';
import './search.css';

export default function Search() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageToken, setPageToken] = useState('');
  const [searchedText, setSearchedText] = useState('');
  const { playPlaylist, isPlaying, togglePlay, currentTrack, setQueue } = useContext(PlayerContext);
  const observer = useRef();

  const handleSearch = async (e, token = '') => {
    if (e) e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setSearchedText(query);
    const data = await searchTracks(query, token, 15);
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

  const lastTrackElementRef = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pageToken) {
        searchTracks(query, pageToken, 15).then(data => {
            if (data && data.tracks) {
              setTracks(prev => {
                const updated = [...prev, ...data.tracks];
                setQueue(updated);
                return updated;
              });
              setPageToken(data.nextPageToken);
            }
        });
      }
    });
    if (node) observer.current.observe(node);
  };

  const handleTrackVisible = (index) => {
    if (currentTrack?.youtubeId !== tracks[index]?.youtubeId) {
        playPlaylist(tracks, index);
    }
  };

  return (
    <div className='resso-feed-container'>
      <div className="search-bar-container">
        <form onSubmit={handleSearch} className="search-form">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for songs, artists..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </form>
      </div>

      {loading && tracks.length === 0 ? (
        <div className="loader">Searching...</div>
      ) : tracks.length > 0 ? (
        <div className="resso-scroll-snap" style={{height: 'calc(100% - 80px)'}}>
          {tracks.map((track, index) => {
            const imageUrl = track.image ? track.image[track.image.length - 1]['#text'] : '';
            const isPlayingThis = currentTrack && currentTrack.youtubeId === track.youtubeId;
            const isLast = index === tracks.length - 1;
            
            return (
              <div 
                className="resso-track-card" 
                key={`${track.youtubeId}-${index}`}
                ref={isLast ? lastTrackElementRef : null}
                onMouseEnter={() => handleTrackVisible(index)}
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
                          <p className="resso-reason">Search Results</p>
                          <MediaControls track={track} />
                      </div>
                  </div>
                  <ProgressBar track={track} />
              </div>
            );
          })}
          {tracks.length === 0 && !loading && searchedText && (
            <div className="loader" style={{color: 'white', zIndex: 10, position: 'relative', textAlign: 'center', marginTop: '40px'}}>No results found for {searchedText}</div>
          )}
        </div>
      ) : (
        <div className="loader">Search for any song to start your Vibe!</div>
      )}
    </div>
  );
}
