import React, { createContext, useState, useEffect } from 'react';
import { getYoutubeVideoId } from '../api';
import YouTube from 'react-youtube';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLoadingQueueTrack, setIsLoadingQueueTrack] = useState(false);
  
  const [ytPlayer, setYtPlayer] = useState(null);

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
      console.error("Taste profile tracker error", e);
    }

    if (!youtubeId) {
      youtubeId = await getYoutubeVideoId(track.name, artistName);
    }
    
    setIsLoadingQueueTrack(false);
    
    if (youtubeId) {
      setCurrentTrack({ ...track, youtubeId });
      // The `<YouTube videoId={...} />` component will automatically load it.
    } else {
      console.warn("No audio preview for track", track.name);
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
              }
            }}
            onReady={onReady}
            onStateChange={onStateChange}
          />
        </div>
      )}
    </PlayerContext.Provider>
  );
};
