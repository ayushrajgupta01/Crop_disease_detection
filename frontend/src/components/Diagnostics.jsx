import React, { useState } from 'react';

const Diagnostics = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      // Simulate/Trigger prediction
      handlePredict(file);
    }
  };

  const handlePredict = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Connecting to our existing ML service
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diagnostics-view">
      <header className="view-header">
        <h1>AI Crop Diagnostics</h1>
        <p>Scan your crop leaves to detect diseases instantly using computer vision.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="upload-zone">
            {selectedImage ? (
              <img src={selectedImage} alt="Crop" style={{ width: '100%', borderRadius: '12px' }} />
            ) : (
              <div>
                <span style={{ fontSize: '3rem' }}>📸</span>
                <p className="mt-4">Drop leaf photo here or click to upload</p>
                <input 
                  type="file" 
                  onChange={handleImageUpload} 
                  style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} 
                />
              </div>
            )}
          </div>
          {selectedImage && (
            <button 
              className="nav-item active" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setSelectedImage(null)}
            >
              Reset Scan
            </button>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Analysis Results</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner">🔄</div>
              <p>Analyzing leaf patterns...</p>
            </div>
          ) : prediction ? (
            <div className="results-content">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Detected Condition</p>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)' }}>{prediction.name}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Confidence</p>
                  <h3 style={{ color: 'var(--accent)' }}>{(prediction.confidence * 100).toFixed(1)}%</h3>
                </div>
              </div>

              <div className="mt-4">
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Treatment Protocol</h4>
                <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem' }}>
                  <p style={{ fontSize: '0.9rem' }}>{prediction.treatment}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Nutritional Optimization</h4>
                <div className="card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem' }}>
                  <p style={{ fontSize: '0.9rem' }}>{prediction.fertilizer}</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
              <p>Upload a clear photo of the infected leaf to start analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;
