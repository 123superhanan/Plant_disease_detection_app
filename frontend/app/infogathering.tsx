import { ArrowRight, Calendar, Heart, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function InfoGathering() {
  const [formData, setFormData] = useState({
    location: '',
    experience: 'Beginner',
    farmScale: 'Home Garden',
  });

  const [selectedSeason, setSelectedSeason] = useState('Spring');
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const [growthStage, setGrowthStage] = useState('Vegetative');
  const [environment, setEnvironment] = useState('Outdoor');

  const COMMON_PLANTS = ['Tomato', 'Potato', 'Corn', 'Pepper', 'Apple', 'Grape'];

  const togglePlant = (plant: string) => {
    if (selectedPlants.includes(plant)) {
      setSelectedPlants(selectedPlants.filter(p => p !== plant));
    } else {
      setSelectedPlants([...selectedPlants, plant]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Personalize Your AI</Text>
          <Text style={styles.subtitle}>Help AgroVision improve disease detection accuracy.</Text>
        </View>

        <View style={styles.form}>
          {/* Location */}
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <MapPin color="#1DB954" size={24} />
              <Text style={styles.cardTitle}>Your Location</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="City or Region"
              placeholderTextColor="#666"
              onChangeText={val => setFormData({ ...formData, location: val })}
            />
            <Text style={styles.helperText}>Stored for future climate-based improvements.</Text>
          </View>

          {/* Plant Types */}
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Heart color="#1DB954" size={24} />
              <Text style={styles.cardTitle}>Select Your Crops</Text>
            </View>

            <View style={styles.chipRow}>
              {COMMON_PLANTS.map(plant => {
                const isSelected = selectedPlants.includes(plant);
                return (
                  <TouchableOpacity
                    key={plant}
                    onPress={() => togglePlant(plant)}
                    activeOpacity={0.8}
                    style={[styles.chip, isSelected && styles.activeChip]}
                  >
                    <Text style={styles.chipText}>{plant}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.helperText}>
              {selectedPlants.length > 0
                ? `AI tuned for: ${selectedPlants.join(', ')}`
                : 'Select crops to match trained dataset classes'}
            </Text>
          </View>

          {/* Growth Stage */}
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Calendar color="#1DB954" size={24} />
              <Text style={styles.cardTitle}>Growth Stage</Text>
            </View>
            <View style={styles.chipRow}>
              {['Seedling', 'Vegetative', 'Flowering', 'Fruiting'].map(stage => {
                const isActive = growthStage === stage;
                return (
                  <TouchableOpacity
                    key={stage}
                    onPress={() => setGrowthStage(stage)}
                    activeOpacity={0.8}
                    style={[styles.chip, isActive && styles.activeChip]}
                  >
                    <Text style={styles.chipText}>{stage}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.helperText}>
              Helps refine disease likelihood by lifecycle stage.
            </Text>
          </View>

          {/* Environment */}
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Calendar color="#1DB954" size={24} />
              <Text style={styles.cardTitle}>Environment</Text>
            </View>
            <View style={styles.chipRow}>
              {['Indoor', 'Outdoor'].map(env => {
                const isActive = environment === env;
                return (
                  <TouchableOpacity
                    key={env}
                    onPress={() => setEnvironment(env)}
                    activeOpacity={0.8}
                    style={[styles.chip, isActive && styles.activeChip]}
                  >
                    <Text style={styles.chipText}>{env}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.helperText}>Useful for future dataset expansion.</Text>
          </View>

          {/* Season */}
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Calendar color="#1DB954" size={24} />
              <Text style={styles.cardTitle}>Current Season</Text>
            </View>
            <View style={styles.chipRow}>
              {['Spring', 'Summer', 'Fall', 'Winter'].map(s => {
                const isActive = selectedSeason === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSelectedSeason(s)}
                    activeOpacity={0.8}
                    style={[styles.chip, isActive && styles.activeChip]}
                  >
                    <Text style={styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>COMPLETE SETUP</Text>
          <ArrowRight color="black" size={20} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scroll: { padding: 25, paddingTop: 60 },
  header: { marginBottom: 30 },
  title: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 16, marginTop: 5 },
  form: { gap: 20 },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: '600' },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    color: 'white',
    paddingVertical: 8,
    fontSize: 16,
  },
  helperText: { color: '#555', fontSize: 12, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
  chip: {
    backgroundColor: '#222',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeChip: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)', // Subtle green background
    borderColor: '#1DB954', // Bright neon border
  },
  chipText: { color: '#888', fontSize: 13 },
  nextBtn: {
    backgroundColor: '#1DB954',
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 10,
  },
  nextBtnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});
