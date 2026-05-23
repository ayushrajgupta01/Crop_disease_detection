import React, { useState } from 'react';

const Calculators = () => {
  const [activeCalc, setActiveCalc] = useState('farming');
  const [calcInputs, setCalcInputs] = useState({ area: 1, cost: 5000, yield: 20, price: 600 });
  
  const handleCalculate = () => {
    // Basic logic for demonstration
    const totalCost = calcInputs.area * calcInputs.cost;
    const totalRevenue = calcInputs.yield * calcInputs.price * calcInputs.area;
    const profit = totalRevenue - totalCost;
    return { profit, totalCost, totalRevenue };
  };

  const results = handleCalculate();

  return (
    <div className="calculators-view">
      <header className="view-header">
        <h1>Agri-Calculators</h1>
        <p>Optimize your resource usage and plan your farming budget with precision.</p>
      </header>

      <div className="flex gap-4 mb-8">
        {['farming', 'fertilizer', 'pesticide'].map(c => (
          <button 
            key={c}
            onClick={() => setActiveCalc(c)}
            className={`nav-item ${activeCalc === c ? 'active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >
            {c} Calculator
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Input Parameters</h3>
          <div className="mt-4">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Farm Area (Acres)</label>
            <input 
              type="number" 
              className="mt-1" 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} 
              value={calcInputs.area}
              onChange={(e) => setCalcInputs({...calcInputs, area: Number(e.target.value)})}
            />
          </div>
          <div className="mt-4">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Input Cost per Acre (Seeds, Labor, etc.)</label>
            <input 
              type="number" 
              className="mt-1" 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} 
              value={calcInputs.cost}
              onChange={(e) => setCalcInputs({...calcInputs, cost: Number(e.target.value)})}
            />
          </div>
          <div className="mt-4">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Yield (Quintals/Acre)</label>
            <input 
              type="number" 
              className="mt-1" 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} 
              value={calcInputs.yield}
              onChange={(e) => setCalcInputs({...calcInputs, yield: Number(e.target.value)})}
            />
          </div>
          <div className="mt-4">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Market Price per Quintal</label>
            <input 
              type="number" 
              className="mt-1" 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} 
              value={calcInputs.price}
              onChange={(e) => setCalcInputs({...calcInputs, price: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="card" style={{ background: results.profit >= 0 ? '#f0fdf4' : '#fef2f2' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Estimated Outcome</h3>
          
          <div className="flex justify-between items-center mb-6">
            <p>Total Estimated Profit</p>
            <h2 style={{ color: results.profit >= 0 ? 'var(--primary)' : '#ef4444' }}>
              ₹ {results.profit.toLocaleString()}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 border-t pt-8" style={{ borderTopColor: 'rgba(0,0,0,0.05)' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Input Budget</p>
              <h4 style={{ fontSize: '1.2rem' }}>₹ {results.totalCost.toLocaleString()}</h4>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expected Revenue</p>
              <h4 style={{ fontSize: '1.2rem' }}>₹ {results.totalRevenue.toLocaleString()}</h4>
            </div>
          </div>

          <div className="card mt-8" style={{ border: 'none', background: 'white' }}>
            <p style={{ fontSize: '0.85rem' }}>
              💡 <strong>Insight:</strong> To break even, you need to sell your crop at ₹ {(results.totalCost / (calcInputs.yield * calcInputs.area)).toFixed(2)} per quintal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculators;
