import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';
import { postService } from '@/services/postService';
import { Post } from '@/models/Post';
import { useFocusEffect } from '@react-navigation/native';
import PostCard from '@/components/PostCard';

const Stories = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'my' or 'all'
  const [myStories, setMyStories] = useState<Post[]>([]);
  const [allStories, setAllStories] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  const fetchAllStories = useCallback(async () => {
    setIsLoading(true);
    try {
      const stories = await postService.getAllPosts();
      // Filter for only 'Story' type posts
      const storyPosts = stories.filter(post => post.type === 'Story');
      setAllStories(storyPosts);
    } catch (error) {
      console.error('Error fetching all stories:', error);
      Toast.show({
        type: 'error',
        text1: 'Error fetching stories',
        text2: 'Could not load stories. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyStories = useCallback(async () => {
    if (!user?.email) {
      console.log('No phone number found in user session:', user);
      setMyStories([]);
      return;
    }
    setIsLoading(true);
    try {
      const userPosts = await postService.getUserPosts(user.email);
      // Filter for only 'Story' type posts
      const userStoryPosts = userPosts.filter(post => post.type === 'Story');
      setMyStories(userStoryPosts);
    } catch (error) {
      console.error('Error fetching my stories:', error);
      Toast.show({
        type: 'error',
        text1: 'Error fetching your stories',
        text2: 'Could not load your stories. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useFocusEffect(
    useCallback(() => {
      fetchAllStories();
      if (user?.email) {
        fetchMyStories();
      }
    }, [fetchAllStories, fetchMyStories, user?.email])
  );

  useEffect(() => {
    if (activeTab === 'my' && !user?.email) {
      // If user switches to 'My Stories' but is not logged in, switch back to 'All Stories'
      setActiveTab('all');
      Toast.show({
        type: 'info',
        text1: 'Sign in required',
        text2: 'Please sign in to view your stories.',
      });
    }
  }, [activeTab, user?.email]);

  const storiesToShow = activeTab === 'my' ? myStories : allStories;

  const handlePostCreated = useCallback(() => {
    // Refresh stories after a new one is created
    console.log('Story created, refresh list');
    fetchAllStories();
  }, [fetchAllStories]);

  const handleDeleteStory = async (postId: string) => {
    setIsLoading(true);
    try {
      const success = await postService.deletePost(postId);
      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Story Deleted!',
          text2: 'Your story has been deleted successfully.',
        });
        // Refetch stories after deletion
        fetchAllStories();
        if (user?.email) {
          fetchMyStories();
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Deletion Failed',
          text2: 'Could not delete story. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      Toast.show({
        type: 'error',
        text1: 'Deletion Error',
        text2: 'An error occurred while deleting the story.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStory = useCallback((post: Post) => {
    // Navigate to edit screen or open a modal
    console.log('Edit story:', post);
    // Example: router.push(`/edit-story/${post._id}`);
    Toast.show({
      type: 'info',
      text1: 'Edit Functionality',
      text2: 'Edit functionality is not yet implemented.',
    });
  }, [router]);

  const handleWriteStory = () => {
    if (!user?.email) {
      console.log('No email found in user session:', user);
      Toast.show({
        type: 'error',
        text1: 'Authentication Required',
        text2: 'Please sign in to write a story. Redirecting to login...',
        position: 'top',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 50,
        onPress: () => {
          console.log('Toast pressed, redirecting to login');
          router.push('/login');
        },
      });
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 500);
      return;
    }
    router.push('/create-story');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stories</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, activeTab === 'all' && styles.activeToggle]}
          onPress={() => setActiveTab('all')}
          disabled={isLoading}
        >
          <Text style={[styles.toggleText, activeTab === 'all' && styles.activeToggleText]}>ALL STORIES</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, activeTab === 'my' && styles.activeToggle]}
          onPress={() => setActiveTab('my')}
          disabled={isLoading}
        >
          <Text style={[styles.toggleText, activeTab === 'my' && styles.activeToggleText]}>MY STORIES</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.writeButton} onPress={handleWriteStory} disabled={isLoading}>
        <Ionicons name="add-outline" size={24} color={isLoading ? '#B0BEC5' : '#3A6F4C'} />
        <Text style={[styles.writeButtonText, isLoading && { opacity: 0.5 }]}>Write a story</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#0000ff" />
        ) : storiesToShow.length > 0 ? (
          storiesToShow.map((story) => (
            <PostCard 
              key={story._id ? story._id.toString() : `story-${Math.random()}`}
              post={story}
              onDelete={handleDeleteStory}
              onEdit={handleEditStory}
            />
          ))
        ) : (
          <Text style={styles.noStoriesText}>No stories to display yet.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDFDE3', // Light pink background from image
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
    color: '#2C3E50', // Dark text color
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#FCE4EC', // Light pink background for toggle
    borderRadius: 20, // More rounded corners
    overflow: 'hidden',
    padding: 3, // Reduced padding inside the toggle container
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 15,
  },
  activeToggle: {
    backgroundColor: '#E91E63',
  },
  toggleText: {
    fontSize: 16,
    color: '#555',
    fontWeight: 'bold',
  },
  activeToggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  writeButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 20,
  },
  writeButtonText: {
    color: '#3A6F4C',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  noStoriesText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#555',
  },
  storyPlaceholder: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  storyTitlePlaceholder: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  storyContentPlaceholder: {
    fontSize: 16,
    color: '#555',
  },
  storyImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  scrollViewContent: {
    paddingBottom: 100, // Added bottom padding
  }
});

export default Stories;