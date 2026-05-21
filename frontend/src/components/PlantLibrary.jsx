import React, { useState } from 'react';

const PlantLibrary = () => {
  const [selectedPlant, setSelectedPlant] = useState(null);

  const plants = [
    {
      id: 1, name: "Rose", type: "Flowering Shrub", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400",
      overview: { water: "Medium (1-2 inches/week)", light: "Full Sun", humidity: "Moderate", soil: "Well-drained, Loamy" },
      requirements: { ph: "6.0 - 6.5", bloom: "Spring to Fall", size: "1-6 ft", zone: "5-9" }
    },
    {
      id: 2, name: "Rice", type: "Cereal Grain", image: "https://images.unsplash.com/photo-1536630596251-b01c62536286?auto=format&fit=crop&q=80&w=400",
      overview: { water: "High (Submerged)", light: "Full Sun", humidity: "High", soil: "Clay-heavy, Alluvial" },
      requirements: { ph: "5.5 - 7.0", bloom: "Panicle initiation", size: "2-4 ft", zone: "9-11" }
    },
    {
      id: 3, name: "Tomato", type: "Vegetable", image: "https://images.unsplash.com/photo-1592840331052-16e15c2c6f95?auto=format&fit=crop&q=80&w=400",
      overview: { water: "Moderate to High", light: "Full Sun", humidity: "Medium", soil: "Rich, well-drained" },
      requirements: { ph: "6.2 - 6.8", bloom: "Summer", size: "3-10 ft", zone: "2-10" }
    },
  ];

  return (
    <div className="library-view">
      <header className="view-header">
        <h1>Plant Encyclopedia</h1>
        <p>Explore detailed growing requirements and care guides for various crops and plants.</p>
      </header>

      {selectedPlant ? (
        <div className="plant-detail">
          <button onClick={() => setSelectedPlant(null)} style={{ marginBottom: '1rem', background: 'none', color: 'var(--primary)', fontWeight: 'bold' }}>
            ← Back to Library
          </button>
          <div className="grid grid-cols-2 gap-4">
            <img src={selectedPlant.image} alt={selectedPlant.name} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '20px' }} />
            <div className="card">
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{selectedPlant.name}</h2>
              <span className="nav-item active" style={{ width: 'fit-content', padding: '0.2rem 0.8rem', fontSize: '0.8rem' }}>{selectedPlant.type}</span>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Growth Overview</h4>
                  <ul style={{ listStyle: 'none', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    <li>💧 {selectedPlant.overview.water}</li>
                    <li>☀️ {selectedPlant.overview.light}</li>
                    <li>🌡️ {selectedPlant.overview.humidity}</li>
                    <li>🌱 {selectedPlant.overview.soil}</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Care Requirements</h4>
                  <ul style={{ listStyle: 'none', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    <li>🧪 Soil pH: {selectedPlant.requirements.ph}</li>
                    <li>🌸 Bloom: {selectedPlant.requirements.bloom}</li>
                    <li>📏 Size: {selectedPlant.requirements.size}</li>
                    <li>🗺️ Zone: {selectedPlant.requirements.zone}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {plants.map(plant => (
            <div key={plant.id} className="card" onClick={() => setSelectedPlant(plant)} style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}>
              <img src={plant.image} alt={plant.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '1.2rem' }}>
                <h3 style={{ marginBottom: '0.2rem' }}>{plant.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{plant.type}</p>
                <div className="flex gap-2 mt-4">
                  <div style={{ fontSize: '0.7rem', background: 'var(--bg-main)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>☀️ Full Sun</div>
                  <div style={{ fontSize: '0.7rem', background: 'var(--bg-main)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>🧪 pH {plant.requirements.ph}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantLibrary;
