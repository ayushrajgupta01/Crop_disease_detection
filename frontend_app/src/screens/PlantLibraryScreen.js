import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image
} from 'react-native';
import { Search, BookOpen, ChevronRight, Leaf } from 'lucide-react-native';
import { Colors } from '../theme/colors';

const PlantLibraryScreen = () => {
  const [search, setSearch] = useState('');
  const plants = [
    { id: 1, name: 'Tomato', variety: 'Roma', family: 'Solanaceae', status: 'Healthy' },
    { id: 2, name: 'Rice', variety: 'Basmati', family: 'Poaceae', status: 'Warning' },
    { id: 3, name: 'Potato', variety: 'Russet', family: 'Solanaceae', status: 'Healthy' },
    { id: 4, name: 'Lemon', variety: 'Eureka', family: 'Rutaceae', status: 'Alert' },
    { id: 5, name: 'Bell Pepper', variety: 'California Wonder', family: 'Solanaceae', status: 'Healthy' }
  ];

  const filteredPlants = plants.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScrollView style={styles.container}>
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
        <Text style={styles.sectionTitle}>Your Crops</Text>
        {filteredPlants.map(plant => (
          <TouchableOpacity key={plant.id} style={styles.plantCard}>
            <View style={styles.plantIconContainer}>
              <Leaf color={Colors.primary} size={24} />
            </View>
            <View style={styles.plantInfo}>
              <Text style={styles.plantName}>{plant.name}</Text>
              <Text style={styles.plantVariety}>{plant.variety} • {plant.family}</Text>
            </View>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: plant.status === 'Healthy' ? '#dcfce7' : plant.status === 'Warning' ? '#fef3c7' : '#fee2e2' }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: plant.status === 'Healthy' ? '#166534' : plant.status === 'Warning' ? '#92400e' : '#991b1b' }
              ]}>{plant.status}</Text>
            </View>
            <ChevronRight size={20} color={Colors.border} />
          </TouchableOpacity>
        ))}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  plantIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  }
});

export default PlantLibraryScreen;
