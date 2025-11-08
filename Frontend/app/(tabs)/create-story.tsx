import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';
import { postService } from '@/services/postService';
import { PostType } from '@/models/Post';

const CreateStoryScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSelectPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions from settings to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleDeletePhoto = () => {
    setImageUri(null);
  };

  const handleCreateAndPublish = async () => {
    if (!user?.email) {
      console.log('No email found in user session:', user);
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Please sign in again to create a story.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    if (!title.trim() || !description.trim()) {
      Toast.show({
        type: 'info',
        text1: 'Missing Information',
        text2: 'Please provide a title and description.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    setIsLoading(true);
    console.log('Creating story with data:', {
      email: user.email,
      type: 'Story',
      title: title.trim(),
      content: description.trim(),
      images: imageUri ? [imageUri] : undefined
    });

    try {
      const newStory = await postService.createPost(
        user.email,
        'Story',
        title.trim(),
        description.trim(),
        {
          images: imageUri ? [imageUri] : undefined,
        }
      );

      console.log('Story creation response:', newStory);

      if (newStory) {
        Toast.show({
          type: 'success',
          text1: 'Story Created!',
          text2: 'Your story has been published successfully.',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 50,
        });
        setTitle('');
        setDescription('');
        setImageUri(null);
        router.back();
      } else {
        console.error('Story creation failed - no response data');
        Toast.show({
          type: 'error',
          text1: 'Creation Failed',
          text2: 'Could not publish story. Please try again.',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 50,
        });
      }

    } catch (error: any) {
      console.error('Error creating story:', {
        error,
        message: error.message,
        stack: error.stack
      });
      Toast.show({
        type: 'error',
        text1: 'Creation Error',
        text2: error.message || 'An unexpected error occurred.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.headerText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create a new story</Text>

        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={24} color="#F57C00" />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>Stories are only for sharing your experiences about helping or volunteering.</Text>
            <Text style={styles.warningMessage}>
              Do not ask for help, post unrelated stories or in other ways try to circumvent above point. Your story will not be published if you do so.
            </Text>
          </View>
        </View>

        <View style={styles.imagePreviewContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <Text style={styles.imagePlaceholderText}>Photo will appear here</Text>
          )}
        </View>

        <TouchableOpacity style={styles.imageButton} onPress={handleSelectPhoto} disabled={isLoading}>
          <Ionicons name="camera-outline" size={24} color={isLoading ? '#B0BEC5' : '#007AFF'} />
          <Text style={[styles.imageButtonText, isLoading && { opacity: 0.5 }]}>
            {imageUri ? 'Change Image' : 'Add Image (Optional)'}
          </Text>
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity style={styles.removeImageButton} onPress={handleDeletePhoto} disabled={isLoading}>
            <Ionicons name="trash-outline" size={24} color={isLoading ? '#EF9A9A' : '#E53935'} />
            <Text style={[styles.removeImageButtonText, isLoading && { opacity: 0.5 }]}>Remove Image</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.inputLabel}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter title"
          value={title}
          onChangeText={setTitle}
          editable={!isLoading}
        />

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          editable={!isLoading}
        />

        <View style={styles.buttonContainerInner}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleBack}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, { color: '#000' }, isLoading && { opacity: 0.5 }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.publishButton]}
            onPress={handleCreateAndPublish}
            disabled={isLoading || !title.trim() || !description.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.buttonText, styles.publishButtonText]}>Create and Publish</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    fontSize: 18,
    marginLeft: 5,
    color: '#000',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    borderLeftWidth: 4,
    borderColor: '#FBC02D',
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 5,
  },
  warningMessage: {
    fontSize: 14,
    color: '#795548',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#78909C',
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
    flexDirection: 'row',
  },
  removeImageButtonText: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
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
  buttonContainerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
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
  publishButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  publishButtonText: {
    color: '#fff',
  },
});

export default CreateStoryScreen; 