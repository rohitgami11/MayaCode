import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSocket } from '../../context/SocketContext';

const NotificationsPage = () => {
  const { notifications, clearNotifications } = useSocket();

  useEffect(() => {
    // clearNotifications(); // Clear notifications on mount (commented for debugging)
  }, [clearNotifications]);

  const renderNotificationItem = ({ item }: { item: any }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={{textAlign:'center',marginTop:40,color:'#888'}}>No notifications yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDE3', // Example background color
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 20,
    textAlign: 'left',
    color: '#2C3E50',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationMessage: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});

export default NotificationsPage;