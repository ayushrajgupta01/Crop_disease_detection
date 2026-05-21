import React, { useState } from 'react';
import Diagnostics from './components/Diagnostics';
import Community from './components/Community';
import AgroBot from './components/AgroBot';
import PlantLibrary from './components/PlantLibrary';
import Calculators from './components/Calculators';
import Environment from './components/Environment';

function App() {
  const [activeView, setActiveView] = useState('diagnostics');

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

        <div className="card mt-4" style={{ padding: '1rem', background: 'var(--primary-light)', border: 'none' }}>
          <p style={{ color: 'var(--primary-dark)', fontSize: '0.8rem', fontWeight: '600' }}>
            System Status: Optimal
          </p>
        </div>
      </aside>

      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
