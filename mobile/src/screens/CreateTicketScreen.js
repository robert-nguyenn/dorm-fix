import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ticketAPI } from '../services/api';

export default function CreateTicketScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const [userNote, setUserNote] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Photo required', 'Please take a photo of the maintenance issue');
      return;
    }

    if (!building.trim() || !room.trim()) {
      Alert.alert('Location required', 'Please enter your building and room number');
      return;
    }

    try {
      setLoading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('images', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'issue.jpg',
      });
      formData.append('building', building.trim());
      formData.append('room', room.trim());
      if (locationNotes.trim()) {
        formData.append('locationNotes', locationNotes.trim());
      }
      if (userNote.trim()) {
        formData.append('userNote', userNote.trim());
      }

      const response = await ticketAPI.createTicket(formData);

      Alert.alert(
        'Success!',
        'Your maintenance ticket has been submitted. Facilities will be notified.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Submission failed',
        'Could not submit ticket. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>1. Take a Photo</Text>
      <Text style={styles.sectionSubtitle}>
        Show the maintenance issue clearly
      </Text>

      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image.uri }} style={styles.image} />
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={pickImage}
          >
            <Text style={styles.changePhotoText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.photoButtons}>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Text style={styles.photoButtonText}>📷 Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.photoButton, styles.photoButtonSecondary]}
            onPress={pickFromGallery}
          >
            <Text style={styles.photoButtonTextSecondary}>🖼️ Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>2. Location Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Building Name (e.g., Smith Hall)"
        value={building}
        onChangeText={setBuilding}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Room Number (e.g., 204)"
        value={room}
        onChangeText={setRoom}
        autoCapitalize="characters"
      />

      <TextInput
        style={styles.input}
        placeholder="Location notes (optional, e.g., 'Bathroom sink')"
        value={locationNotes}
        onChangeText={setLocationNotes}
        autoCapitalize="sentences"
      />

      <Text style={styles.sectionTitle}>3. Additional Details (Optional)</Text>

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the issue in your own words..."
        value={userNote}
        onChangeText={setUserNote}
        multiline
        numberOfLines={4}
        autoCapitalize="sentences"
      />

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Ticket</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        ⚠️ Not for emergencies. For immediate danger, contact campus security or call 911.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  photoButtons: {
    gap: 12,
  },
  photoButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  photoButtonSecondary: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  photoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  photoButtonTextSecondary: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  changePhotoButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#6b7280',
    borderRadius: 8,
    alignItems: 'center',
  },
  changePhotoText: {
    color: 'white',
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    marginTop: 16,
    fontSize: 12,
    color: '#dc2626',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
});
