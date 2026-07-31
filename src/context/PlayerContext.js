import React, { createContext, useState, useEffect } from 'react';
import { getYoutubeVideoId } from '../api';
import YouTube from 'react-youtube';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ridly_queue')) || []; } catch(e) { return []; }
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    try { return parseInt(localStorage.getItem('ridly_index')) || -1; } catch(e) { return -1; }
  });
  const [currentTrack, setCurrentTrack] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ridly_track')) || null; } catch(e) { return null; }
  });
  
  const [startTime, setStartTime] = useState(() => {
    try { return parseFloat(localStorage.getItem('ridly_time')) || 0; } catch(e) { return 0; }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => startTime);

  const [isShuffle, setIsShuffle] = useState(() => {
    try { return localStorage.getItem('ridly_shuffle') === 'true'; } catch(e) { return false; }
  });
  const [isRepeat, setIsRepeat] = useState(() => {
    try { return localStorage.getItem('ridly_repeat') === 'true'; } catch(e) { return false; }
  });
  const [isLoadingQueueTrack, setIsLoadingQueueTrack] = useState(false);
  
  const [ytPlayer, setYtPlayer] = useState(null);

  // Persist state when it changes
  useEffect(() => { localStorage.setItem('ridly_queue', JSON.stringify(queue)); }, [queue]);
  useEffect(() => { localStorage.setItem('ridly_index', currentIndex.toString()); }, [currentIndex]);
  useEffect(() => { if (currentTrack) localStorage.setItem('ridly_track', JSON.stringify(currentTrack)); }, [currentTrack]);
  useEffect(() => { localStorage.setItem('ridly_shuffle', isShuffle); }, [isShuffle]);
  useEffect(() => { localStorage.setItem('ridly_repeat', isRepeat); }, [isRepeat]);

  // Sync progress bar manually since YouTube API doesn't have timeupdate event
  useEffect(() => {
    let interval;
    if (isPlaying && ytPlayer) {
      interval = setInterval(async () => {
        try {
          const ct = await ytPlayer.getCurrentTime();
          const dur = await ytPlayer.getDuration();
          if (dur > 0) {
            setCurrentTime(ct);
            setDuration(dur);
            setProgress((ct / dur) * 100);
            localStorage.setItem('ridly_time', ct.toString());
          }
        } catch (e) {
            // Ignore error if player is destroyed or not ready
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, ytPlayer]);

  const onReady = (event) => {
    setYtPlayer(event.target);
  };

  const onStateChange = (event) => {
    // 0 = ended, 1 = playing, 2 = paused
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2) {
      setIsPlaying(false);
    } else if (event.data === 0) {
      if (isRepeat) {
        event.target.playVideo();
      } else {
        nextTrack();
      }
    }
  };

  const togglePlay = () => {
    if (!ytPlayer || !currentTrack) return;
    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  };

  const onError = (event) => {
    // If the video fails to load or play (due to quota, blocks, etc.), silently skip to the next song
    nextTrack();
  };

  const playPlaylist = async (tracks, startIndex = 0) => {
    setQueue(tracks);
    setCurrentIndex(startIndex);
    await loadTrackIntoPlayer(tracks[startIndex]);
  };

  const loadTrackIntoPlayer = async (track) => {
    setIsLoadingQueueTrack(true);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setStartTime(0); // Reset saved time for fresh tracks
    
    let youtubeId = track.youtubeId;
    const artistName = typeof track.artist === 'string' ? track.artist : (track.artist?.name || 'Unknown');

    // Taste Profile Tracker (Multi-User)
    try {
      if (artistName && artistName !== 'Unknown') {
        const storedUser = localStorage.getItem('ridly_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const historyKey = `ridly_play_history_${user.email}`;
          const historyStr = localStorage.getItem(historyKey) || '[]';
          let history = JSON.parse(historyStr);
          history.unshift(artistName); // Add to front
          history = history.slice(0, 50); // Keep last 50 plays
          localStorage.setItem(historyKey, JSON.stringify(history));
        }
      }
    } catch (e) {
      // Silently ignore taste profile errors
    }

    if (!youtubeId) {
      youtubeId = await getYoutubeVideoId(track.name, artistName);
    }
    
    setIsLoadingQueueTrack(false);
    
    if (youtubeId) {
      setCurrentTrack({ ...track, youtubeId });
      // The `<YouTube videoId={...} />` component will automatically load it.
    } else {
      nextTrack();
    }
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    let nextIdx = currentIndex;
    
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = currentIndex + 1;
      if (nextIdx >= queue.length) {
        nextIdx = 0; // Loop back
      }
    }
    setCurrentIndex(nextIdx);
    loadTrackIntoPlayer(queue[nextIdx]);
  };

  const prevTrack = () => {
    if (queue.length === 0) return;
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    setCurrentIndex(prevIdx);
    loadTrackIntoPlayer(queue[prevIdx]);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  const seek = (percentage) => {
    if (!ytPlayer || !duration) return;
    const time = (percentage / 100) * duration;
    ytPlayer.seekTo(time);
    setProgress(percentage);
    setCurrentTime(time);
  };

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // MediaSession API for lock screen and background playback
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      const artistName = typeof currentTrack.artist === 'string' ? currentTrack.artist : (currentTrack.artist?.name || 'Unknown');
      const imgUrl = currentTrack.image && currentTrack.image.length > 0 ? currentTrack.image[currentTrack.image.length - 1]['#text'] : '';
      
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: artistName,
        album: 'Ravixa Music',
        artwork: [
          { src: imgUrl || 'https://ravixa.vercel.app/logo.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
         if (ytPlayer) ytPlayer.playVideo();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
         if (ytPlayer) ytPlayer.pauseVideo();
      });
      navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, ytPlayer, queue, currentIndex, isShuffle, isRepeat]); 

  return (
    <PlayerContext.Provider value={{
      queue,
      currentTrack,
      isPlaying,
      progress,
      currentTime,
      duration,
      isLoadingQueueTrack,
      isShuffle,
      isRepeat,
      currentIndex,
      togglePlay,
      playPlaylist,
      nextTrack,
      prevTrack,
      toggleShuffle,
      toggleRepeat,
      seek,
      formatTime,
      setQueue
    }}>
      {children}
      {currentTrack && currentTrack.youtubeId && (
        <div style={{ display: 'none' }}>
          <YouTube 
            videoId={currentTrack.youtubeId} 
            opts={{
              playerVars: {
                autoplay: 1, // Auto-play when video loads
                controls: 0, // Hide controls
                playsinline: 1, // Crucial for iOS background playback
                start: Math.floor(startTime),
              }
            }}
            onReady={onReady}
            onStateChange={onStateChange}
            onError={onError}
          />
        </div>
      )}
    </PlayerContext.Provider>
  );
};
