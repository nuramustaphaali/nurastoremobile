import React, { createContext, useState, useEffect, useContext } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { fetchCart, addToCart, updateCartItem, removeCartItem } from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { userToken } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Toast State
  const [toastMsg, setToastMsg] = useState('');
  const fadeAnim = new Animated.Value(0);

  // Load Cart when User Logs in
  useEffect(() => {
    if (userToken) refreshCart();
  }, [userToken]);

  const refreshCart = async () => {
    setLoading(true);
    try {
      const data = await fetchCart();
      setCartItems(data.items);
      setCartTotal(data.total_price);
      setCartCount(data.total_items);
    } catch (e) {
      console.log('Error fetching cart', e);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId) => {
    try {
      await addToCart(productId);
      showToast('Added to Cart!');
      refreshCart(); // Refresh to update badge count
    } catch (e) {
      showToast('Error adding item', true);
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      // Optimistic Update (Update UI immediately before server responds)
      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQty } : item
      ));
      
      await updateCartItem(itemId, newQty);
      refreshCart(); // Sync with server to get accurate totals
    } catch (e) {
      refreshCart(); // Revert on error
    }
  };

  const removeItem = async (itemId) => {
    try {
      await removeCartItem(itemId);
      refreshCart();
    } catch (e) {
      console.log(e);
    }
  };

  // Toast Logic
  const showToast = (msg, isError = false) => {
    setToastMsg(msg);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start();
  };

  return (
    <CartContext.Provider value={{ 
      cartCount, cartItems, cartTotal, loading, 
      refreshCart, addItem, updateQuantity, removeItem 
    }}>
      {children}
      
      {/* Global Toast Component */}
      <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>
    </CartContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute', bottom: 100, alignSelf: 'center',
    backgroundColor: '#333', paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 25, elevation: 5, zIndex: 1000
  },
  toastText: { color: '#fff', fontWeight: 'bold' }
});