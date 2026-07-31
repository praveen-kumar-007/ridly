import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Lib from '../lib/index'
import Player from '../player/index'
import Trend from '../trend/index'
import Feed from '../feed/index'
import Fav from '../fav/index'
import Search from '../search/index'
import Login from '../auth/login'
import Settings from '../settings/index'
import './home.css'
import Sidebar from '../../components/sidebar'
import { PlayerProvider } from '../../context/PlayerContext'

export default function Home() {
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('ridly_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const handleAuthAction = () => {
    localStorage.removeItem('ridly_user');
    setUser(null);
    setShowProfileModal(false);
  };

  if (!user) {
    return <Login onLogin={(userProfile) => setUser(userProfile)} />;
  }

  return (
    <PlayerProvider>
      <Router>
        <div className='main-body'>
          {/* Top Left Brand Logo */}
          <div className="top-left-brand">
            <img src="/logo.png" alt="Ravixa Music" />
          </div>

          {/* Top Right Profile Button */}
          <div 
             className="top-right-profile" 
             onClick={() => setShowProfileModal(true)}
             title="Profile"
          >
            <img src={user?.picture || 'https://ui-avatars.com/api/?name=U'} alt="Profile" />
          </div>

          {/* Premium Bottom Sheet Profile Menu */}
          {showProfileModal && (
            <div className="profile-sheet-overlay" onClick={() => setShowProfileModal(false)}>
              <div className="profile-sheet-content" onClick={e => e.stopPropagation()}>
                <div className="sheet-drag-handle"></div>
                
                <div className="sheet-header">
                  <img src={user?.picture || 'https://ui-avatars.com/api/?name=U'} alt="Profile" className="sheet-avatar" />
                  <div className="sheet-user-info">
                    <h2>{user?.isGuest ? 'Guest Account' : user?.name}</h2>
                    <p>{user?.isGuest ? 'Not logged in' : user?.email}</p>
                  </div>
                </div>

                <div className="sheet-body">
                  <p className="sheet-message">
                    {user?.isGuest 
                      ? 'Sign in to Ravixa to unlock personalized recommendations, sync your favorites, and join the community.' 
                      : 'Manage your taste profile, configure API settings, or sign out of your account.'}
                  </p>
                </div>

                <div className="sheet-actions">
                  <Link 
                    to="/settings" 
                    className="sheet-btn secondary-btn" 
                    style={{textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}} 
                    onClick={() => setShowProfileModal(false)}
                  >
                    ⚙️ API Settings
                  </Link>
                  <button 
                    className="sheet-btn primary-btn" 
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}} 
                    onClick={handleAuthAction}
                  >
                    {user?.isGuest ? '🔑 Log In to Ravixa' : '🚪 Log Out'}
                  </button>
                  <button 
                    className="sheet-btn secondary-btn" 
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}} 
                    onClick={() => setShowProfileModal(false)}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className='content-area'>
            <div className='main-content'>
              <Routes>
                <Route path="/mixes" element={<Lib/>} />
                <Route path="/" element={<Lib/>} />
                <Route path="/search" element={<Search/>} />
                <Route path="/favorites" element={<Fav/>} />
                <Route path="/feed" element={<Feed/>} />
                <Route path="/player" element={<Player/>} />
                <Route path="/trend" element={<Trend/>} />
                <Route path="/settings" element={<Settings/>} />
              </Routes>
          </div>
          </div>
        </div>
        <Sidebar /> {/* Moved outside main-body to fix mobile positioning */}
      </Router>
    </PlayerProvider>
  )
}
