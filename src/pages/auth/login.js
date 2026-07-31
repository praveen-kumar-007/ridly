import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import './login.css';

export default function Login({ onLogin }) {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';

  const handleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const userProfile = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture
      };
      localStorage.setItem('ridly_user', JSON.stringify(userProfile));
      if (onLogin) onLogin(userProfile);
    } catch (err) {
      console.error("Failed to decode JWT:", err);
    }
  };

  const handleGuest = () => {
    const userProfile = {
      name: "Guest User",
      email: "guest@ridly.app",
      picture: "https://ui-avatars.com/api/?name=Guest&background=333&color=fff",
      isGuest: true
    };
    localStorage.setItem('ridly_user', JSON.stringify(userProfile));
    if (onLogin) onLogin(userProfile);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className='login-page'>
        <div className="login-card glass-panel">
          <h1 className="login-title">Welcome to Ravixa</h1>
          <p className="login-subtitle">Sign in to synchronize your premium taste profile</p>
          <div className="google-btn-container" style={{ marginTop: '20px' }}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.error('Login Failed')}
              theme="filled_black"
              shape="pill"
            />
          </div>
          <button className="skip-guest-btn" onClick={handleGuest}>
             Skip & Continue as Guest
          </button>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
