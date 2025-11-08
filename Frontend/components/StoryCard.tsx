import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ImageBackground, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

interface StoryCardProps {
  title: string;
  description: string;
  imageSource: ImageSourcePropType;
  onPress: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  title,
  description,
  imageSource,
  onPress,
}) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        {!imageLoaded && !imageError && (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.placeholderText}>Loading...</Text>
          </View>
        )}
        {imageError && (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={48} color="#ccc" />
            <Text style={styles.placeholderText}>Image unavailable</Text>
          </View>
        )}
        <ImageBackground
          source={imageSource}
          style={[styles.imageBackground, (!imageLoaded || imageError) && { display: 'none' }]}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => {
            setImageLoading(false);
            setImageLoaded(true);
          }}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        >
          <View style={styles.overlay}>
            <Text style={styles.title}>{title}</Text>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>{description}</Text>
        <Ionicons name="arrow-forward" size={24} color="#007AFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
  imageBackground: {
    width: '100%',
    height: 150,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    marginRight: 10,
  },
});
