import { useAuth } from '@/context/AuthContext';
import { PostType, Location } from '@/models/Post';
import { postService } from '@/services/postService';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ScrollView, SafeAreaView } from 'react-native';
import Toast from 'react-native-toast-message';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Region, Marker } from 'react-native-maps';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  defaultPostType?: PostType;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onPostCreated,
  defaultPostType,
}) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<PostType | null>(defaultPostType || null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const initialRegion: Region = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions from settings to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const handleSelectLocation = () => {
    setShowMap(true);
  };

  const handleMapPress = (e: any) => {
    setSelectedLocation({
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude
    });
  };

  const handleConfirmLocation = () => {
    setShowMap(false);
  };

  const handleSubmit = async () => {
    if (!selectedType || !title.trim() || !content.trim() || !user?.email) {
      Toast.show({
        type: 'info',
        text1: 'Missing Information',
        text2: 'Please select a type, provide title, content, and ensure you are logged in.',
      });
      return;
    }

    // Validate location requirement based on post type
    if (selectedType !== 'Story' && !selectedLocation) {
      Toast.show({
        type: 'info',
        text1: 'Location Required',
        text2: 'Please select a location for your post.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const newPost = await postService.createPost(
        user.email,
        selectedType,
        title.trim(),
        content.trim(),
        {
          images: imageUri ? [imageUri] : undefined,
          location: selectedType !== 'Story' && selectedLocation ? {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude
          } : undefined
        }
      );

      if (newPost) {
        Toast.show({
          type: 'success',
          text1: 'Post Created!',
          text2: `Your ${selectedType} has been created successfully.`,
        });
        setSelectedType(defaultPostType || null);
        setTitle('');
        setContent('');
        setImageUri(null);
        setSelectedLocation(null);
        
        onPostCreated();
        onClose();
      } else {
         Toast.show({
          type: 'error',
          text1: 'Creation Failed',
          text2: 'Could not create post. Please try again.',
        });
      }
      
    } catch (error: any) {
      console.error('Error creating post:', error);
      Toast.show({
        type: 'error',
        text1: 'Creation Error',
        text2: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTypeSelection = () => (
    !defaultPostType && (
    <View style={styles.typeContainer}>
      <Text style={styles.title}>What would you like to share?</Text>
      <TouchableOpacity
        style={[styles.typeButton, selectedType === 'Offer Help' && styles.selectedType]}
        onPress={() => setSelectedType('Offer Help')}
      >
        <Text style={styles.typeText}>Offer Help</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.typeButton, selectedType === 'Ask for Help' && styles.selectedType]}
        onPress={() => setSelectedType('Ask for Help')}
      >
        <Text style={styles.typeText}>Ask for Help</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.typeButton, selectedType === 'Story' && styles.selectedType]}
        onPress={() => setSelectedType('Story')}
      >
        <Text style={styles.typeText}>Create a Story</Text>
      </TouchableOpacity>
    </View>
    )
  );

  const renderPostForm = () => (
    (defaultPostType || selectedType) && (
    <ScrollView contentContainerStyle={styles.formScrollViewContent}>
      <View style={styles.imagePreviewContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imagePlaceholderText}>Photo will appear here</Text>
        )}
      </View>

      <TouchableOpacity style={styles.imageButton} onPress={handleImagePick} disabled={isLoading}>
        <Ionicons name="camera-outline" size={24} color={isLoading ? '#B0BEC5' : '#007AFF'} />
        <Text style={[styles.imageButtonText, isLoading && { opacity: 0.5 }]}>
          {imageUri ? 'Change Image' : 'Add Image (Optional)'}
        </Text>
      </TouchableOpacity>

      {imageUri && (
        <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage} disabled={isLoading}>
          <Ionicons name="trash-outline" size={24} color={isLoading ? '#EF9A9A' : '#E53935'} />
          <Text style={[styles.removeImageButtonText, isLoading && { opacity: 0.5 }]}>Remove Image</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.inputLabel}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        editable={!isLoading}
      />
      <Text style={styles.inputLabel}>Content</Text>
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
        editable={!isLoading}
      />

      {selectedType !== 'Story' && (
        <>
          <TouchableOpacity style={styles.locationButton} onPress={handleSelectLocation}>
            <Ionicons name="location-outline" size={24} color="#007AFF" />
            <Text style={styles.locationButtonText}>
              {selectedLocation ? 'Change Location' : 'Add Location (Required)'}
            </Text>
          </TouchableOpacity>

          {selectedLocation && (
            <View style={styles.locationPreview}>
              <Text style={styles.locationText}>
                Selected Location: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </>
      )}

      <View style={styles.buttonContainerInner}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onClose}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { color: '#000' }, isLoading && { opacity: 0.5 }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={isLoading || !title.trim() || !content.trim() || !selectedType || (selectedType !== 'Story' && !selectedLocation)}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Create Post
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    )
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#000" />
            <Text style={styles.headerText}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {!defaultPostType && renderTypeSelection()}
          {(defaultPostType || selectedType) && renderPostForm()}
        </ScrollView>

        {showMap && (
          <Modal
            visible={showMap}
            animationType="slide"
            presentationStyle="fullScreen"
          >
            <SafeAreaView style={styles.mapContainer}>
              <View style={styles.mapHeader}>
                <TouchableOpacity onPress={() => setShowMap(false)} style={styles.mapBackButton}>
                  <Ionicons name="arrow-back" size={24} color="#000" />
                  <Text style={styles.mapHeaderText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirmLocation} style={styles.confirmButton}>
                  <Text style={styles.confirmButtonText}>Confirm Location</Text>
                </TouchableOpacity>
              </View>
              <MapView
                style={styles.map}
                initialRegion={initialRegion}
                onPress={handleMapPress}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={{
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude
                    }}
                  />
                )}
              </MapView>
            </SafeAreaView>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDFDE3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#FDFDE3',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    marginLeft: 5,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  typeContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  typeButton: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  formScrollViewContent: {
    paddingBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#78909C',
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  imageButton: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  imageButtonText: {
    color: '#0D47A1',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  removeImageButton: {
    marginTop: 10,
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  removeImageButtonText: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  buttonContainerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  locationButtonText: {
    marginLeft: 10,
    color: '#007AFF',
  },
  locationPreview: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  locationText: {
    color: '#666',
  },
  mapContainer: {
    flex: 1,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  mapBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapHeaderText: {
    fontSize: 16,
    marginLeft: 5,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
}); 