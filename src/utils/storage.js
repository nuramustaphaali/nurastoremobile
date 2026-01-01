import AsyncStorage from '@react-native-async-storage/async-storage';

// Save Token
export const saveToken = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    console.log(`Saved ${key}:`, value); // Debug log
  } catch (e) {
    console.error("Error saving token:", e);
  }
};

// Get Token
export const getToken = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.error("Error getting token:", e);
    return null;
  }
};

// Delete Token (Logout)
export const deleteToken = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("Error deleting token:", e);
  }
};