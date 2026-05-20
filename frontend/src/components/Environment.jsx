import React from 'react';

const Environment = () => {
  const weather = { temp: "32°C", condition: "Sunny", humidity: "45%", wind: "12 km/h", city: "Gangavathi, KA" };
  const alerts = [
    { id: 1, type: "High Risk", disease: "Rice Blast", message: "Weather conditions in your area are currently highly favorable for Rice Blast outbreak. Preventive spray recommended.", severity: "high" },
    { id: 2, type: "Caution", disease: "Tomato Late Blight", message: "Increased humidity expected next week. Monitor your tomato crops closely.", severity: "medium" }
  ];

  return (
    <div className="environment-view">
      <header className="view-header">
        <h1>Environment & Alerts</h1>
        <p>Real-time sync with your area's climate and disease risk factors.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="card" style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: 'white' }}>
          <div className="flex justify-between items-start">
            <div>
              <p style={{ opacity: 0.8 }}>Current Location</p>
              <h3>{weather.city}</h3>
            </div>
            <span style={{ fontSize: '3rem' }}>☀️</span>
          </div>
          
          <div className="mt-8">
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold' }}>{weather.temp}</h1>
            <p style={{ fontSize: '1.2rem' }}>{weather.condition}</p>
          </div>

          <div className="flex justify-between mt-8 pt-8 border-t" style={{ borderTopColor: 'rgba(255,255,255,0.2)' }}>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Humidity</p>
              <h4>{weather.humidity}</h4>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Wind Speed</p>
              <h4>{weather.wind}</h4>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Monsoon Forecast</p>
              <h4>On Time</h4>
            </div>
          </div>
        </div>

        <div className="alerts-container">
          <h2 style={{ marginBottom: '1.5rem' }}>Active Disease Alerts</h2>
          {alerts.map(alert => (
            <div key={alert.id} className="card" style={{ 
              marginBottom: '1rem', 
              borderLeft: `6px solid ${alert.severity === 'high' ? '#ef4444' : '#f59e0b'}`,
              background: alert.severity === 'high' ? '#fef2f2' : '#fffbeb'
            }}>
              <div className="flex justify-between items-center mb-2">
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  color: alert.severity === 'high' ? '#ef4444' : '#d97706',
                  textTransform: 'uppercase'
                }}>
                  🚨 {alert.type}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Just Now</span>
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Potential {alert.disease} Outbreak</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{alert.message}</p>
              <button className="mt-4" style={{ background: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                View Action Plan →
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-8">
        <h3>Monsoon & Long-term Forecast</h3>
        <div className="grid grid-cols-4 gap-4 mt-4">
           {['May', 'Jun', 'Jul', 'Aug'].map(month => (
             <div key={month} style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{month}</p>
                <span style={{ fontSize: '1.5rem', margin: '0.5rem 0', display: 'block' }}>🌧️</span>
                <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Normal</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Environment;
