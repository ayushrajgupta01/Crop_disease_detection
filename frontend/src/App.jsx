import React, { useState, useEffect } from 'react';
import Diagnostics from './components/Diagnostics';
import Community from './components/Community';
import AgroBot from './components/AgroBot';
import PlantLibrary from './components/PlantLibrary';
import Calculators from './components/Calculators';
import Environment from './components/Environment';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [activeView, setActiveView] = useState('diagnostics');
  
  // Auth & Session state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [continueAsGuest, setContinueAsGuest] = useState(false);

  // Form states on landing page
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sidebar sign-in modal for guest users
  const [showSidebarAuthModal, setShowSidebarAuthModal] = useState(false);

  // Check storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('crop_user_token');
    const savedUser = localStorage.getItem('crop_user');
    if (savedToken && savedUser) {
      setIsLoggedIn(true);
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('crop_user_token');
    localStorage.removeItem('crop_user');
    setIsLoggedIn(false);
    setUser(null);
    setToken('');
    setContinueAsGuest(false); // Reset to show landing page again
  };

  const handleAuthSubmit = async (e, fromModal = false) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = authMode === 'login' ? 'login' : 'signup';
    const body = authMode === 'login'
      ? { emailOrUsername, password }
      : { username, email, password, location };

    try {
      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }

      // Save token and user details
      localStorage.setItem('crop_user_token', data.token);
      localStorage.setItem('crop_user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      setIsLoggedIn(true);
      
      // Reset inputs
      setEmailOrUsername('');
      setUsername('');
      setEmail('');
      setPassword('');
      setLocation('');
      
      if (fromModal) {
        setShowSidebarAuthModal(false);
      }
    } catch (err) {
      setError('Connection to auth server failed.');
    } finally {
      setLoading(false);
    }
  };

  const enterAsGuestWithView = (viewId) => {
    setContinueAsGuest(true);
    setActiveView(viewId);
  };

  const navItems = [
    { id: 'diagnostics', label: 'AI Diagnostics', icon: '🔍' },
    { id: 'community', label: 'Farmers Hub', icon: '🤝' },
    { id: 'chatbot', label: 'AgroBot AI', icon: '🤖' },
    { id: 'library', label: 'Plant Library', icon: '🌿' },
    { id: 'calculators', label: 'Agri-Calculators', icon: '🧮' },
    { id: 'environment', label: 'Weather & Alerts', icon: '⛅' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'diagnostics': return <Diagnostics />;
      case 'community': return <Community />;
      case 'chatbot': return <AgroBot />;
      case 'library': return <PlantLibrary />;
      case 'calculators': return <Calculators />;
      case 'environment': return <Environment />;
      default: return <Diagnostics />;
    }
  };

  // 1. Render Landing Page if not logged in and not continuing as a guest
  if (!isLoggedIn && !continueAsGuest) {
    return (
      <div className="landing-container">
        {/* Left Side: Marketing and Features */}
        <div className="landing-hero">
          <div className="landing-brand">
            <span>🛡️</span> CropGuard Pro
          </div>

          <div className="landing-hero-content">
            <h2>AI-Powered Crop Diagnostics & Farmer Network</h2>
            <p>
              Analyze crop diseases instantly with AI, consult our conversational agricultural expert (AgroBot), 
              stay alert with localized weather warnings, and connect with fellow farmers globally.
            </p>

            <div className="landing-features">
              <div 
                className="landing-feature-card" 
                onClick={() => enterAsGuestWithView('diagnostics')} 
                style={{ cursor: 'pointer' }}
              >
                <h4>🔍 AI Diagnostics</h4>
                <p>Upload a photo of crop leaves to analyze infections instantly.</p>
              </div>
              <div 
                className="landing-feature-card" 
                onClick={() => enterAsGuestWithView('chatbot')} 
                style={{ cursor: 'pointer' }}
              >
                <h4>🤖 AgroBot Support</h4>
                <p>Chat with a dedicated AI trained in soil, crops, and pesticides.</p>
              </div>
              <div 
                className="landing-feature-card" 
                onClick={() => enterAsGuestWithView('community')} 
                style={{ cursor: 'pointer' }}
              >
                <h4>🤝 Farmers Hub</h4>
                <p>Discuss crop solutions, post updates, and share advice.</p>
              </div>
              <div 
                className="landing-feature-card" 
                onClick={() => enterAsGuestWithView('environment')} 
                style={{ cursor: 'pointer' }}
              >
                <h4>⛅ Weather Alerts</h4>
                <p>Receive real-time recommendations based on local metrics.</p>
              </div>
            </div>
          </div>

          <div className="landing-stats">
            <div className="landing-stat-item">
              <h3>98.4%</h3>
              <p>Detection Accuracy</p>
            </div>
            <div className="landing-stat-item">
              <h3>15k+</h3>
              <p>Active Farmers</p>
            </div>
            <div className="landing-stat-item">
              <h3>24/7</h3>
              <p>Expert AgroBot AI</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="landing-auth">
          <div className="landing-auth-card">
            <div className="landing-auth-header">
              <h3>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
              <p>{authMode === 'login' ? 'Sign in to access your farmer portal' : 'Register your farm and start analyzing'}</p>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={(e) => handleAuthSubmit(e, false)}>
              {authMode === 'login' ? (
                <>
                  <div className="form-group">
                    <label>Username or Email</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Ramesh"
                      value={emailOrUsername} 
                      onChange={e => setEmailOrUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="••••••••"
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Username</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Ramesh_K"
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="e.g. ramesh@example.com"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="Min 6 characters"
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Location / State</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Karnataka"
                      value={location} 
                      onChange={e => setLocation(e.target.value)} 
                    />
                  </div>
                </>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Register Farm'}
              </button>
            </form>

            <button className="guest-btn" onClick={() => setContinueAsGuest(true)}>
              Explore as Guest
            </button>

            <div className="auth-toggle">
              {authMode === 'login' ? (
                <p>New to CropGuard? <span onClick={() => { setAuthMode('signup'); setError(''); }}>Sign Up</span></p>
              ) : (
                <p>Already registered? <span onClick={() => { setAuthMode('login'); setError(''); }}>Sign In</span></p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Main Application Dashboard
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <span>🛡️</span> CropGuard Pro
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* Sidebar Auth / Session Widget */}
        <div className="card mt-4" style={{ padding: '1rem', background: 'var(--primary-light)', border: 'none' }}>
          {isLoggedIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: 'var(--primary-dark)', fontSize: '0.8rem', fontWeight: '700' }}>
                👤 {user?.username}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '-3px' }}>
                📍 {user?.location || 'General'}
              </p>
              <button 
                className="logout-btn" 
                onClick={handleLogout}
                style={{ fontSize: '0.75rem', textAlign: 'left', padding: '2px 0', marginTop: '4px', width: 'fit-content' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: 'var(--primary-dark)', fontSize: '0.8rem', fontWeight: '700' }}>
                Guest Mode
              </p>
              <button 
                className="submit-btn" 
                onClick={() => { setAuthMode('login'); setError(''); setShowSidebarAuthModal(true); }}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '8px' }}
              >
                Sign In / Join
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        {renderView()}
      </main>

      {/* Guest Mode Sidebar Auth Modal */}
      {showSidebarAuthModal && (
        <div className="modal-overlay" onClick={() => setShowSidebarAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{authMode === 'login' ? 'Sign In to CropGuard' : 'Create an Account'}</h3>
              <button className="close-btn" onClick={() => setShowSidebarAuthModal(false)}>&times;</button>
            </div>
            
            {error && <div className="alert-error">{error}</div>}
            
            <form onSubmit={(e) => handleAuthSubmit(e, true)}>
              {authMode === 'login' ? (
                <>
                  <div className="form-group">
                    <label>Username or Email</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={emailOrUsername} 
                      onChange={e => setEmailOrUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Username</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Location / State</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Karnataka" 
                      value={location} 
                      onChange={e => setLocation(e.target.value)} 
                    />
                  </div>
                </>
              )}
              
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>
            
            <div className="auth-toggle">
              {authMode === 'login' ? (
                <p>Don't have an account? <span onClick={() => { setAuthMode('signup'); setError(''); }}>Sign Up</span></p>
              ) : (
                <p>Already have an account? <span onClick={() => { setAuthMode('login'); setError(''); }}>Sign In</span></p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
