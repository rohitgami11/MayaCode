import { EditProfileModal } from '@/components/EditProfileModal';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/models/User';
import { userService } from '@/services/userService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Stat { id: number; title: string; value: string; icon: any; }
interface Setting { id: number; title: string; icon: any; }

const stats: Stat[] = [
  { id: 1, title: 'Courses Completed', value: '12', icon: 'graduation-cap' },
  { id: 2, title: 'Challenges Solved', value: '45', icon: 'trophy' },
  { id: 3, title: 'Total Points', value: '1,250', icon: 'star' },
  { id: 4, title: 'Current Streak', value: '7 days', icon: 'fire' },
];

const settings: Setting[] = [
  { id: 1, title: 'Account Settings', icon: 'user' },
  { id: 2, title: 'Notifications', icon: 'bell' },
  { id: 3, title: 'Privacy', icon: 'lock' },
  { id: 4, title: 'Help & Support', icon: 'question-circle' },
  { id: 5, title: 'About', icon: 'info-circle' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, isLoading, checkAuthStatus } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState('ABOUT');

  const createInitialProfile = async () => {
    if (!user) return null;
    
    try {
      const newProfile = await userService.updateUserProfile({
        name: user.name || user.email,
        userType: 'Other',
        languages: [],
        createdStories: [],
        createdHelpPosts: [],
        createdAskPosts: [],
        stats: {
          storiesCount: 0,
          helpPostsCount: 0,
          askPostsCount: 0,
          totalLikes: 0,
          totalComments: 0,
          totalViews: 0,
          completedHelps: 0,
          receivedHelps: 0
        }
      });
      return newProfile;
    } catch (error) {
      console.error('Error creating initial profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setIsLoadingProfile(true);
        try {
          // Check if email exists in user session
          if (!user.email) {
            console.log('No email found in user session');
            router.replace('/login');
            return;
          }

          let profile = await userService.getUserProfile();
          
          if (!profile) {
            // If profile doesn't exist, create one
            profile = await createInitialProfile();
          }
          
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    if (!isLoading && !user) {
      router.replace('/login');
    } else if (user) {
      fetchUserProfile();
    }
  }, [user, isLoading, router]);

  const handleProfileSaved = async () => {
    try {
      // Just fetch the latest profile data instead of updating
      const updatedProfile = await userService.getUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading || isLoadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const memberSince = userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.headerTitle}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={styles.headerButton}>
            <Ionicons name="pencil-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarPlaceholder}>
             {userProfile?.profileImage ? (
               <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
             ) : (
               <Ionicons name="person" size={80} color="#fff" />
             )}
          </View>
          <Text style={styles.userName}>{userProfile?.name || user.email}</Text>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'ABOUT' && styles.activeTab]}
            onPress={() => setActiveTab('ABOUT')}
          >
            <Text style={activeTab === 'ABOUT' ? styles.activeTabText : styles.tabText}>ABOUT</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'STATS' && styles.activeTab]}
            onPress={() => setActiveTab('STATS')}
          >
            <Text style={activeTab === 'STATS' ? styles.activeTabText : styles.tabText}>STATS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'HISTORY' && styles.activeTab]}
            onPress={() => setActiveTab('HISTORY')}
          >
            <Text style={activeTab === 'HISTORY' ? styles.activeTabText : styles.tabText}>HISTORY</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'ABOUT' && (
          <View style={styles.aboutSection}>
            <View style={styles.detailsCard}>
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Member since</Text>
                  <Text style={styles.detailValue}>{memberSince}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Age</Text>
                  <Text style={styles.detailValue}>{userProfile?.age || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{userProfile?.location || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItemFullWidth}>
                  <Text style={styles.detailLabel}>User Type</Text>
                  <Text style={styles.detailValue}>{userProfile?.userType || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItemFullWidth}>
                  <Text style={styles.detailLabel}>Spoken Languages</Text>
                  <View style={styles.languagesContainer}>
                    {userProfile?.languages?.map((language, index) => (
                      <View key={index} style={styles.languageTag}>
                        <Text style={styles.languageTagText}>{language}</Text>
                      </View>
                    ))}
                    {(!userProfile?.languages || userProfile.languages.length === 0) && (
                      <Text style={styles.detailValue}>N/A</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'STATS' && userProfile?.stats && (
          <View style={styles.statsSection}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="book-outline" size={24} color="#007AFF" />
                <Text style={styles.statValue}>{userProfile.stats.storiesCount}</Text>
                <Text style={styles.statTitle}>Stories Created</Text>
              </View>
               <View style={styles.statItem}>
                <Ionicons name="bulb-outline" size={24} color="#007AFF" />
                <Text style={styles.statValue}>{userProfile.stats.helpPostsCount}</Text>
                <Text style={styles.statTitle}>Help Offered</Text>
              </View>
               <View style={styles.statItem}>
                <Ionicons name="hand-right-outline" size={24} color="#007AFF" />
                <Text style={styles.statValue}>{userProfile.stats.askPostsCount}</Text>
                <Text style={styles.statTitle}>Help Asked</Text>
              </View>
               <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={24} color="#007AFF" />
                <Text style={styles.statValue}>{userProfile.stats.totalLikes}</Text>
                <Text style={styles.statTitle}>Total Likes</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#007AFF" />
                <Text style={styles.statValue}>{userProfile.stats.completedHelps}</Text>
                <Text style={styles.statTitle}>Helps Completed</Text>
              </View>
               <View style={styles.statItem}>
                <Ionicons name="download-outline" size={24} color="#007AFF" />
                <Text style={styles.statValue}>{userProfile.stats.receivedHelps}</Text>
                <Text style={styles.statTitle}>Helps Received</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'HISTORY' && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>History</Text>
            <Text>Coming Soon...</Text>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        user={user}
        userProfile={userProfile}
        onSave={handleProfileSaved}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDE3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFDE3',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 18,
    marginLeft: 5,
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginTop: 2,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollViewContent: {
    padding: 20,
    alignItems: 'center',
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8BC34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderColor: '#fff',
    borderWidth: 4,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2C3E50',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  aboutSection: {
    width: '100%',
    marginBottom: 15,
  },
  statsSection: {
    width: '100%',
    marginBottom: 15,
  },
  historySection: {
    width: '100%',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2C3E50',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsRow: {
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    marginRight: 10,
  },
  detailItemFullWidth: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  languageTag: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  languageTagText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#007AFF',
  },
  statTitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
    textAlign: 'center',
  },
}); 