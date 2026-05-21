import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Camera, Image as ImageIcon, Search, CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Colors } from '../theme/colors';
import { API_BASE_URL } from '../config';

const DiagnosticsScreen = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async (useCamera = false) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Required", "We need camera access to scan crops.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Required", "We need gallery access to upload photos.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setResult(null);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert("Error", "Failed to select image.");
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: 'upload.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error('Analysis error:', err);
      Alert.alert("Connection Error", "ML service is unreachable. Check your server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Disease Diagnostics</Text>
        <Text style={styles.subtitle}>Upload a leaf photo for instant AI analysis.</Text>
      </View>

      {!image ? (
        <View style={styles.uploadContainer}>
          <TouchableOpacity 
            style={styles.uploadMain} 
            onPress={() => pickImage(true)}
          >
            <Camera size={48} color={Colors.primary} />
            <Text style={styles.uploadTitle}>Scan with Camera</Text>
            <Text style={styles.uploadSub}>Point directly at the infected leaf</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity 
            style={styles.uploadSecondary}
            onPress={() => pickImage(false)}
          >
            <ImageIcon size={20} color={Colors.textMuted} />
            <Text style={styles.secondaryText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.retakeButton]} 
              onPress={() => setImage(null)}
            >
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.analyzeButton]} 
              onPress={analyzeImage}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <View style={styles.row}>
                  <Search size={18} color="white" />
                  <Text style={styles.analyzeText}>Analyze Now</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <CheckCircle size={24} color={Colors.primary} />
            <Text style={styles.resultTitle}>Diagnosis Results</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.diseaseName}>{result.name}</Text>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { width: `${result.confidence * 100}%` }]} />
              <Text style={styles.confidenceText}>{(result.confidence * 100).toFixed(1)}% Accuracy</Text>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <AlertCircle size={18} color="#d97706" />
                <Text style={styles.infoTitle}>Treatment Plan</Text>
              </View>
              <Text style={styles.infoContent}>{result.treatment}</Text>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Info size={18} color={Colors.primary} />
                <Text style={styles.infoTitle}>Nutrient Protocol</Text>
              </View>
              <Text style={styles.infoContent}>{result.fertilizer}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Generate Full Action Plan →</Text>
          </TouchableOpacity>
        </View>
      )}
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
  uploadContainer: {
    padding: 20,
  },
  uploadMain: {
    height: 200,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 15,
  },
  uploadSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: 15,
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  uploadSecondary: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    marginLeft: 8,
    color: Colors.textMain,
    fontWeight: '600',
  },
  previewContainer: {
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  previewActions: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  analyzeButton: {
    backgroundColor: Colors.primary,
  },
  retakeText: {
    color: Colors.textMain,
    fontWeight: 'bold',
  },
  analyzeText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultContainer: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 30,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginLeft: 10,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textMain,
    marginBottom: 10,
  },
  confidenceBar: {
    height: 24,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  confidenceFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContent: {
    fontSize: 14,
    color: Colors.textMain,
    lineHeight: 20,
  },
  actionBtn: {
    marginTop: 15,
  },
  actionBtnText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default DiagnosticsScreen;
