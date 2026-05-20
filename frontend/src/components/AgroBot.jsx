import React, { useState } from 'react';

const AgroBot = () => {
  const [language, setLanguage] = useState('English');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello Farmer! I am AgroBot. How can I help you today with your crops?' }
  ]);
  const [input, setInput] = useState('');

  const languages = ['English', 'Hindi', 'Marathi', 'Telugu', 'Tamil', 'Punjabi'];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: "I am analyzing your query. For better precision, please ensure you specify the crop stage." }]);
    }, 1000);
    setInput('');
  };

  return (
    <div className="chatbot-view" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <header className="view-header">
        <h1>AgroBot AI</h1>
        <p>Ask anything about disease prevention and crop care in your language.</p>
        
        <div className="flex gap-4 mt-4">
          {languages.map(lang => (
            <button 
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                background: language === lang ? 'var(--primary)' : 'white',
                color: language === lang ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--border)'
              }}
            >
              {lang}
            </button>
          ))}
        </div>
      </header>

      <div className="card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '1rem', background: '#fdfdfd' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '1rem' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1rem' 
            }}>
              <div style={{ 
                maxWidth: '70%', 
                padding: '0.8rem 1.2rem', 
                borderRadius: '15px',
                background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-main)',
                color: m.role === 'user' ? 'white' : 'var(--text-main)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <input 
            type="text" 
            placeholder={`Ask in ${language}...`}
            style={{ flexGrow: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            className="nav-item active" 
            style={{ borderRadius: '12px', padding: '1rem' }}
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgroBot;
