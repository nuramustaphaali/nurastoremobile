import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getToken, saveToken, deleteToken } from '../utils/storage'; 
import { router } from 'expo-router';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // Check if logged in on app start
  useEffect(() => {
    isLoggedIn();
  }, []);

  const isLoggedIn = async () => {
    try {
      let token = await getToken('access_token');
      let user = await getToken('user_info');
      
      if (token && user) {
        setUserInfo(JSON.parse(user));
      }
    } catch (e) {
      console.log(`IsLoggedIn Error: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/token/', { username, password });
      
      const { access, refresh } = response.data;
      
      // We assume the backend also returns user data, or we decode the token
      // If your backend doesn't return 'user', we can mock it or fetch it immediately
      const user = { username: username }; 

      setUserInfo(user);

      // SAVE TO STORAGE
      await saveToken('access_token', access);
      await saveToken('refresh_token', refresh);
      await saveToken('user_info', JSON.stringify(user));

      console.log("Login Success! Token saved.");
      router.replace('/home'); // Force navigation
      
    } catch (e) {
      console.log("Login failed", e);
      throw e; // Pass error to Login Screen to show alert
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
        setUserInfo(null);
        await deleteToken('access_token');
        await deleteToken('refresh_token');
        await deleteToken('user_info');
        router.replace('/login');
    } catch(e) {
        console.log("Logout error:", e);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};