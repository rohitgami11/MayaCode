import { createPost, Post, updatePost } from '@/models/Post';

const API_URL = `${process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000'}/api`;

// Post Operations
export const postService = {
  // Create a new post
  async createPost(
    phone: string,
    type: Post['type'],
    title: string,
    content: string,
    data: Partial<Post> = {}
  ): Promise<Post | null> {
    // Sanitize data for logging (truncate long base64 strings)
    const logData = { ...data };
    if (logData.images && Array.isArray(logData.images)) {
      logData.images = logData.images.map((img: string) => 
        img ? (img.substring(0, 50) + '... (base64 image data)') : 'null'
      );
    }
    
    console.log('Starting createPost with:', {
      phone,
      type,
      title,
      content,
      data: logData,
      apiUrl: API_URL
    });

    try {
      console.log('Creating post object...');
      const post = createPost(phone, type, title, content, data);
      
      // Sanitize post for logging
      const logPost = { ...post };
      if (logPost.images && Array.isArray(logPost.images)) {
        logPost.images = logPost.images.map((img: string) => 
          img ? (img.substring(0, 50) + '... (base64 image data)') : 'null'
        );
      }
      console.log('Created post object:', logPost);

      console.log('Making API request to:', `${API_URL}/posts`);
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(post),
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: `${API_URL}/posts`
        });
        throw new Error(`Failed to create post: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('API Success Response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error in createPost:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        apiUrl: API_URL
      });
      return null;
    }
  },

  // Get a post by ID
  async getPost(postId: string): Promise<Post | null> {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      return response.json();
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  },

  // Get posts by phone
  async getUserPosts(phone: string): Promise<Post[]> {
    try {
      console.log('postService API_URL:', API_URL);
      console.log('Starting getUserPosts with:', { phone });
      const response = await fetch(`${API_URL}/posts/phone/${phone}`);
      if (!response.ok) throw new Error('Failed to fetch user posts');
      return response.json();
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  },

  // Update a post
  async updatePost(postId: string, updates: Partial<Post>): Promise<Post | null> {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update post');
      return response.json();
    } catch (error) {
      console.error('Error updating post:', error);
      return null;
    }
  },

  // Delete a post
  async deletePost(postId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete post');
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  // Get all posts
  async getAllPosts(): Promise<Post[]> {
    try {
      console.log('Fetching all posts from:', `${API_URL}/posts`);
      const response = await fetch(`${API_URL}/posts`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error fetching all posts:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: `${API_URL}/posts`
        });
        throw new Error(`Failed to fetch all posts: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Successfully fetched all posts:', data);
      return data;
    } catch (error) {
      console.error('Error in getAllPosts:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        apiUrl: API_URL
      });
      return [];
    }
  }
}; 