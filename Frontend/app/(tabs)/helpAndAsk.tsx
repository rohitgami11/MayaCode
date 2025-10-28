import React, { useState, useEffect } from 'react';
import MapView, { Marker, Callout } from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Modal, TextInput, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';
import { postService } from '@/services/postService';
import { PostType, Post } from '@/models/Post';
import { convertImageToBase64 } from '@/services/imageService';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const CreatePostModal = ({ visible, onClose, onPostCreated }: CreatePostModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [postType, setPostType] = useState<PostType>('Ask for Help');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostDetailVisible, setIsPostDetailVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permission required',
        text2: 'Please grant camera roll permissions to select a photo.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
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
    setSelectedLocation(e.nativeEvent.coordinate);
    setShowMap(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !user?.email) {
      Alert.alert(
        'Missing Information',
        'Please provide title, content, and ensure you are logged in.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!selectedLocation) {
      Alert.alert(
        'Location Required',
        'Please select a location for your post.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // Convert local image to base64 if present
      let images: string[] | undefined = undefined;
      if (imageUri) {
        const base64Image = await convertImageToBase64(imageUri);
        if (base64Image) {
          images = [base64Image];
          console.log('Converted image to base64 successfully - backend will compress');
        } else {
          console.error('Failed to convert image to base64');
          Alert.alert('Error', 'Failed to process image. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      const newPost = await postService.createPost(
        user.email,
        postType,
        title.trim(),
        content.trim(),
        {
          images: images,
          location: {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude
          }
        }
      );

      if (newPost) {
        Alert.alert(
          'Success',
          'Your post has been created successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                setTitle('');
                setContent('');
                setImageUri(null);
                setSelectedLocation(null);
                setPostType('Ask for Help');
                onPostCreated?.();
                onClose();
              }
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Creation Error',
        error.message || 'An unexpected error occurred.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
              console.log('Close button pressed');
              onClose();
            }}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create New Post</Text>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.typeContainer}>
              <Text style={styles.inputLabel}>Post Type</Text>
              <View style={styles.typeButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    postType === 'Ask for Help' && styles.selectedTypeButton
                  ]}
                  onPress={() => setPostType('Ask for Help')}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.typeButtonText,
                    postType === 'Ask for Help' && styles.selectedTypeButtonText
                  ]}>Ask for Help</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    postType === 'Offer Help' && styles.selectedTypeButton
                  ]}
                  onPress={() => setPostType('Offer Help')}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.typeButtonText,
                    postType === 'Offer Help' && styles.selectedTypeButtonText
                  ]}>Offer Help</Text>
                </TouchableOpacity>
              </View>
            </View>

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
              placeholder="Enter title"
              value={title}
              onChangeText={setTitle}
              editable={!isLoading}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Enter description"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              editable={!isLoading}
            />

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

            {/* <TouchableOpacity
              style={[styles.button, { backgroundColor: '#007AFF', marginBottom: 10 }]}
              onPress={() => {
                console.log("Test Button Pressed");
                Alert.alert("Test", "Button pressed!");
              }}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Test Button</Text>
            </TouchableOpacity> */}

            <View style={styles.buttonContainerInner}>
              <TouchableOpacity
                style={[styles.baseButton, styles.cancelButton]}
                onPress={() => {
                  console.log("Cancel button pressed");
                  onClose();
                }}
                disabled={isLoading}
              >
                <Text style={[styles.baseButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.baseButton, styles.submitButton]}
                onPress={() => {
                  console.log("Create Post button pressed");
                  handleSubmit();
                }}
                disabled={isLoading}
              >
                <Text style={[styles.baseButtonText, styles.submitButtonText]}>Create Post</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {showMap && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showMap}
          onRequestClose={() => setShowMap(false)}
        >
          <View style={styles.mapModalContainer}>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 22.7196,
                  longitude: 75.8577,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
              />
              <TouchableOpacity style={styles.mapCloseButton} onPress={() => setShowMap(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Placeholder for Post Detail Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPostDetailVisible}
        onRequestClose={() => setIsPostDetailVisible(false)}
      >
        <View style={styles.postDetailModalContainer}>
          <View style={styles.postDetailModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsPostDetailVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            {selectedPost ? (
              <ScrollView contentContainerStyle={styles.postDetailScrollContent}>
                {/* You would replace this with your actual Post Detail Card component */}
                <Text style={styles.postDetailTitle}>{selectedPost.title}</Text>
                <Text style={styles.postDetailType}>Type: {selectedPost.type}</Text>
                <Text style={styles.postDetailContent}>{selectedPost.content}</Text>
                {selectedPost.images && selectedPost.images.length > 0 && selectedPost.images[0] && (
                  <View style={styles.imageContainer}>
                    {/* Empty frame background - shows while image loads */}
                    {!imageLoaded && !imageError && (
                      <View style={styles.imagePlaceholder}>
                        <ActivityIndicator size="large" color="#007BFF" />
                        <Text style={styles.placeholderText}>Loading image...</Text>
                      </View>
                    )}
                    {/* Error state - only show if image fails to load */}
                    {imageError && (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={48} color="#ccc" />
                        <Text style={styles.placeholderText}>Image unavailable</Text>
                      </View>
                    )}
                    {/* Image will fade in when loaded */}
                    <Image 
                      source={{ uri: selectedPost.images[0] }} 
                      style={[styles.postDetailImage, (!imageLoaded || imageError) && { opacity: 0 }]}
                      resizeMode="cover"
                      onLoadStart={() => {
                        console.log('Starting to load image:', selectedPost?.images?.[0] ? 'Image exists' : 'No image');
                        setImageLoaded(false);
                        setImageError(false);
                      }}
                      onLoadEnd={() => {
                        console.log('Image loaded successfully');
                        setImageLoaded(true);
                        setImageError(false);
                      }}
                      onError={(error) => {
                        console.error('Error loading image:', error.nativeEvent.error);
                        setImageError(true);
                        setImageLoaded(false);
                      }}
                    />
                  </View>
                )}
                {selectedPost.location && (
                  <Text style={styles.postDetailLocation}>
                    Location: {selectedPost.location.latitude.toFixed(4)}, {selectedPost.location.longitude.toFixed(4)}
                  </Text>
                )}
                {selectedPost.email ? <Text style={styles.postDetailAuthor}>By: {selectedPost.email}</Text> : null}
                <Text style={styles.postDetailDate}>
                  Created: {new Date(selectedPost.createdAt).toLocaleDateString()}
                </Text>
              </ScrollView>
            ) : (
              <ActivityIndicator size="large" color="#007AFF" />
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default function HelpAndAsk() {
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostDetailVisible, setIsPostDetailVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ask' | 'offer'>('all');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);
  
  const handlePostCreated = () => {
    fetchPosts();
    closeModal();
  };

  const handleEditPost = () => {
    setIsEditModalVisible(true);
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await postService.deletePost(selectedPost._id!.toString());
              if (success) {
                Toast.show({
                  type: 'success',
                  text1: 'Post Deleted',
                  text2: 'Your post has been deleted successfully.',
                });
                setIsPostDetailVisible(false);
                fetchPosts();
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Delete Failed',
                  text2: 'Could not delete the post. Please try again.',
                });
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              Toast.show({
                type: 'error',
                text1: 'Delete Failed',
                text2: 'An error occurred while deleting the post.',
              });
            }
          },
        },
      ]
    );
  };

  const handlePostUpdated = () => {
    fetchPosts();
    setIsEditModalVisible(false);
    setIsPostDetailVisible(false);
  };

  const fetchPosts = async () => {
    try {
      const fetchedPosts: Post[] = await postService.getAllPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Toast.show({
        type: 'error',
        text1: 'Error loading posts',
        text2: 'Could not fetch posts from the server.',
      });
    }
  };

  // Function to handle marker press
  const handleMarkerPress = (post: Post) => {
    console.log('Marker pressed for post:', post.title); // Debug log
    console.log('Post images:', post.images?.length || 0, 'image(s)'); // Debug log
    setSelectedPost(post);
    setIsPostDetailVisible(true);
    setImageLoaded(false);
    setImageError(false);
    setImageLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help & Ask</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, activeFilter === 'all' && styles.activeButton]} 
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.buttonText, activeFilter === 'all' && styles.activeButtonText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, activeFilter === 'ask' && styles.activeButton]} 
          onPress={() => setActiveFilter('ask')}
        >
          <Text style={[styles.buttonText, activeFilter === 'ask' && styles.activeButtonText]}>Needs help</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, activeFilter === 'offer' && styles.activeButton]} 
          onPress={() => setActiveFilter('offer')}
        >
          <Text style={[styles.buttonText, activeFilter === 'offer' && styles.activeButtonText]}>Gives help</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 22.7196,
            longitude: 75.8577,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {posts.map((post: Post, index: number) => {
            const isAskHelp = post.type === 'Ask for Help';
            const isOfferHelp = post.type === 'Offer Help';
            const showPost = (
              (activeFilter === 'all' && (isAskHelp || isOfferHelp)) ||
              (activeFilter === 'ask' && isAskHelp) ||
              (activeFilter === 'offer' && isOfferHelp)
            );

            if (post.location && post._id && showPost) {
              return (
                <Marker
                  key={post._id.toString()}
                  coordinate={{
                    latitude: post.location.latitude,
                    longitude: post.location.longitude
                  }}
                  onPress={() => handleMarkerPress(post)}
                >
                  <View style={[
                    styles.customMarker,
                    isOfferHelp ? styles.offerHelpMarker : styles.askHelpMarker
                  ]}>
                    <Text style={styles.markerTitle}>
                      {index + 1}
                    </Text>
                    <View style={[
                      styles.markerTail,
                      isOfferHelp ? styles.offerHelpTail : styles.askHelpTail
                    ]}/>
                  </View>
                </Marker>
              );
            }
            return null;
          })}
        </MapView>
        <TouchableOpacity style={styles.fabButton} onPress={openModal}>
          <Ionicons name="add" size={30} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      
      <CreatePostModal 
        visible={isModalVisible} 
        onClose={closeModal}
        onPostCreated={handlePostCreated}
      />

      {/* Move Post Detail Modal to main component */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPostDetailVisible}
        onRequestClose={() => setIsPostDetailVisible(false)}
      >
        <View style={styles.postDetailModalContainer}>
          <View style={styles.postDetailModalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsPostDetailVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            {selectedPost ? (
              <ScrollView contentContainerStyle={styles.postDetailScrollContent}>
                <Text style={styles.postDetailTitle}>{selectedPost.title}</Text>
                <Text style={styles.postDetailType}>Type: {selectedPost.type}</Text>
                <Text style={styles.postDetailContent}>{selectedPost.content}</Text>
                {selectedPost.images && selectedPost.images.length > 0 && selectedPost.images[0] && (
                  <View style={styles.imageContainer}>
                    {/* Empty frame background - shows while image loads */}
                    {!imageLoaded && !imageError && (
                      <View style={styles.imagePlaceholder}>
                        <ActivityIndicator size="large" color="#007BFF" />
                        <Text style={styles.placeholderText}>Loading image...</Text>
                      </View>
                    )}
                    {/* Error state - only show if image fails to load */}
                    {imageError && (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={48} color="#ccc" />
                        <Text style={styles.placeholderText}>Image unavailable</Text>
                      </View>
                    )}
                    {/* Image will fade in when loaded */}
                    <Image 
                      source={{ uri: selectedPost.images[0] }} 
                      style={[styles.postDetailImage, (!imageLoaded || imageError) && { opacity: 0 }]}
                      resizeMode="cover"
                      onLoadStart={() => {
                        console.log('Starting to load image:', selectedPost?.images?.[0] ? 'Image exists' : 'No image');
                        setImageLoaded(false);
                        setImageError(false);
                      }}
                      onLoadEnd={() => {
                        console.log('Image loaded successfully');
                        setImageLoaded(true);
                        setImageError(false);
                      }}
                      onError={(error) => {
                        console.error('Error loading image:', error.nativeEvent.error);
                        setImageError(true);
                        setImageLoaded(false);
                      }}
                    />
                  </View>
                )}
                
                {/* Edit/Delete buttons for post owner */}
                {user?.email === selectedPost.email && (
                  <View style={styles.postActionsContainer}>
                    <TouchableOpacity style={styles.editButton} onPress={handleEditPost}>
                      <Ionicons name="pencil" size={20} color="#007AFF" />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePost}>
                      <Ionicons name="trash" size={20} color="#FF3B30" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {selectedPost.location && (
                  <Text style={styles.postDetailLocation}>
                    Location: {selectedPost.location.latitude.toFixed(4)}, {selectedPost.location.longitude.toFixed(4)}
                  </Text>
                )}
                {selectedPost.email ? <Text style={styles.postDetailAuthor}>By: {selectedPost.email}</Text> : null}
                <Text style={styles.postDetailDate}>
                  Created: {new Date(selectedPost.createdAt).toLocaleDateString()}
                </Text>
              </ScrollView>
            ) : (
              <ActivityIndicator size="large" color="#007AFF" />
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Post Modal */}
      <CreatePostModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onPostCreated={handlePostUpdated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDE3',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'left',
    color: '#2C3E50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    marginBottom: 10,
    gap: 10,
  },
  button: {
    width: 100,
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',
    borderColor: '#B71C1C',
    borderWidth: 0.5,
    minHeight: 40,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeButton: {
    backgroundColor: '#B71C1C',
    borderColor: '#B71C1C',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#B71C1C',
    textAlign: 'center',
  },
  activeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  fabButton: {
    position: 'absolute',
    bottom: 62,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFC0CB',
    borderWidth: 3,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FDFDE3',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2C3E50',
    marginTop: 20,
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
    color: '#2C3E50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationButton: {
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
  locationButtonText: {
    color: '#0D47A1',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  locationPreview: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  locationText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  buttonContainerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  baseButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    padding: 10,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#B71C1C',
    borderWidth: 0.5,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    borderWidth: 0.5,
  },
  baseButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: '#B71C1C',
  },
  submitButtonText: {
    color: '#FFFFFF',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  mapCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  typeContainer: {
    marginBottom: 20,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedTypeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedTypeButtonText: {
    color: '#fff',
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  postDetailModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postDetailModalContent: {
    backgroundColor: '#FDFDE3',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    position: 'relative',
  },
  postDetailScrollContent: {
    paddingBottom: 40,
  },
  postDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
    postDetailType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
    marginBottom: 10,
  },
  postDetailContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  postDetailImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  imagePlaceholder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
  postDetailLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  postDetailAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  postDetailDate: {
    fontSize: 12,
    color: '#999',
  },
  customMarker: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: 250,              // limit the max width
    backgroundColor: '#2196F3', // or your dynamic color logic
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  markerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  markerTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,  // centers the tail horizontally
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  offerHelpTail: {
    borderTopColor: '#4CAF50',
  },
  askHelpTail: {
    borderTopColor: '#2196F3',
  },
  offerHelpMarker: {
    backgroundColor: '#4CAF50', // Green for offer help
  },  
  askHelpMarker: {
    backgroundColor: '#2196F3', // Blue for ask help
  },
  postActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

});