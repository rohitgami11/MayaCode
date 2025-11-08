import { ObjectId } from 'mongodb';

export type PostType = 'Offer Help' | 'Ask for Help' | 'Story';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Post {
  _id?: ObjectId;
  email: string;
  type: PostType;
  title: string;
  content: string;
  images?: string[];
  location?: Location;
  tags?: string[];
  status: 'active' | 'completed' | 'archived';
  views: number;
  isUrgent?: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to create a new post
export const createPost = (
  email: string,
  type: PostType,
  title: string,
  content: string,
  data: Partial<Post> = {}
): Post => {
  const now = new Date();
  return {
    email,
    type,
    title,
    content,
    status: 'active',
    views: 0,
    createdAt: now,
    updatedAt: now,
    ...data
  };
};

// Helper function to update a post
export const updatePost = (post: Post, updates: Partial<Post>): Post => {
  return {
    ...post,
    ...updates,
    updatedAt: new Date()
  };
};

// Helper function to validate post data
export const validatePost = (post: Post): { isValid: boolean; error?: string } => {
  if (!post.title.trim()) {
    return { isValid: false, error: 'Title is required' };
  }
  if (!post.content.trim()) {
    return { isValid: false, error: 'Content is required' };
  }
  if (post.type !== 'Story' && !post.location) {
    return { isValid: false, error: 'Location is required for Offer Help and Ask for Help posts' };
  }
  return { isValid: true };
}; 