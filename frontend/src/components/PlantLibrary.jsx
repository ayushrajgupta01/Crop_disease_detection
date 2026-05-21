import React, { useState } from 'react';
import { 
  X, 
  Sprout, 
  Droplets, 
  Sun, 
  Lightbulb, 
  Package, 
  GitFork, 
  Trees, 
  CloudRain, 
  Thermometer, 
  Layers, 
  Scissors, 
  AlertTriangle, 
  Sparkles,
  Calendar,
  Palette,
  Compass,
  Maximize2
} from 'lucide-react';

import plumImg from '../assets/plum.png';
import roseImg from '../assets/rose.png';
import tomatoImg from '../assets/tomato.png';
import riceImg from '../assets/rice.png';

const PlantLibrary = () => {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'requirements'
  const [showAllTopics, setShowAllTopics] = useState(false);

  const plants = [
    {
      id: 1,
      name: "Plum Tree",
      scientificName: "Prunus domestica",
      type: "Deciduous Fruit Tree",
      image: plumImg,
      overview: {
        summary: "A fruit-bearing tree known for its delicious plums, valued in many cultures.",
        water: "Plum trees require consistent moisture, particularly during fruit development. Water deeply to encourage deep root growth and apply mulch to retain soil moisture.",
        sunlight: "Full sunlight is essential for the plum tree to produce an abundant fruit yield. Adequate sunlight ensures proper fruit development and healthy foliage.",
        light: "Plum trees thrive in bright, direct light conditions, which support flowering and fruiting. Partially shaded areas may reduce fruit production.",
        fertilizer: "Apply a balanced fertilizer in early spring and late summer to promote healthy growth and fruiting. Avoid nitrogen-heavy fertilizers late in the season to prevent soft growth.",
        propagating: "Plum trees can be propagated through grafting, budding, or from seeds, though grafting ensures true-to-type varieties.",
        varieties: "Numerous plum varieties, ranging from European to Japanese, offer diversity in fruit size, flavor, and harvesting times. European plums are often used for prunes, while Japanese varieties are juicier.",
        humidity: "Plum trees tolerate a wide range of humidity levels but prefer moderate conditions. Extremely high humidity can lead to fungal issues.",
        temperatureAndHumidity: "Plum trees require a temperate climate with cold winters for dormancy and hot summers to ripen fruits. They are tolerant of mild frosts.",
        soil: "Well-draining, loamy soil rich in organic matter is ideal for plum trees, supporting root health and nutrient uptake.",
        pruning: "Pruning in late winter promotes healthy growth and air circulation. Remove dead or crossing branches to maintain an open canopy.",
        pottingAndRepotting: "While typically planted in the ground, dwarf varieties can be grown in containers. Repot every few years to refresh soil and manage root systems.",
        pestsAndDiseases: "Common pests include aphids and plum moths, while diseases like brown rot and plum pox virus can affect health. Regular inspections and prompt treatment are vital.",
        toxicity: "Plum pits contain cyanogenic compounds that can be toxic if consumed in large quantities.",
        howToGrow: "Start by planting a young tree in well-drained soil with full sun exposure. Regular watering and appropriate fertilization will boost growth, with pruning to maintain shape and health."
      },
      requirements: {
        temperature: "0-25°C",
        lighting: "Bright direct sunlight",
        humidity: "40-60%",
        plantType: "Deciduous tree",
        matureSize: "4-10 meters tall",
        sunExposure: "Full sun",
        soilType: "Loamy, well-drained",
        soilPh: "5.5-6.5",
        bloomTime: "Spring",
        color: "White to pink"
      }
    },
    {
      id: 2,
      name: "Rose",
      scientificName: "Rosa",
      type: "Flowering Ornamental Shrub",
      image: roseImg,
      overview: {
        summary: "An iconic woody perennial flowering shrub renowned for its beautiful, fragrant blossoms, thorn-covered stems, and rich symbolism.",
        water: "Roses need deep watering, typically 1 to 2 inches of water per week. Water at the soil level rather than sprinkling the leaves to prevent disease.",
        sunlight: "At least 6 to 8 hours of direct sunlight daily is essential. Adequate sunlight ensures strong canes, abundant flowering, and robust disease resistance.",
        light: "Thrives in full, direct sun. Morning sun is especially beneficial as it dries the dew off leaves quickly, minimizing fungal issues.",
        fertilizer: "Apply a balanced rose food or organic fertilizer in early spring as new growth starts, and after each flush of blooms. Stop fertilizing 6 weeks before the first frost.",
        propagating: "Easily propagated through softwood or hardwood stem cuttings, layering, or grafting onto hardy rootstocks.",
        varieties: "Thousands of varieties exist, including Hybrid Teas, Floribundas, climbing roses, shrub roses, and miniature roses, offering diverse colors and habits.",
        humidity: "Prefers moderate humidity. High humidity coupled with stagnant air can lead to black spot disease and powdery mildew.",
        temperatureAndHumidity: "Thrives in warm, temperate climates. Most garden roses are hardy, but some require winter protection in extremely cold climates.",
        soil: "Rich, well-draining loamy soil with plenty of organic matter (compost or aged manure) is ideal.",
        pruning: "Prune in late winter or early spring before growth begins. Remove dead, diseased, or crossing canes and cut back remaining healthy canes by one-third.",
        pottingAndRepotting: "Miniature and patio roses can be grown in containers. Repot every 2–3 years in fresh potting mix with good drainage holes.",
        pestsAndDiseases: "Aphids, spider mites, Japanese beetles, and black spot or powdery mildew are common. Treat with neem oil or organic fungicides.",
        toxicity: "Rose petals and hips are non-toxic and edible. However, watch out for the sharp thorns, which can cause skin punctures and infections.",
        howToGrow: "Plant in a sunny location with rich, well-draining soil. Mulch the base to retain moisture, water deeply weekly, and fertilize regularly during the growing season."
      },
      requirements: {
        temperature: "15-28°C",
        lighting: "Full direct sunlight",
        humidity: "50-60%",
        plantType: "Deciduous or evergreen shrub",
        matureSize: "1-6 feet (up to 20 feet for climbers)",
        sunExposure: "Full sun",
        soilType: "Rich, well-drained loam",
        soilPh: "6.0-6.8",
        bloomTime: "Spring to frost",
        color: "Red, pink, yellow, white, orange, purple"
      }
    },
    {
      id: 3,
      name: "Tomato",
      scientificName: "Solanum lycopersicum",
      type: "Annual Fruiting Herb",
      image: tomatoImg,
      overview: {
        summary: "A popular annual plant in the nightshade family cultivated globally for its savory, versatile red (and multi-colored) fruits.",
        water: "Requires 1-2 inches of water per week. Keep soil consistently moist but not waterlogged to prevent blossom end rot and fruit splitting.",
        sunlight: "Requires at least 6-8 hours of direct sun daily. More light yields sweeter, more plentiful fruit.",
        light: "Requires bright, direct sunlight. Indoor seedlings need artificial grow lights for 14-16 hours.",
        fertilizer: "Use a low-nitrogen, high-phosphorus fertilizer once flowers appear to encourage fruit set. Fertilize every 2-3 weeks during the season.",
        propagating: "Easily grown from seeds or by rooting side shoots (suckers) in water or moist soil.",
        varieties: "Classified as Determinate (bushy, ripens all at once) or Indeterminate (vining, fruits until frost), ranging from cherry to beefsteak.",
        humidity: "Thrives in moderate humidity (40-70%). Extremely high humidity can impede pollination and foster fungal blights.",
        temperatureAndHumidity: "Thrives in warm temperatures between 18-30°C. Cold nights below 10°C or hot days above 35°C will cause blossoms to drop.",
        soil: "Rich, loamy, well-draining soil with plenty of compost. Benefits from added calcium in the soil.",
        pruning: "For indeterminate varieties, prune lower leaves and suckers (shoots that grow in leaf crotches) to improve airflow and direct energy to fruit.",
        pottingAndRepotting: "Grow very well in 5-10 gallon pots. Plant tomatoes deep—burying up to 2/3 of the stem—as roots will grow from the buried stem.",
        pestsAndDiseases: "Aphids, tomato hornworms, blights, and fusarium wilt. Maintain good airflow and avoid watering leaves to prevent fungal infections.",
        toxicity: "Tomato leaves and stems contain solanine, a glycoalkaloid that is mildly toxic to humans, dogs, and cats if consumed in large quantities.",
        howToGrow: "Plant deeply in warm soil in a sunny spot. Support with stakes or cages. Water consistently at the base and feed regularly."
      },
      requirements: {
        temperature: "18-30°C",
        lighting: "Bright direct sunlight",
        humidity: "50-70%",
        plantType: "Annual vine or bush",
        matureSize: "3-10 feet tall",
        sunExposure: "Full sun",
        soilType: "Loamy, rich in organic matter",
        soilPh: "6.0-6.8",
        bloomTime: "Summer",
        color: "Yellow flowers; red, yellow, orange fruits"
      }
    },
    {
      id: 4,
      name: "Rice",
      scientificName: "Oryza sativa",
      type: "Staple Cereal Grass",
      image: riceImg,
      overview: {
        summary: "A staple grass cultivated in paddies globally, providing the primary source of food and carbohydrates for more than half the world's population.",
        water: "Extremely water-intensive. Needs deep flooding or consistent saturated conditions (usually 2-4 inches of water) during most of the vegetative phase.",
        sunlight: "Requires full, intense sunlight for optimal photosynthesis and grain filling.",
        light: "Thrives in bright, direct, unfiltered light. Short-day photoperiod triggers flowering in many traditional varieties.",
        fertilizer: "Highly responsive to nitrogen fertilizer, along with phosphorus and potassium, applied in split doses (at planting, tillering, and panicle initiation).",
        propagating: "Propagated by seeds, either sown directly in the field or raised in nurseries and transplanted into wet paddies.",
        varieties: "Categorized into Indica (long-grain, tropical), Japonica (short-grain, temperate), and aromatic types like Basmati and Jasmine.",
        humidity: "Requires high relative humidity (70-90%) during the growing season for optimal flowering and grain development.",
        temperatureAndHumidity: "Requires warm temperatures, ideally between 20-35°C. Cold temperatures below 15°C can cause sterile grains.",
        soil: "Heavy clay or clay-loam soils that can hold standing water are ideal. Fertile alluvial soils along river basins are excellent.",
        pruning: "No pruning is needed, but weeding is crucial. Traditional paddies use flooding to control weeds.",
        pottingAndRepotting: "Not typically grown in pots, but can be cultivated experimentally in large buckets filled with clay soil and kept filled with water.",
        pestsAndDiseases: "Stem borers, planthoppers, rice blast (fungal), and bacterial leaf blight. Proper crop rotation and resistant varieties are important.",
        toxicity: "Non-toxic. Raw rice grains contain trace enzymes that are deactivated when cooked. Cooked rice is highly safe.",
        howToGrow: "Sow seeds, transplant seedlings into flooded paddies, maintain water levels, fertilize, drain the water just before harvest, and dry the grains."
      },
      requirements: {
        temperature: "20-35°C",
        lighting: "Full direct sunlight",
        humidity: "70-90%",
        plantType: "Staple cereal grass",
        matureSize: "2-4 feet tall",
        sunExposure: "Full sun",
        soilType: "Clayey, water-retentive",
        soilPh: "5.5-7.0",
        bloomTime: "Late Summer / Autumn",
        color: "Green to golden brown grains"
      }
    }
  ];

  const toggleSelected = (plant) => {
    setSelectedPlant(plant);
    setActiveTab('overview');
    setShowAllTopics(false);
  };

  return (
    <div className="library-view">
      {!selectedPlant ? (
        <>
          <header className="view-header">
            <h1>Plant Encyclopedia</h1>
            <p>Explore detailed growing requirements, watering schedules, and care guides for crops.</p>
          </header>
          
          <div className="plant-grid">
            {plants.map((plant) => (
              <div 
                key={plant.id} 
                className="plant-card"
                onClick={() => toggleSelected(plant)}
              >
                <img src={plant.image} alt={plant.name} className="plant-card-image" />
                <div className="plant-card-content">
                  <h3 className="plant-card-title">{plant.name}</h3>
                  <span className="plant-card-type">{plant.type}</span>
                  <div className="plant-card-tags">
                    <span className="plant-tag">☀️ {plant.requirements.sunExposure}</span>
                    <span className="plant-tag">🧪 pH {plant.requirements.soilPh}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="plant-detail-container">
          {/* Hero Banner Section */}
          <div className="plant-detail-hero">
            <img src={selectedPlant.image} alt={selectedPlant.name} className="plant-detail-hero-img" />
            <button 
              className="plant-detail-close-btn"
              onClick={() => setSelectedPlant(null)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Details Content Overlay Sheet */}
          <div className="plant-detail-sheet">
            <div className="plant-detail-header">
              <h2 className="plant-detail-title">{selectedPlant.name}</h2>
              <span className="plant-detail-scientific">{selectedPlant.scientificName}</span>
            </div>

            {/* Tab Controller */}
            <div className="plant-tab-container">
              <button 
                className={`plant-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`plant-tab-btn ${activeTab === 'requirements' ? 'active' : ''}`}
                onClick={() => setActiveTab('requirements')}
              >
                Requirements
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' ? (
              <div className="plant-overview-section">
                {/* Sprout Overview Box */}
                <div className="plant-overview-banner">
                  <div className="plant-overview-banner-icon">
                    <Sprout size={20} />
                  </div>
                  <div>
                    <h4 className="plant-overview-banner-text">Overview</h4>
                    <p className="plant-overview-banner-desc">{selectedPlant.overview.summary}</p>
                  </div>
                </div>

                {/* Care topics list */}
                <div className="plant-overview-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  <div className="plant-info-block">
                    <div className="plant-info-icon-wrapper"><Droplets size={18} /></div>
                    <div className="plant-info-content">
                      <h4 className="plant-info-title">Water</h4>
                      <p className="plant-info-text">{selectedPlant.overview.water}</p>
                    </div>
                  </div>

                  <div className="plant-info-block">
                    <div className="plant-info-icon-wrapper"><Sun size={18} /></div>
                    <div className="plant-info-content">
                      <h4 className="plant-info-title">Sunlight</h4>
                      <p className="plant-info-text">{selectedPlant.overview.sunlight}</p>
                    </div>
                  </div>

                  {(showAllTopics || selectedPlant.name === 'Plum Tree') && (
                    <>
                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><Lightbulb size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">Light</h4>
                          <p className="plant-info-text">{selectedPlant.overview.light}</p>
                        </div>
                      </div>

                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><Package size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">Fertilizer</h4>
                          <p className="plant-info-text">{selectedPlant.overview.fertilizer}</p>
                        </div>
                      </div>

                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><GitFork size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">Propagating</h4>
                          <p className="plant-info-text">{selectedPlant.overview.propagating}</p>
                        </div>
                      </div>

                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><Trees size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">Varieties</h4>
                          <p className="plant-info-text">{selectedPlant.overview.varieties}</p>
                        </div>
                      </div>

                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><CloudRain size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">Humidity</h4>
                          <p className="plant-info-text">{selectedPlant.overview.humidity}</p>
                        </div>
                      </div>

                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><Thermometer size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">Temperature and Humidity</h4>
                          <p className="plant-info-text">{selectedPlant.overview.temperatureAndHumidity}</p>
                        </div>
                      </div>

                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><Layers size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">Soil</h4>
                          <p className="plant-info-text">{selectedPlant.overview.soil}</p>
                        </div>
                      </div>

                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><Scissors size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">Pruning</h4>
                          <p className="plant-info-text">{selectedPlant.overview.pruning}</p>
                        </div>
                      </div>

                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><Sprout size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">Potting and Repotting</h4>
                          <p className="plant-info-text">{selectedPlant.overview.pottingAndRepotting}</p>
                        </div>
                      </div>

                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><AlertTriangle size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">Pests and Diseases</h4>
                          <p className="plant-info-text">{selectedPlant.overview.pestsAndDiseases}</p>
                        </div>
                      </div>

                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><AlertTriangle size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">Toxicity</h4>
                          <p className="plant-info-text">{selectedPlant.overview.toxicity}</p>
                        </div>
                      </div>

                      <div className="plant-info-block">
                        <div className="plant-info-icon-wrapper"><Sparkles size={18} /></div>
                        <div className="plant-info-content">
                          <h4 className="plant-info-title">How to grow</h4>
                          <p className="plant-info-text">{selectedPlant.overview.howToGrow}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Show More / Show Less Toggle Button */}
                {selectedPlant.name !== 'Plum Tree' && (
                  <button 
                    className="btn-view-experts"
                    style={{ marginTop: '1.5rem', width: 'fit-content', alignSelf: 'center' }}
                    onClick={() => setShowAllTopics(!showAllTopics)}
                  >
                    {showAllTopics ? 'Show Less' : 'Show All Care Details'}
                  </button>
                )}
                
                {selectedPlant.name === 'Plum Tree' && (
                  <button 
                    className="btn-view-experts"
                    style={{ marginTop: '1.5rem', width: 'fit-content', alignSelf: 'center', backgroundColor: '#e2ebd5' }}
                  >
                    Show Less
                  </button>
                )}
              </div>
            ) : (
              /* Requirements Table Tab view */
              <div className="plant-req-section">
                <h3 className="sidebar-section-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  Plant Care Requirements
                </h3>
                
                <div className="plant-req-list">
                  <div className="plant-req-row">
                    <div className="plant-req-label-cell">
                      <Thermometer size={18} color="var(--primary)" />
                      Temperature
                    </div>
                    <div className="plant-req-value-cell">{selectedPlant.requirements.temperature}</div>
                  </div>

                  <div className="plant-req-row">
                    <div className="plant-req-label-cell">
                      <Lightbulb size={18} color="var(--primary)" />
                      Lighting
                    </div>
                    <div className="plant-req-value-cell">{selectedPlant.requirements.lighting}</div>
                  </div>

                  <div className="plant-req-row">
                    <div className="plant-req-label-cell">
                      <CloudRain size={18} color="var(--primary)" />
                      Humidity
                    </div>
                    <div className="plant-req-value-cell">{selectedPlant.requirements.humidity}</div>
                  </div>

                  <div className="plant-req-row">
                    <div className="plant-req-label-cell">
                      <Sprout size={18} color="var(--primary)" />
                      Plant Type
                    </div>
                    <div className="plant-req-value-cell">{selectedPlant.requirements.plantType}</div>
                  </div>

                  <div className="plant-req-row">
                    <div className="plant-req-label-cell">
                      <Maximize2 size={18} color="var(--primary)" />
                      Mature Size
                    </div>
                    <div className="plant-req-value-cell">{selectedPlant.requirements.matureSize}</div>
                  </div>

                  <div className="plant-req-row">
                    <div className="plant-req-label-cell">
                      <Sun size={18} color="var(--primary)" />
                      Sun Exposure
                    </div>
                    <div className="plant-req-value-cell">{selectedPlant.requirements.sunExposure}</div>
                  </div>

                  <div className="plant-req-row">
                    <div className="plant-req-label-cell">
                      <Layers size={18} color="var(--primary)" />
                      Soil Type
                    </div>
                    <div className="plant-req-value-cell">{selectedPlant.requirements.soilType}</div>
                  </div>

                  <div className="plant-req-row">
                    <div className="plant-req-label-cell">
                      <Compass size={18} color="var(--primary)" />
                      Soil pH
                    </div>
                    <div className="plant-req-value-cell">{selectedPlant.requirements.soilPh}</div>
                  </div>

                  <div className="plant-req-row">
                    <div className="plant-req-label-cell">
                      <Calendar size={18} color="var(--primary)" />
                      Bloom Time
                    </div>
                    <div className="plant-req-value-cell">{selectedPlant.requirements.bloomTime}</div>
                  </div>

                  <div className="plant-req-row">
                    <div className="plant-req-label-cell">
                      <Palette size={18} color="var(--primary)" />
                      Color
                    </div>
                    <div className="plant-req-value-cell">{selectedPlant.requirements.color}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantLibrary;
