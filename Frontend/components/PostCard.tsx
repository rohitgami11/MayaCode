import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { Post } from '@/models/Post';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onEdit?: (post: Post) => void; // Placeholder for edit
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onDelete,
  onEdit,
}) => {
  const { user } = useAuth();
  // Check if this is the current user's post
  const isMyPost = user?.email === post.email;

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete && post._id && onDelete(post._id.toString()) },
      ]
    );
  };

  // Placeholder for edit action
  // Placeholder for edit action
  // Placeholder for edit action
  const handleAccess = () => {

  };

  const handleEdit = () => {
    onEdit && onEdit(post);
  };

  return (
    <View style={styles.card}>
      {post.images && post.images.length > 0 && post.images[0] && (
        <Image source={{ uri: post.images[0] }} style={styles.image} resizeMode="cover" />
      )}
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content}>{post.content}</Text>

      {isMyPost && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color="#007BFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color="#DC3545" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  content: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#007BFF',
  },
});

export default PostCard; 