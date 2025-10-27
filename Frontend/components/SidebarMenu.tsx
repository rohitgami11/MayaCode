import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Image, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/models/User';
import { userService } from '@/services/userService';

const { width } = Dimensions.get('window');

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 1, title: 'Home', icon: 'home-outline', route: '/' },
  { id: 2, title: 'Help posts', icon: 'heart-outline', route: '/helpAndAsk' },
  { id: 3, title: 'Stories', icon: 'list-outline', route: '/stories' },
  { id: 4, title: 'My chats', icon: 'chatbubble-outline', route: '/chat' },
  { id: 5, title: 'My tasks', icon: 'hand-right-outline', route: '/tasks' },
  { id: 6, title: 'Notifications', icon: 'notifications-outline', route: '/notifications', badge: 1 },
  { id: 7, title: 'Language Selector', icon: 'language-outline', route: '/language' },
];

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const translateX = React.useRef(new Animated.Value(width)).current; // Start from right (positive value)
  const segments = useSegments();
  const { user, isLoading, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const activeRoute = '/' + segments.join('/');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setIsLoadingProfile(true);
        try {
          const profile = await userService.getUserProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : width, // Slide in from right (positive to 0)
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleNavigation = (route: string) => {
    if (activeRoute !== route) {
      router.push(route);
    }
    onClose();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1,
          }}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0, // Changed from left: 0 to right: 0
          bottom: 0,
          width: width * 0.75,
          backgroundColor: '#e8f5e9',
          transform: [{ translateX }],
          zIndex: 2,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: -2, height: 0 }, // Negative offset for right side shadow
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          borderTopLeftRadius: 20, // Changed from borderTopRightRadius
          borderBottomLeftRadius: 20, // Changed from borderBottomRightRadius
        }}
      >
        <View style={{ padding: 20, flex: 1 }}>
          <View className="flex-row items-center mb-8">
            <Image 
              source={require('@/assets/MayaCode-logo.png')}
              style={{ width: 40, height: 40, marginRight: 10 }} 
            />
            <Text className="text-xl font-bold text-gray-800">MayaCode</Text>
          </View>

          <View className="flex-1">
            {menuItems.map((item) => {
              const isActive = (item.route === '/' && activeRoute === '/(') || item.route === activeRoute;
              return (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center py-3 px-4 rounded-lg mb-2 ${
                    isActive ? 'bg-green-600' : ''
                  }`}
                  onPress={() => handleNavigation(item.route)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={isActive ? '#ffffff' : '#4a5568'}
                    style={{ marginRight: 16 }}
                  />
                  <Text className={`text-lg ${
                    isActive ? 'text-white font-semibold' : 'text-gray-800'
                  }`}>
                    {item.title}
                  </Text>
                  {item.badge && (
                    <View className="ml-auto bg-red-500 rounded-full w-6 h-6 items-center justify-center">
                      <Text className="text-white text-xs font-bold">{item.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ marginTop: 'auto' }}>
            <View className="flex-row items-center mb-4">
              <Ionicons name="person-circle-outline" size={40} color="#4a5568" style={{ marginRight: 12 }} />
              <TouchableOpacity onPress={() => handleNavigation("/profile")}>
                <Text className="text-lg font-semibold text-gray-800">
                  {isLoading || isLoadingProfile ? 'Loading...' : userProfile?.name || user?.email || 'Profile'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              className="flex-row items-center py-3 px-4 rounded-lg bg-red-500 mb-4"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#ffffff" style={{ marginRight: 16 }} />
              <Text className="text-lg text-white font-semibold">Logout</Text>
            </TouchableOpacity>

            <View className="flex-row justify-around">
              <TouchableOpacity><Ionicons name="help-circle-outline" size={24} color="#4a5568" /></TouchableOpacity>
              <TouchableOpacity><Ionicons name="language-outline" size={24} color="#4a5568" /></TouchableOpacity>
              <TouchableOpacity><Ionicons name="settings-outline" size={24} color="#4a5568" /></TouchableOpacity>
              <TouchableOpacity><Ionicons name="bookmark-outline" size={24} color="#4a5568" /></TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
} 