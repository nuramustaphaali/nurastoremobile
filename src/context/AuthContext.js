import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getToken, saveToken, deleteToken } from '../utils/storage'; // Your helper file

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // ============================================================
  // 1. CHECK LOGIN STATUS ON APP START
  // ============================================================
  const isLoggedIn = async () => {
    try {
      let token = await getToken('access_token');
      let user = await getToken('user_info');
      
      if (token) {
        setUserToken(token);
        setUserInfo(user ? JSON.parse(user) : null);
      }
    } catch (e) {
      console.log(`IsLoggedIn Error: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  // ============================================================
  // 2. LOGIN FUNCTION (With Debugging)
  // ============================================================
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      // API CALL
      const response = await api.post('/token/', { username, password });
      
      // DESTRUCTURE RESPONSE (Adjust if your backend returns different keys)
      const { access, refresh, user } = response.data;

      // SAVE TO STATE
      setUserToken(access);
      if (user) setUserInfo(user);

      // SAVE TO STORAGE (Persistent)
      await saveToken('access_token', access);
      await saveToken('refresh_token', refresh);
      if (user) await saveToken('user_info', JSON.stringify(user));

      console.log("Login Success!");

    } catch (e) {
      // --- DETAILED ERROR LOGGING ---
      if (e.response) {
        // The server responded with a status code other than 2xx
        console.error("Server Error Data:", e.response.data);
        console.error("Server Status:", e.response.status);
        alert(`Server Error: ${JSON.stringify(e.response.data)}`); 
      } else if (e.request) {
        // The request was made but no response was received (Network Error)
        console.error("Network Error (No Response). Check your IP Address in api.js");
        alert("Network Error: Could not connect to the server. Please check your internet connection or IP address.");
      } else {
        // Something happened in setting up the request
        console.error("Error Message:", e.message);
        alert(`Error: ${e.message}`);
      }
      throw e; // Re-throw so the LoginScreen knows it failed
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // 3. REGISTER FUNCTION
  // ============================================================
  const register = async (username, email, password, confirm_password) => {
    setIsLoading(true);
    try {
      await api.post('/register/', {
        username,
        email,
        password,
        confirm_password, // <--- SENDING THIS NOW
      });
      // Success
    } catch (e) {
      if (e.response) {
        console.error("Registration Server Error:", e.response.data);
        alert(`Registration Failed: ${JSON.stringify(e.response.data)}`);
      } else if (e.request) {
        console.error("Registration Network Error");
        alert("Network Error: Could not reach the server.");
      } else {
        alert(`Error: ${e.message}`);
      }
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // 4. LOGOUT FUNCTION
  // ============================================================
  const logout = async () => {
    setIsLoading(true);
    try {
        setUserToken(null);
        setUserInfo(null);
        await deleteToken('access_token');
        await deleteToken('refresh_token');
        await deleteToken('user_info');
    } catch(e) {
        console.log("Logout error:", e);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ login, logout, register, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};