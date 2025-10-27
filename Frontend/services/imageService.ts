import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000';

/**
 * Get image URL from backend static files
 * @param category - Image category (help-posts, stories, unity, etc.)
 * @param number - Image number (1, 2, 3, 4, etc.)
 * @returns Full URL to the image
 */
export const getImageUrl = (category: string, number: number): string => {
  // Direct static file access from public folder
  if (number === 1) {
    return `${API_BASE_URL}/public/images/${category}.png`;
  }
  return `${API_BASE_URL}/public/images/${category}${number}.png`;
};

/**
 * Get image source for React Native Image component
 * @param category - Image category
 * @param number - Image number
 * @returns Image source object with URI
 */
export const getImageSource = (category: string, number: number) => {
  return { uri: getImageUrl(category, number) };
};

/**
 * Get image source from backend static files
 * @param category - Image category
 * @param number - Image number
 * @returns Image source object with URI
 */
export const getImageSourceWithFallback = (category: string, number: number) => {
  // Always use backend static file URLs
  return { uri: getImageUrl(category, number) };
};

/**
 * Convert local image file URI to base64
 * @param uri - Local file URI
 * @returns Base64 encoded string
 */
export const convertImageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    console.log('Converting image to base64:', uri);
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Add data URI prefix for React Native Image component
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

/**
 * Check if a string is a data URI (base64)
 * @param uri - URI string to check
 * @returns True if it's a data URI
 */
export const isDataUri = (uri: string): boolean => {
  return uri.startsWith('data:image');
};

/**
 * Check if a string is a local file URI
 * @param uri - URI string to check
 * @returns True if it's a local file URI
 */
export const isLocalFileUri = (uri: string): boolean => {
  return uri.startsWith('file://');
};

