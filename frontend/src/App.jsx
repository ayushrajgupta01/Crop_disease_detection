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
      <div className="landing-page">
        {/* Top Navbar */}
        <header className="landing-navbar">
          <div className="navbar-logo">
            <span>🛡️</span> CropGuard Pro
          </div>
          <nav className="navbar-links">
            <a href="#features">Features</a>
            <a href="#process">Process</a>
            <a href="#download">Mobile App</a>
          </nav>
          <a href="#auth-section" className="navbar-btn">Get Started</a>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">NEXT-GEN AGRONOMY</div>
            <h1>Precision Agriculture at Your Fingertips</h1>
            <p>
              Empowering global agriculture with AI-driven leaf diagnostics, 
              expert chatbot support, and a collaborative network of farmers.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => enterAsGuestWithView('diagnostics')}>
                Start Leaf Analysis →
              </button>
              <a href="#auth-section" className="btn-secondary">
                Join the Network
              </a>
            </div>
          </div>
          <div className="hero-image-container">
            <img 
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800" 
              alt="Precision Farming" 
              className="hero-image"
            />
          </div>
        </section>

        {/* Stat Bar */}
        <section className="stats-bar">
          <div className="stat-item">
            <h3>98.4%</h3>
            <p>DETECTION ACCURACY</p>
          </div>
          <div className="stat-item">
            <h3>15k+</h3>
            <p>ACTIVE FARMERS</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>AGROBOT SUPPORT</p>
          </div>
          <div className="stat-item">
            <h3>100%</h3>
            <p>SECURE DATA</p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="section-header">
            <h2>Intelligent Pillars of Growth</h2>
            <p>Our platform combines advanced machine learning with human expertise to ensure your harvest is smart and resilient.</p>
          </div>

          <div className="features-grid">
            {/* Card 1: Leaf Scanner */}
            <div className="feature-card main-feature" onClick={() => enterAsGuestWithView('diagnostics')}>
              <div className="card-info">
                <h3>🔍 AI Leaf Scanner</h3>
                <p>Real-time disease detection using our leaf scan model. Identify pests, fungi infections, and nutrient deficiencies with 98% accuracy in under a minute.</p>
                <div className="feature-badges">
                  <span>✓ Instant Analysis</span>
                  <span>✓ Localized treatment paths</span>
                </div>
              </div>
              <div className="card-mockup">
                <img src="https://images.unsplash.com/photo-1599933333668-b348981ba31e?w=500" alt="Scanner mockup" />
              </div>
            </div>

            {/* Card 2: AgroBot */}
            <div className="feature-card dark-card" onClick={() => enterAsGuestWithView('chatbot')}>
              <div className="card-info">
                <h3>🤖 AgroBot Chatbot</h3>
                <p>Multilingual chat support that answers your agricultural queries tailored to your specific region, crop types, and local soil conditions.</p>
                <button className="feature-btn">Open Assistant</button>
              </div>
            </div>

            {/* Card 3: Community */}
            <div className="feature-card pastel-card" onClick={() => enterAsGuestWithView('community')}>
              <div className="card-info">
                <h3>🤝 Farmers Community</h3>
                <p>A global network for shared knowledge. Share insights with peers, discuss crop diseases, and collaborate on risk mitigation.</p>
                <div className="avatar-stack">
                  <span className="avatar">👥</span>
                  <span className="avatar">👤</span>
                  <span className="avatar">🌾</span>
                  <span className="avatar-plus">+15k</span>
                </div>
              </div>
            </div>

            {/* Card 4: Precision Calculators */}
            <div className="feature-card" onClick={() => enterAsGuestWithView('calculators')}>
              <div className="card-info">
                <h3>🧮 Precision Calculators</h3>
                <p>Optimize your fertilizer dosages, water requirements, and crop harvest planning based on your unique field metrics.</p>
                <div className="metric-badges">
                  <div className="metric-badge">ROI Increase <strong>+24%</strong></div>
                  <div className="metric-badge">Water Saved <strong>-15%</strong></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="process-section">
          <div className="section-header">
            <h2>Science-Backed Process</h2>
            <p>Three simple steps to transition from vulnerability to professional field management with CropGuard Pro.</p>
          </div>

          <div className="process-steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Scan</h4>
              <p>Capture high-resolution images of your crops using our intuitive interface.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Analyze</h4>
              <p>Our AI engine processes the leaf pattern against millions of healthy and diseased samples.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Resolve</h4>
              <p>Receive an action-oriented treatment plan and connect with experts to implement immediate solutions.</p>
            </div>
          </div>
        </section>

        {/* Download App Section */}
        <section id="download" className="download-section">
          <div className="download-content">
            <h2>The Future of Farming in Your Pocket</h2>
            <p>
              Download the CropGuard app to access free monitoring, automated weather alerts, 
              and our full suite of precision tools anywhere, even offline.
            </p>
            <div className="store-buttons">
              <div className="store-badge">🤖 Google Play</div>
              <div className="store-badge">🍎 App Store</div>
            </div>
          </div>
          <div className="download-mockup">
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="phone-header">CropGuard Pro</div>
                <div className="phone-body">
                  <div className="metric-box">
                    <p>Field Health Score</p>
                    <h3>92%</h3>
                  </div>
                  <div className="scan-circle">🔍 Scan leaf</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication Section */}
        <section id="auth-section" className="auth-section">
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
        </section>

        {/* Footer Section */}
        <footer className="landing-footer">
          <div className="footer-cols">
            <div className="footer-col branding">
              <h4>🛡️ CropGuard Pro</h4>
              <p>Delivering precision technology and collaborative network tools to modern agriculture, for smart and resilient harvests.</p>
            </div>
            <div className="footer-col links">
              <h4>Platform</h4>
              <a href="#features" onClick={() => enterAsGuestWithView('diagnostics')}>AI Diagnostics</a>
              <a href="#features" onClick={() => enterAsGuestWithView('chatbot')}>AgroBot AI</a>
              <a href="#features" onClick={() => enterAsGuestWithView('community')}>Community Network</a>
            </div>
            <div className="footer-col links">
              <h4>Resources</h4>
              <a href="#features" onClick={() => enterAsGuestWithView('library')}>Plant Library</a>
              <a href="#features" onClick={() => enterAsGuestWithView('calculators')}>Agri-Calculators</a>
              <a href="#features" onClick={() => enterAsGuestWithView('environment')}>Weather Alerts</a>
            </div>
            <div className="footer-col newsletter">
              <h4>Get Started</h4>
              <p>Join thousands of farmers optimizing their crop yields today.</p>
              <a href="#auth-section" className="footer-cta-btn">Join Now</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} CropGuard Pro. All rights reserved.</p>
            <div className="footer-terms">
              <a href="#auth-section">Privacy Policy</a>
              <a href="#auth-section">Terms of Service</a>
            </div>
          </div>
        </footer>
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
