import Header from '@/components/Header';
import { HelpPostCard } from '@/components/HelpPostCard';
import { StoryCard } from '@/components/StoryCard';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, useColorScheme, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageSourceWithFallback } from '@/services/imageService';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFDE3' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Hello! What should we do today?</Text>

        <HelpPostCard
          title="Help posts"
          description="Ask and give help between community members and build lasting connections"
          imageSource={getImageSourceWithFallback('help-posts', 2)}
          onPress={() => router.push('/helpAndAsk')}
        />

        <StoryCard
          title="Stories"
          description="Share your helping moments and inspire others to do more! Get inspired by others."
          imageSource={getImageSourceWithFallback('stories', 1)}
          onPress={() => router.push('/stories')}
        />

        {/* You can add more sections here for featured courses or other content */}

        {/* Static Inspirational Cards */}
        <View style={styles.inspirationalCard}>
          <Image 
            source={getImageSourceWithFallback('help-posts', 1)} 
            style={styles.inspirationalCardImage} 
            resizeMode="contain" 
          />
          <Text style={styles.inspirationalCardDescription}>
            Your willingness to help can change someone's day. Offer a hand, share a skill!
          </Text>
        </View>

        <View style={styles.inspirationalCard}>
          <Image 
            source={getImageSourceWithFallback('help-posts', 3)} 
            style={styles.inspirationalCardImage} 
            resizeMode="contain" 
          />
          <Text style={styles.inspirationalCardDescription}>
            Don't hesitate to ask for help when you need it. We are stronger together.
          </Text>
        </View>

        <View style={styles.inspirationalCard}>
          <Image 
            source={getImageSourceWithFallback('help-posts', 4)} 
            style={styles.inspirationalCardImage} 
            resizeMode="cover" 
          />
          <Text style={styles.inspirationalCardDescription}>
            Every small act of kindness creates a ripple effect in the community.
          </Text>
        </View>

         <View style={styles.inspirationalCard}>
          <Image 
            source={getImageSourceWithFallback('unity', 1)} 
            style={styles.inspirationalCardImage} 
            resizeMode="cover" 
          />
          <Text style={styles.inspirationalCardDescription}>
            Together, we can build a stronger, more connected community.
          </Text>
        </View>

        {/* Buttons Container */}
        <View style={styles.buttonsContainerRow}>
          <TouchableOpacity style={styles.helpPostsButton} onPress={() => router.push('/helpAndAsk')}>
            <Text style={styles.helpPostsButtonText}>Go to help posts</Text>
            <Ionicons name="add-outline" size={24} color="#fff" style={{ marginLeft: 10 }} />
          </TouchableOpacity>

          {/* Button for Stories */}
          <TouchableOpacity style={styles.storiesButton} onPress={() => router.push('/stories')}>
            <Text style={styles.storiesButtonText}>See Stories</Text>
            <Ionicons name="book-outline" size={24} color="#fff" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 100, // Added bottom padding for scrolling
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
  },
  helpPostsButton: {
    backgroundColor: '#3A6F4C', // Green color from image
    padding: 12, // Reduced padding
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center', // Center content horizontally
    flexDirection: 'row', // Arrange children in a row
    marginTop: 15, // Adjusted margin top
    marginHorizontal: 8,
    alignSelf: 'center', // Center the button and size it to content
  },
  helpPostsButtonText: {
    color: '#fff',
    fontSize: 16, // Reduced font size
    fontWeight: 'bold',
  },
  // Styles for the new Stories button (copying helpPostsButton styles)
  storiesButton: {
    backgroundColor: '#3A6F4C', // Green color (same as help posts button)
    padding: 12, // Reduced padding
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center', // Center content horizontally
    flexDirection: 'row', // Arrange children in a row
    marginTop: 15, // Adjusted margin top
    marginRight: 10,
    alignSelf: 'center', // Center the button and size it to content
  },
  storiesButtonText: {
    color: '#fff',
    fontSize: 16, // Reduced font size
    fontWeight: 'bold',
  },
  // Styles for the new inspirational cards
  inspirationalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden', // Ensures image corners are rounded
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inspirationalCardImage: {
    width: '100%',
    height: 150, // Adjust height as needed
  },
  inspirationalCardDescription: {
    fontSize: 16,
    padding: 15,
    color: '#333',
    textAlign: 'center',
  },
  buttonsContainerRow: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the buttons in the row
    marginTop: 15,
    marginBottom: 15,
    gap: 5, // Reduced gap between buttons
    paddingHorizontal: 10, // Added horizontal padding
  },
});