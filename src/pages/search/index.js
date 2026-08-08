import React, { useState, useContext } from 'react';
import { searchTracks } from '../../api';
import { FaSearch, FaPlay, FaArrowLeft } from 'react-icons/fa';
import RessoPlayer from '../../components/ressoPlayer';
import { PlayerContext } from '../../context/PlayerContext';
import './search.css';

export default function Search() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageToken, setPageToken] = useState('');
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  
  const [showPlayer, setShowPlayer] = useState(false);
  const { playPlaylist } = useContext(PlayerContext);

  const handleSearch = async (e, token = '') => {
    if (e) e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setShowPlayer(false);
    const data = await searchTracks(query, token, 15);
      if (!token) {
        setTracks(data.tracks);
      } else {
        setTracks(prev => [...prev, ...data.tracks]);
      }
      setPageToken(data.nextPageToken);
      setLoading(false);
  };

  const loadMore = () => {
    if (loading || isFetchingPage || !pageToken || !query) return;
    setIsFetchingPage(true);
    searchTracks(query, pageToken, 15).then(data => {
        if (data && data.tracks) {
          setTracks(prev => [...prev, ...data.tracks]);
          setPageToken(data.nextPageToken);
        }
        setIsFetchingPage(false);
    });
  };

  const handleTrackClick = (index) => {
      playPlaylist(tracks, index);
      setShowPlayer(true);
  };

  if (showPlayer) {
      return (
          <div style={{height: '100%', position: 'relative'}}>
              <button 
                  className="search-back-btn" 
                  onClick={() => setShowPlayer(false)}
              >
                  <FaArrowLeft /> Back
              </button>
              <RessoPlayer tracks={tracks} onLoadMore={loadMore} />
          </div>
      );
  }

  return (
    <div className='playlists-container search-results-container'>
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
        <div className="search-results-list" onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                loadMore();
            }
        }}>
          {tracks.map((track, index) => {
              const imgUrl = track.image ? (track.image[2]?.['#text'] || track.image[1]?.['#text'] || track.image[0]?.['#text']) : '';
              const artistName = typeof track.artist === 'string' ? track.artist : track.artist?.name;
              return (
                  <div className="search-result-item" key={index} onClick={() => handleTrackClick(index)}>
                      <img src={imgUrl} alt={track.name} className="search-result-img" />
                      <div className="search-result-info">
                          <h4>{track.name}</h4>
                          <p>{artistName}</p>
                      </div>
                      <div className="search-play-icon-container"><FaPlay className="search-play-icon" /></div>
                  </div>
              );
          })}
        </div>
      ) : (
        <div className="loader">Search for any song to start your Vibe!</div>
      )}
    </div>
  );
}
