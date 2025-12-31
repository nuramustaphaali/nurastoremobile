import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// 1. DETERMINE URL
// Android Emulator uses 10.0.2.2. iOS uses localhost. Real device uses Laptop IP.
const getBaseUrl = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8000/api'; 
    return 'http://127.0.0.1:8000/api'; // iOS Simulator
    // Note: If testing on real phone, replace with 'http://192.168.X.X:8000/api'
};

export const BASE_URL = getBaseUrl();

// 2. HELPER FUNCTION
export const apiCall = async (endpoint, method = 'GET', body = null) => {
    const token = await SecureStore.getItemAsync('access_token');
    
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) config.body = JSON.stringify(body);

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Something went wrong');
        }
        return data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};