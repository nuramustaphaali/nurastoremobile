import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // 1. Check if user is logged in when app opens
  const isLoggedIn = async () => {
    try {
      let token = await AsyncStorage.getItem('userToken');
      let userInfo = await AsyncStorage.getItem('userInfo');

      if (token) {
        setUserToken(token);
        setUserInfo(JSON.parse(userInfo));
      }
    } catch (e) {
      console.log(`Loggin Error ${e}`);
    }
    // IMPORTANT: Only set loading to false AFTER checking
    setIsLoading(false);
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  // 2. Login Function
  const login = async (username, password) => {
    setIsLoading(true);
    try {
        const response = await api.post('/token/', { username, password });
        
        const token = response.data.access;
        const decodedUser = { username }; // You might want to decode token or fetch profile here
        
        setUserToken(token);
        setUserInfo(decodedUser);
        
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(decodedUser));
    } catch (error) {
        console.log("Login Error", error);
        throw error; // Let the screen handle the alert
    } finally {
        setIsLoading(false);
    }
  };

  // 3. Register Function
  const register = async (username, email, password) => {
    setIsLoading(true);
    try {
        await api.post('/register/', { username, email, password });
        // Don't auto-login, let them login manually or navigate to login
    } catch (error) {
        console.log("Register Error", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  // 4. Logout Function
  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ login, logout, register, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};