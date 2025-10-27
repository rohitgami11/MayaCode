import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import SidebarMenu from '@/components/SidebarMenu';
import { useTheme } from '@react-navigation/native';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useTheme(); // Use theme to get colors if available

  const renderTabIcon = (
    iconName: keyof typeof Ionicons.glyphMap,
    name: string,
    focused: boolean,
    color: string
  ) => (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center', 
      width: 72,
      paddingHorizontal: 0
    }}>
      <Ionicons
        name={iconName}
        size={24}
        color={color}
        style={{ marginBottom: 2 }}
      />
      <Text
        style={{
          fontSize: 12,
          color,
          fontWeight: focused ? '600' : '400',
          textAlign: 'center',
          lineHeight: 12,
        }}
      >
        {name}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8f5e9' }}>
      <View className="flex-1">
        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            tabBarActiveTintColor: '#2874F0',
            tabBarInactiveTintColor: '#828282',
            tabBarItemStyle: {
              width: "100%",
              height: '100%',
              justifyContent: "flex-start",
              alignItems: "center",
              paddingTop: 6,
              paddingBottom: 0,
            },
            tabBarLabelStyle: {
              fontSize: 9,
              textAlign: 'center',
              includeFontPadding: false,
            },
            tabBarStyle: {
              backgroundColor: "#e8f5e9",
              height: 60,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderTopWidth: 1,
              borderTopColor: "#e0e0e0",
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => renderTabIcon('home-outline', 'Home', focused, color),
            }}
          />
          <Tabs.Screen
            name="stories"
            options={{
              title: 'Stories',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => renderTabIcon('book-outline', 'Stories', focused, color),
            }}
          />
          <Tabs.Screen
            name="helpAndAsk"
            options={{
              title: 'Help & Ask',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => renderTabIcon('help-circle-outline', 'Help & Ask', focused, color),
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              title: 'Chat',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => renderTabIcon('chatbubble-outline', 'Chat', focused, color),
            }}
          />
          <Tabs.Screen
            name="menu"
            options={{
              title: 'Menu',
              headerShown: false,
              tabBarButton: (props) => {
                 const isSelected = props.accessibilityState?.selected ?? false;
                 const iconColor = isSelected ? '#2874F0' : '#828282';
                 const { style, onPress, ...restProps } = props as any;

                 return (
                  <TouchableOpacity
                    {...restProps}
                    style={[style, { width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'center', paddingTop: 6, paddingBottom: 0 }]}
                    onPress={() => setIsSidebarOpen(true)}
                  >
                   {renderTabIcon('menu-outline', 'Menu', isSelected, iconColor)}
                  </TouchableOpacity>
                );
              },
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="create-story"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="individual-chat"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="login"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="tasks"
            options={{
              href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="language"
            options={{
              href: null,
              headerShown: false,
            }}
          />
        </Tabs>
        <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </View>
    </SafeAreaView>
  );
};

export default Layout;