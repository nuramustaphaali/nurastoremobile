import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, 
  ActivityIndicator, SafeAreaView, Alert 
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [])
  );

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart/');
      // Handle array or object response
      let items = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setCartItems(items);
      calculateTotal(items);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setCartItems([]); // Empty cart is not an error
      } else {
        console.log("Cart Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- SMART HELPER TO FIND PRICE ---
  const getItemPrice = (item) => {
    // Check all possible places the price might be hiding
    const rawPrice = item.price 
                  || item.unit_price 
                  || item.product?.price 
                  || item.product_price 
                  || 0;
    return parseFloat(rawPrice); // Force it to be a number
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
        return sum + (getItemPrice(item) * (item.quantity || 1));
    }, 0);
    setSubtotal(total);
  };

  const removeItem = async (itemId) => {
    Alert.alert("Remove Item", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", style: 'destructive',
          onPress: async () => {
            const newItems = cartItems.filter(item => item.id !== itemId);
            setCartItems(newItems);
            calculateTotal(newItems);
            try { await api.delete(`/cart/items/${itemId}/`); } catch (e) {}
          }
        }
    ]);
  };

  const renderItem = ({ item }) => {
    const price = getItemPrice(item);
    const totalItemPrice = price * item.quantity;
    const name = item.product?.name || item.product_name || item.name || "Product";
    const image = item.product?.image || item.image || null;

    return (
        <View style={styles.cartItem}>
          <Image 
              source={{ uri: image || 'https://via.placeholder.com/100' }} 
              style={styles.itemImage} 
          />
          <View style={styles.itemDetails}>
              <Text style={styles.itemTitle} numberOfLines={1}>{name}</Text>
              <Text style={styles.itemPrice}>₦{price.toLocaleString()}</Text>
              <Text style={styles.qtyLabel}>Qty: {item.quantity}</Text>
          </View>
          <View style={styles.rightActions}>
              <Text style={styles.totalItemPrice}>₦{totalItemPrice.toLocaleString()}</Text>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color="#FF4757" />
              </TouchableOpacity>
          </View>
        </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#000" style={{marginTop: 50}} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart ({cartItems.length})</Text>
        <View style={{width: 24}} /> 
      </View>

      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.footer}>
            <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>₦{subtotal.toLocaleString()}</Text>
            </View>
            <TouchableOpacity 
                style={styles.checkoutBtn} 
                onPress={() => router.push({ pathname: '/checkout', params: { subtotal } })}
            >
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{marginLeft: 5}} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Cart is empty</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  listContent: { padding: 15 },
  cartItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 15, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  itemPrice: { fontSize: 13, color: '#666', marginTop: 2 },
  qtyLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  rightActions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 60 },
  totalItemPrice: { fontSize: 14, fontWeight: 'bold', color: '#2563EB' },
  deleteBtn: { padding: 5 },
  footer: { padding: 25, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 16, color: '#666' },
  totalValue: { fontSize: 24, fontWeight: 'bold' },
  checkoutBtn: { backgroundColor: '#111', height: 50, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#888', marginTop: 10 }
});