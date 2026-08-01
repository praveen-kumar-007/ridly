import React, { createContext, useState, useEffect, useRef } from 'react';
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
  const audioRef = useRef(null);

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
      if (audioRef.current) audioRef.current.play().catch(()=>{});
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    } else if (event.data === 2) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    } else if (event.data === 0) {
      if (audioRef.current) audioRef.current.pause();
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
      if (audioRef.current) audioRef.current.pause();
    } else {
      ytPlayer.playVideo();
      if (audioRef.current) audioRef.current.play().catch(()=>{});
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

  const cyclePlaybackMode = () => {
    if (!isShuffle && !isRepeat) {
      setIsRepeat(true);
      setIsShuffle(false);
    } else if (isRepeat && !isShuffle) {
      setIsRepeat(false);
      setIsShuffle(true);
    } else {
      setIsRepeat(false);
      setIsShuffle(false);
    }
  };

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
      const artistName = typeof currentTrack.artist === 'string' ? currentTrack.artist : (currentTrack.artist?.name || 'Ravixa Artist');
      const imgUrl = currentTrack.image && currentTrack.image.length > 0 ? (currentTrack.image[currentTrack.image.length - 1]['#text'] || currentTrack.image[0]['#text']) : '';
      
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: artistName,
        album: 'Ravixa Music',
        artwork: [
          { src: imgUrl || 'https://ravixa.vercel.app/logo.png', sizes: '512x512', type: 'image/png' },
          { src: imgUrl || 'https://ravixa.vercel.app/logo.png', sizes: '256x256', type: 'image/png' },
          { src: imgUrl || 'https://ravixa.vercel.app/logo.png', sizes: '128x128', type: 'image/png' }
        ]
      });

      const safeSetHandler = (action, handler) => {
        try { navigator.mediaSession.setActionHandler(action, handler); } catch (e) {}
      };

      safeSetHandler('play', () => {
        if (ytPlayer) ytPlayer.playVideo();
        if (audioRef.current) audioRef.current.play().catch(()=>{});
        setIsPlaying(true);
      });

      safeSetHandler('pause', () => {
        if (ytPlayer) ytPlayer.pauseVideo();
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      });

      safeSetHandler('previoustrack', prevTrack);
      safeSetHandler('nexttrack', nextTrack);

      safeSetHandler('seekto', (details) => {
        if (details.seekTime !== undefined && duration > 0) {
          seek((details.seekTime / duration) * 100);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, ytPlayer, queue, currentIndex, isShuffle, isRepeat, duration]);

  // Keep Lock Screen Position State updated in real time
  useEffect(() => {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(duration, 1),
          playbackRate: 1,
          position: Math.min(Math.max(currentTime, 0), duration)
        });
      } catch (e) {}
    }
  }, [currentTime, duration]); 

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
      cyclePlaybackMode,
      seek,
      formatTime,
      setQueue
    }}>
      {children}
      <audio 
        ref={audioRef} 
        src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAAACAAAMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDD/4BMgAAAAAANAAAAAAAAMAAAAAAAABAAAAAA" 
        loop 
        playsInline 
        style={{ display: 'none' }} 
      />
      {currentTrack && currentTrack.youtubeId && (
        <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}>
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
