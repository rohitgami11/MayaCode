import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function Header() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View 
      className="flex-row items-center justify-between px-4 py-3"
      style={{ backgroundColor: '#FDFDE3' }}
    >
      <View className="flex-row items-center">
        <Image 
           source={require('@/assets/MayaCode-logo.png')}
           style={{ width: 30, height: 30, marginRight: 8 }}
         />
        <Text className="text-xl font-bold text-[#2C3E50]">MayaCode</Text>
      </View>

      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => router.push('/notifications')} className="mr-4 relative">
          <Ionicons name="notifications-outline" size={24} color="#2C3E50" />
          <View className="absolute -top-1 -right-1 bg-[#E74C3C] rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-white text-xs">1</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Ionicons name="person-circle-outline" size={30} color="#2C3E50" />
        </TouchableOpacity>
      </View>
    </View>
  );
} 