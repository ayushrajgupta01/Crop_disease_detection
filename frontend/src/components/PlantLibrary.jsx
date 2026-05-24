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
      id: 2, name: "Rice", type: "Cereal Grain", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
      overview: { water: "High (Flooded fields)", light: "Full Sun", humidity: "High (70-90%)", soil: "Clayey, Alluvial" },
      requirements: { ph: "5.5 - 7.0", bloom: "Summer/Autumn", size: "1 - 1.8 m", zone: "9-12" }
    },
    {
      id: 3, name: "Tomato", type: "Vegetable", image: "https://images.unsplash.com/photo-1558818498-28c1e002b655?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Regular, deep watering", light: "Full Sun", humidity: "Moderate (50-70%)", soil: "Loamy, rich, well-drained" },
      requirements: { ph: "6.2 - 6.8", bloom: "Summer", size: "1 - 3 m", zone: "5-11" }
    },
    {
      id: 4, name: "Potato", type: "Tuber Vegetable", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Consistent moisture", light: "Full Sun", humidity: "Moderate (50-60%)", soil: "Loose, sandy-loam" },
      requirements: { ph: "5.0 - 6.0", bloom: "Early Summer", size: "0.6 - 1 m", zone: "3-10" }
    },
    {
      id: 5, name: "Lemon", type: "Citrus Fruit", image: "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Deep, infrequent watering", light: "Full Sun", humidity: "Moderate (50-70%)", soil: "Sandy loam, well-draining" },
      requirements: { ph: "5.5 - 6.5", bloom: "Year-round", size: "3 - 6 m", zone: "9-11" }
    },
    {
      id: 6, name: "Bell Pepper", type: "Vegetable", image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Regular, even moisture", light: "Full Sun", humidity: "Moderate (50-65%)", soil: "Rich, loamy, well-draining" },
      requirements: { ph: "6.0 - 6.8", bloom: "Summer", size: "0.6 - 1 m", zone: "9-11" }
    },
    {
      id: 7, name: "Corn", type: "Cereal Grass", image: "https://images.unsplash.com/photo-1624981015149-e01395f1d774?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Steady moisture", light: "Full Sun", humidity: "Moderate (50-60%)", soil: "Well-draining, fertile loam" },
      requirements: { ph: "5.8 - 6.8", bloom: "Mid Summer", size: "1.5 - 2.5 m", zone: "4-11" }
    },
    {
      id: 8, name: "Wheat", type: "Cereal Grain", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Moderate moisture", light: "Full Sun", humidity: "Dry to Moderate", soil: "Silt or clay loam" },
      requirements: { ph: "6.0 - 7.0", bloom: "Late Spring", size: "0.6 - 1.2 m", zone: "3-10" }
    },
    {
      id: 9, name: "Cotton", type: "Fiber Crop", image: "https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Moderate, regular irrigation", light: "Full Sun", humidity: "Moderate (40-60%)", soil: "Deep, fertile loam" },
      requirements: { ph: "5.8 - 7.5", bloom: "Summer", size: "1 - 1.5 m", zone: "8-11" }
    },
    {
      id: 10, name: "Soybean", type: "Legume", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Moderate moisture", light: "Full Sun", humidity: "Moderate (50-70%)", soil: "Rich, well-draining loam" },
      requirements: { ph: "6.0 - 6.8", bloom: "Mid Summer", size: "0.6 - 1.2 m", zone: "3-11" }
    },
    {
      id: 11, name: "Pepper", type: "Vegetable", image: "https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Deep, moderate watering", light: "Full Sun", humidity: "Moderate (50-60%)", soil: "Rich, loamy, well-draining" },
      requirements: { ph: "6.0 - 6.8", bloom: "Summer", size: "0.5 - 0.9 m", zone: "9-11" }
    },
    {
      id: 12, name: "Onion", type: "Bulb Vegetable", image: "https://images.unsplash.com/photo-1573130447734-0b5a799d27a6?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Shallow, regular watering", light: "Full Sun", humidity: "Dry to Moderate", soil: "Loose, sandy loam" },
      requirements: { ph: "6.0 - 6.8", bloom: "Early Summer", size: "30 - 45 cm", zone: "3-9" }
    },
    {
      id: 13, name: "Tea", type: "Evergreen Shrub", image: "https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Regular, even watering", light: "Full Sun to Partial Shade", humidity: "High (70-85%)", soil: "Highly acidic sandy loam" },
      requirements: { ph: "4.5 - 5.5", bloom: "Autumn", size: "1 - 2 m", zone: "7-9" }
    },
    {
      id: 14, name: "Chili", type: "Vegetable / Spice", image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=600",
      overview: { water: "Regular, deep watering", light: "Full Sun", humidity: "Moderate (50-65%)", soil: "Rich, fertile, well-draining" },
      requirements: { ph: "6.0 - 6.8", bloom: "Summer", size: "0.6 - 1.2 m", zone: "9-11" }
    }
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
                  <div style={{ fontSize: '0.7rem', background: 'var(--bg-main)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>☀️ {plant.overview.light}</div>
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
