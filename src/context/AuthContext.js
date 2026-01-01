import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // 1. Check Login Status on App Start
  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await AsyncStorage.getItem('userToken');
      let user = await AsyncStorage.getItem('userInfo');

      if (token) {
        setUserToken(token);
        if (user) {
            setUserInfo(JSON.parse(user));
        }
        // Optional: Validate token with backend here
      }
    } catch (e) {
      console.log(`Login Status Error: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  // 2. Login Function
  const login = async (username, password) => {
    setIsLoading(true);
    try {
        // A. Get Token
        const response = await api.post('/token/', { username, password });
        
        // Ensure we handle different response structures
        const token = response.data.access || response.data.token; 
        
        if (!token) {
            throw new Error("Invalid response from server (No token).");
        }

        setUserToken(token);
        await AsyncStorage.setItem('userToken', token);

        // B. Fetch User Details (So Profile page works)
        // We temporarily attach the header manually since interceptors might not have picked it up yet
        try {
            const userResponse = await api.get('/me/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userData = userResponse.data;
            setUserInfo(userData);
            await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
        } catch (profileError) {
            console.log("Could not fetch profile:", profileError);
            // Fallback: Save basic username if profile fetch fails
            const basicUser = { username };
            setUserInfo(basicUser);
            await AsyncStorage.setItem('userInfo', JSON.stringify(basicUser));
        }

    } catch (error) {
        console.log("Login Error:", error);
        const msg = error.response?.data?.detail || "Invalid credentials";
        Alert.alert("Login Failed", msg);
        throw error; // Propagate error so LoginScreen can stop spinner
    } finally {
        setIsLoading(false);
    }
  };

  // 3. Register Function
  const register = async (username, email, password, confirmPassword) => {
    setIsLoading(true);
    try {
        const payload = {
            username, 
            email, 
            password,
            password_confirm: confirmPassword // Backend usually expects this match
        };
        
        await api.post('/register/', payload);
        
        // We don't auto-login here to encourage email verification or manual login
        return true; 

    } catch (error) {
        console.log("Register Error:", error.response?.data);
        
        // Extract useful error message from Django array response
        let msg = "Registration failed.";
        if (error.response?.data) {
            const data = error.response.data;
            // Check if username/email specific errors exist
            if (data.username) msg = data.username[0];
            else if (data.email) msg = data.email[0];
            else if (data.password) msg = data.password[0];
            else if (data.detail) msg = data.detail;
        }
        
        Alert.alert("Registration Failed", msg);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  // 4. Logout Function
  const logout = async () => {
    setIsLoading(true);
    try {
        // Optional: Call backend logout if needed
        // await api.post('/logout/'); 
    } catch (e) {
        console.log("Logout error", e);
    } finally {
        setUserToken(null);
        setUserInfo(null);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
        setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
        login, 
        logout, 
        register, 
        isLoading, 
        userToken, 
        userInfo 
    }}>
      {children}
    </AuthContext.Provider>
  );
};