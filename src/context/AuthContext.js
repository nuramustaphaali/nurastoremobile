import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getToken, saveToken, deleteToken } from '../utils/storage'; // <--- IMPORT HERE

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // 1. Check if logged in on App Start
  const isLoggedIn = async () => {
    try {
      let token = await getToken('access_token'); // <--- UPDATED
      if (token) {
        setUserToken(token);
      }
    } catch (e) {
      console.log(`IsLoggedIn Error: ${e}`);
    }
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
      const { access, refresh } = response.data;

      setUserToken(access);
      
      // <--- UPDATED: Use helper to save
      await saveToken('access_token', access);
      await saveToken('refresh_token', refresh);

    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Logout Function
  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    
    // <--- UPDATED: Use helper to delete
    await deleteToken('access_token');
    await deleteToken('refresh_token');
    
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userToken }}>
      {children}
    </AuthContext.Provider>
  );
};