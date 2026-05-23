import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  Modal,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  Leaf, 
  X,
  Droplet,
  Sun,
  Lightbulb,
  Compass,
  Layers,
  Scissors,
  Bug,
  Thermometer,
  CloudRain,
  Globe,
  Tag,
  Calendar,
  Palette,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { cropsData } from '../data/cropsData';

const getSectionStyle = (title) => {
  switch (title.toLowerCase()) {
    case 'water':
      return { emoji: '💧', bg: '#eff6ff' };
    case 'sunlight':
      return { emoji: '☀️', bg: '#fffbeb' };
    case 'light':
      return { emoji: '💡', bg: '#fefce8' };
    case 'fertilizer':
      return { emoji: '🪴', bg: '#f0fdf4' };
    case 'propagating':
      return { emoji: '🌱', bg: '#f2fbf9' };
    case 'varieties':
      return { emoji: '🌿', bg: '#f5f3ff' };
    case 'humidity':
      return { emoji: '🌧️', bg: '#eff6ff' };
    case 'temperature and humidity':
      return { emoji: '🌡️', bg: '#fef2f2' };
    case 'soil':
      return { emoji: '🌱', bg: '#fef3c7' };
    case 'pruning':
      return { emoji: '✂️', bg: '#f9fafb' };
    case 'potting and repotting':
      return { emoji: '🪴', bg: '#fdf2f8' };
    case 'pests and diseases':
      return { emoji: '🐛', bg: '#fff7ed' };
    case 'toxicity':
      return { emoji: '⚠️', bg: '#fff1f2' };
    case 'how to grow':
      return { emoji: '💡', bg: '#fefce8' };
    default:
      return { emoji: '🌱', bg: '#f1f5f9' };
  }
};

const PlantLibraryScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllOverview, setShowAllOverview] = useState(false);
  const [showAllRequirements, setShowAllRequirements] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const plants = Object.values(cropsData);
  const filteredPlants = plants.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleOpenCrop = (crop) => {
    setSelectedCrop(crop);
    setActiveTab('overview');
    setShowAllOverview(false);
    setShowAllRequirements(false);
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Healthy':
        return { bg: '#dcfce7', text: '#166534' };
      case 'Warning':
        return { bg: '#fef3c7', text: '#92400e' };
      default:
        return { bg: '#fee2e2', text: '#991b1b' };
    }
  };

  const renderOverviewTab = (crop) => {
    const visibleSections = showAllOverview ? crop.overview : crop.overview.slice(0, 3);

    return (
      <View style={styles.overviewContainer}>
        {/* Overview Box Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryHeaderRow}>
            <View style={styles.summaryIconWrapper}>
              <Text style={{ fontSize: 18 }}>🔍</Text>
            </View>
            <Text style={styles.summaryTitle}>Overview</Text>
          </View>
          <Text style={styles.summaryText}>{crop.overviewSummary}</Text>
        </View>

        {/* Detailed Sections list */}
        {visibleSections.map((item, index) => {
          const styleConfig = getSectionStyle(item.title);

          return (
            <View key={index} style={styles.sectionItem}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: styleConfig.bg }]}>
                  <Text style={{ fontSize: 18 }}>{styleConfig.emoji}</Text>
                </View>
                <Text style={styles.sectionTitleText}>{item.title}</Text>
              </View>
              <Text style={styles.sectionDescText}>{item.description}</Text>
            </View>
          );
        })}

        {/* Show More / Show Less Button */}
        <TouchableOpacity 
          style={styles.toggleCollapseBtn}
          onPress={() => setShowAllOverview(!showAllOverview)}
        >
          <Text style={styles.toggleCollapseText}>
            {showAllOverview ? 'Show Less' : 'Show More'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRequirementsTab = (crop) => {
    const visibleRequirements = showAllRequirements 
      ? crop.requirements 
      : crop.requirements.slice(0, 6);

    return (
      <View style={styles.requirementsContainer}>
        <Text style={styles.reqsHeaderTitle}>Plant Care Requirements</Text>
        
        {visibleRequirements.map((req, index) => {
          const styleConfig = getRequirementIconStyle(req.label);

          return (
            <View key={index} style={styles.reqRowCard}>
              <View style={[styles.reqIconWrapper, { backgroundColor: styleConfig.bg }]}>
                <Text style={{ fontSize: 16 }}>{styleConfig.emoji}</Text>
              </View>
              <Text style={styles.reqLabel}>{req.label}</Text>
              <Text style={styles.reqValue}>{req.value}</Text>
            </View>
          );
        })}

        {/* Show More / Show Less Button */}
        <TouchableOpacity 
          style={styles.toggleCollapseBtn}
          onPress={() => setShowAllRequirements(!showAllRequirements)}
        >
          <Text style={styles.toggleCollapseText}>
            {showAllRequirements ? 'Show Less' : 'Show More'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getRequirementIconStyle = (label) => {
    switch (label.toLowerCase()) {
      case 'temperature':
        return { emoji: '🌡️', bg: '#fee2e2' };
      case 'lighting':
        return { emoji: '💡', bg: '#fefce8' };
      case 'humidity':
        return { emoji: '💧', bg: '#eff6ff' };
      case 'plant type':
        return { emoji: '🌱', bg: '#f2fbf9' };
      case 'mature size':
        return { emoji: '🌍', bg: '#f2fbf9' };
      case 'sun exposure':
        return { emoji: '☀️', bg: '#fffbeb' };
      case 'soil type':
        return { emoji: '🌱', bg: '#fef3c7' };
      case 'soil ph':
        return { emoji: '🧪', bg: '#f0fdf4' };
      case 'bloom time':
        return { emoji: '📅', bg: '#fffbeb' };
      case 'color':
        return { emoji: '🎨', bg: '#fdf2f8' };
      case 'hardiness zones':
        return { emoji: '🏔️', bg: '#f0fdf4' };
      case 'native area':
        return { emoji: '📍', bg: '#fffbeb' };
      case 'hibernation':
        return { emoji: '🌦️', bg: '#eff6ff' };
      case 'toxicity':
        return { emoji: '☠️', bg: '#fef2f2' };
      case 'common name':
        return { emoji: '🏷️', bg: '#fdf2f8' };
      case 'difficulty':
        return { emoji: '📶', bg: '#f1f5f9' };
      default:
        return { emoji: '🌱', bg: '#f1f5f9' };
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Plant Library</Text>
          <Text style={styles.subtitle}>Comprehensive database for crop management.</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search crops, varieties..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Encyclopedia Crops</Text>
          {filteredPlants.map(plant => {
            const statusConfig = getStatusStyle(plant.status);
            return (
              <TouchableOpacity 
                key={plant.id} 
                style={styles.plantCard}
                onPress={() => handleOpenCrop(plant)}
              >
                {imageErrors[plant.id] ? (
                  <View style={[styles.plantThumbnail, styles.imageFallbackContainer]}>
                    <Leaf size={24} color="#0d9488" />
                  </View>
                ) : (
                  <Image 
                    source={{ uri: plant.image }} 
                    style={styles.plantThumbnail} 
                    onError={() => handleImageError(plant.id)}
                  />
                )}
                <View style={styles.plantInfo}>
                  <Text style={styles.plantName}>{plant.name}</Text>
                  <Text style={styles.plantVariety}>{plant.variety} • {plant.family}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.statusText, { color: statusConfig.text }]}>{plant.status}</Text>
                </View>
                <ChevronRight size={20} color={Colors.border} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Expert Guides</Text>
            <Text style={styles.viewAll}>View All</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guideScroll}>
            {[
              { id: 1, title: 'Organic Pest Control', time: '5 min read' },
              { id: 2, title: 'Soil pH Management', time: '8 min read' },
              { id: 3, title: 'Irrigation Timing', time: '4 min read' }
            ].map(guide => (
              <TouchableOpacity key={guide.id} style={styles.guideCard}>
                <BookOpen size={24} color={Colors.primary} />
                <Text style={styles.guideTitle}>{guide.title}</Text>
                <Text style={styles.guideTime}>{guide.time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Details View Modal */}
      {selectedCrop && (
        <Modal
          visible={selectedCrop !== null}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setSelectedCrop(null)}
        >
          <View style={styles.modalContainer}>
            <ScrollView 
              style={styles.modalScrollView} 
              bounces={false} 
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Image */}
              <View style={styles.heroImageContainer}>
                {imageErrors[selectedCrop.id] ? (
                  <View style={[styles.heroImage, styles.heroFallbackContainer]}>
                    <Leaf size={64} color="#0d9488" />
                  </View>
                ) : (
                  <Image 
                    source={{ uri: selectedCrop.image }} 
                    style={styles.heroImage} 
                    onError={() => handleImageError(selectedCrop.id)}
                  />
                )}
                {/* Overlaid X button */}
                <TouchableOpacity 
                  style={styles.closeBtnOverlay}
                  onPress={() => setSelectedCrop(null)}
                >
                  <X size={20} color="#0f172a" />
                </TouchableOpacity>
              </View>

              {/* Main Content Profile Sheet */}
              <View style={styles.profileSheet}>
                <Text style={styles.profileTitle}>{selectedCrop.name}</Text>
                <Text style={styles.profileScientificName}>{selectedCrop.scientificName}</Text>

                {/* Tabs selection pills */}
                <View style={styles.tabsRow}>
                  <TouchableOpacity 
                    style={[styles.tabPill, activeTab === 'overview' && styles.tabPillActive]}
                    onPress={() => setActiveTab('overview')}
                  >
                    <Text style={[styles.tabPillText, activeTab === 'overview' && styles.tabPillTextActive]}>
                      Overview
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.tabPill, activeTab === 'requirements' && styles.tabPillActive]}
                    onPress={() => setActiveTab('requirements')}
                  >
                    <Text style={[styles.tabPillText, activeTab === 'requirements' && styles.tabPillTextActive]}>
                      Requirements
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Dashed separator */}
                <View style={styles.dashedDivider} />

                {/* Tab content rendering */}
                {activeTab === 'overview' 
                  ? renderOverviewTab(selectedCrop) 
                  : renderRequirementsTab(selectedCrop)
                }

                <View style={{ height: 60 }} />
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textMain,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 5,
  },
  searchContainer: {
    margin: 20,
    marginTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginBottom: 15,
  },
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  plantThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textMain,
  },
  plantVariety: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  guideScroll: {
    flexDirection: 'row',
  },
  guideCard: {
    width: 150,
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 20,
    marginRight: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginTop: 10,
    marginBottom: 5,
  },
  guideTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },

  /* Modal Details Styles */
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalScrollView: {
    flex: 1,
  },
  heroImageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  closeBtnOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSheet: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 32,
    minHeight: 500,
  },
  profileTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileScientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#64748b',
    marginTop: 4,
    marginBottom: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tabPill: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  tabPillActive: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
  },
  tabPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabPillTextActive: {
    color: '#0d9488',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 1,
    marginBottom: 20,
    marginTop: 4,
  },

  /* Overview Tab Content Styles */
  overviewContainer: {
    flex: 1,
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 24,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  summaryText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  sectionItem: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionDescText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginTop: 6,
  },
  toggleCollapseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  toggleCollapseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
  },

  /* Requirements Tab Content Styles */
  requirementsContainer: {
    flex: 1,
  },
  reqsHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  reqRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  reqIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reqLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    marginRight: 12,
  },
  reqValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'right',
    flexShrink: 1,
  },
  imageFallbackContainer: {
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  heroFallbackContainer: {
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    height: 350,
  },
});

export default PlantLibraryScreen;

