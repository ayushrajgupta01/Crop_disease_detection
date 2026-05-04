import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Database, 
  Activity, 
  Camera, 
  Upload, 
  Zap, 
  Wind, 
  Droplets, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  Globe,
  Settings
} from 'lucide-react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [weather, setWeather] = useState(null);
  const [systemLogs, setSystemLogs] = useState([
    "System initialized...",
    "ML Engine linked successfully",
    "Satellite data sync complete"
  ]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(() => {
      const logs = ["Optimizing neural weights...", "Scanning soil sensors...", "Atmospheric sync active..."];
      setSystemLogs(prev => [logs[Math.floor(Math.random() * logs.length)], ...prev.slice(0, 4)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await axios.get(`${API_BASE}/weather`);
      setWeather(res.data);
    } catch (err) {
      console.error('Weather fetch failed');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const res = await axios.post(`${API_BASE}/predict`, formData);
      setResult(res.data);
    } catch (err) {
      alert('Analysis failed: Neural link timeout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="bg-mesh"></div>
      <div className="bg-grid"></div>

      {/* Header */}
      <header className="cyber-glass mx-4 mt-4 px-8 py-4 flex justify-between items-center z-50 sticky top-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center border border-primary/50 svg-glow">
            <Zap className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold mono tracking-tighter">CROP<span className="text-primary">GUARD</span>_v2.0</h1>
            <p className="text-[10px] text-text-muted mono">Neural Agricultural Interface</p>
          </div>
        </div>
        
        <div className="hidden lg:flex gap-10">
          {['ANALYSIS', 'SATELLITE', 'NETWORK', 'HISTORY'].map(item => (
            <a key={item} href="#" className="text-xs mono hover:text-primary transition-all flex items-center gap-2 group">
              <div className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all" />
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] text-primary mono">SYS_READY</span>
            <span className="text-[10px] text-text-muted mono">LATENCY: 24MS</span>
          </div>
          <button className="w-10 h-10 rounded border border-glass-border flex items-center justify-center hover:border-primary transition-all">
            <Settings className="w-4 h-4 text-text-muted hover:text-primary" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - System Logs & Stats */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <section className="cyber-glass p-6 cyber-card">
              <h3 className="text-xs mono mb-4 flex items-center gap-2 text-primary">
                <Activity size={14} /> LIVE_SYSTEM_LOGS
              </h3>
              <div className="space-y-3">
                {systemLogs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={i} 
                    className="text-[10px] mono text-text-muted flex gap-2 border-l border-primary/20 pl-2"
                  >
                    <span className="text-primary/50">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="cyber-glass p-6">
              <h3 className="text-xs mono mb-4 text-secondary">GLOBAL_SENSORS</h3>
              <div className="space-y-4">
                {[
                  { label: 'SOIL_PH', val: '6.8', icon: <Droplets size={14}/> },
                  { label: 'UV_INDEX', val: '4.2', icon: <Zap size={14}/> },
                  { label: 'CO2_LVL', val: '412', icon: <Wind size={14}/> }
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center border-b border-glass-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-secondary">{stat.icon}</span>
                      <span className="text-[11px] mono">{stat.label}</span>
                    </div>
                    <span className="text-[11px] mono font-bold">{stat.val}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Middle Column - Main Scanner */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <section className="cyber-glass p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Globe size={120} className="text-primary" />
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-light tracking-widest text-glow mb-2 uppercase">Core_Neural_Scanner</h2>
                <div className="h-[1px] w-20 bg-primary shadow-[0_0_10px_#00ff9d]"></div>
              </div>

              <div className="relative aspect-video rounded-lg border border-glass-border bg-black/40 overflow-hidden flex flex-col items-center justify-center group/input hover:border-primary/50 transition-all cursor-pointer">
                {preview ? (
                  <div className="relative w-full h-full">
                    <img src={preview} alt="Scanning" className="w-full h-full object-cover" />
                    {loading && <div className="scan-line"></div>}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center mb-4 mx-auto group-hover/input:scale-110 transition-all duration-500">
                      <Camera className="text-primary w-6 h-6" />
                    </div>
                    <p className="text-xs mono text-text-muted">READY_FOR_DATA_INPUT</p>
                    <p className="text-[9px] text-text-muted/50 mt-1">DRAG & DROP RAW IMAGE</p>
                  </div>
                )}
                <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={!selectedImage || loading}
                className="btn-cyber w-full mt-6 flex justify-center items-center gap-3 py-4"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    PROCESSING_NEURAL_LINK
                  </span>
                ) : (
                  <>START_ANALYSIS <ChevronRight size={16}/></>
                )}
              </button>

              {/* Result Modal */}
              <AnimatePresence>
                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 text-[8px] mono text-primary/50">SECURE_MATCH_FOUND</div>
                    <div className="flex items-center gap-4 mb-6">
                      <ShieldCheck className="text-primary w-8 h-8" />
                      <div>
                        <h4 className="text-xs mono text-primary">DETECTION_IDENTIFIED</h4>
                        <h3 className="text-xl font-bold tracking-tight">{result.name}</h3>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-[10px] mono text-text-muted">CONFIDENCE</p>
                        <p className="text-lg font-bold mono">{(result.confidence * 100).toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-black/40 rounded border border-glass-border">
                        <p className="text-[10px] mono text-accent mb-2 flex items-center gap-2">
                          <AlertTriangle size={10} /> TREATMENT_PROTOCOL
                        </p>
                        <p className="text-xs leading-relaxed text-text-muted">{result.treatment}</p>
                      </div>
                      <div className="p-4 bg-black/40 rounded border border-glass-border">
                        <p className="text-[10px] mono text-primary mb-2 flex items-center gap-2">
                          <Cpu size={10} /> NUTRIENT_OPTIMIZATION
                        </p>
                        <p className="text-xs leading-relaxed text-text-muted">{result.fertilizer}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          {/* Right Column - Weather & Intelligence */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <section className="cyber-glass p-6">
              <h3 className="text-xs mono mb-6 flex justify-between items-center">
                <span>ATMOSPHERIC_INTEL</span>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              </h3>
              
              {weather ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-4xl font-light mono">{weather.temp}°</p>
                      <p className="text-[10px] mono text-text-muted uppercase">{weather.condition}</p>
                    </div>
                    <div className="text-right">
                      <Wind className="text-primary mb-1 ml-auto" size={24} />
                      <p className="text-[10px] mono">14KM/H</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded border border-glass-border">
                      <Thermometer className="text-secondary mb-1" size={14} />
                      <p className="text-[8px] mono text-text-muted">PRESSURE</p>
                      <p className="text-xs mono font-bold">1012 hPa</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded border border-glass-border">
                      <Droplets className="text-secondary mb-1" size={14} />
                      <p className="text-[8px] mono text-text-muted">HUMIDITY</p>
                      <p className="text-xs mono font-bold">{weather.humidity}%</p>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 border border-primary/20 rounded text-[10px] mono leading-relaxed italic text-primary">
                    "SYSTEM_ALERT: {weather.alert}"
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 bg-white/5 rounded animate-pulse"></div>)}
                </div>
              )}
            </section>

            <section className="cyber-glass p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Database size={60} />
              </div>
              <h3 className="text-xs mono mb-4">NEURAL_RESOURCES</h3>
              <div className="space-y-4">
                <div className="group cursor-pointer">
                  <p className="text-[10px] mono text-text-muted mb-1 flex justify-between">
                    <span>DATABASE_SYNC</span>
                    <span>94%</span>
                  </p>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[94%] shadow-[0_0_5px_#00ff9d]"></div>
                  </div>
                </div>
                <div className="group cursor-pointer">
                  <p className="text-[10px] mono text-text-muted mb-1 flex justify-between">
                    <span>AI_LOAD</span>
                    <span>22%</span>
                  </p>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[22%]"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>

      <footer className="py-12 border-t border-glass-border text-center">
        <p className="text-[9px] mono text-text-muted tracking-[0.4em]">
          &copy; 2026 CROP_GUARD // DESIGNED_FOR_PLANETARY_EFFICIENCY
        </p>
      </footer>
    </div>
  );
}

export default App;
