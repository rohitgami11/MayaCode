import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Define types
export interface User {
  id: string;
  email: string;
  name: string;
  userType?: string;
  age?: number;
  location?: string;
  languages?: string[];
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  isAuthenticated: boolean;
  token: string | null;
  checkAuthStatus: () => Promise<void>;
  sendOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  const checkAuthStatus = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Checking auth status...');
      const storedToken = await AsyncStorage.getItem('authToken');
      
      if (storedToken) {
        // Verify token with backend
        const response = await axios.get(`${API_BASE_URL}/auth/verify-token`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        
        if (response.data.user) {
          setUser(response.data.user);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          await AsyncStorage.removeItem('authToken');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      console.error("Error checking auth status:", error);
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (email: string): Promise<boolean> => {
    setIsSendingOtp(true);
    try {
      console.log('Sending OTP to:', email);
      console.log('Using API URL:', API_BASE_URL);
      console.log('Full request URL:', `${API_BASE_URL.replace('/api', '')}/auth/request-otp`);
      
      // Skip health check for now - go directly to OTP request
      console.log('Attempting OTP request...');

      const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/auth/request-otp`, {
        email: email
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.success) {
        if (response.data.fallback) {
          // Development fallback - show OTP in console and toast
          console.log('🔑 OTP for development:', response.data.otp);
          Toast.show({
            type: 'info',
            text1: 'OTP Generated',
            text2: `Development mode: OTP is ${response.data.otp}`,
          });
        } else {
          Toast.show({
            type: 'success',
            text1: 'OTP Sent',
            text2: 'Please enter the OTP sent to your email.',
          });
        }
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      console.error("Full error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      let errorMessage = 'Please check your email and try again.';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Failed to send OTP',
        text2: errorMessage,
      });
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    setIsVerifyingOtp(true);
    try {
      console.log(`Verifying OTP for email: ${email}`);
      
      const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/auth/verify-otp`, {
        email: email,
        otp: otp
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.success && response.data.token && response.data.user) {
        // Store token and user data
        await AsyncStorage.setItem('authToken', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Logged in successfully',
        });

        router.replace('/(tabs)');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      console.error("Full error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: error.response?.data?.message || error.message || 'Please check the OTP and try again.',
      });
      return false;
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Logged out successfully',
      });

      router.replace('/login');
    } catch (error: any) {
      console.error("Error logging out:", error);
      Toast.show({
        type: 'error',
        text1: 'Logout Error',
        text2: error.message || 'Failed to log out',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isSendingOtp,
    isVerifyingOtp,
    isAuthenticated,
    token,
    checkAuthStatus,
    sendOtp,
    verifyOtp,
    signOut
  };

  // Only show loading screen when explicitly loading auth status
  if (isLoading && isSendingOtp === false && isVerifyingOtp === false) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e9' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, color: '#4a5568' }}>Loading authentication status...</Text>
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
