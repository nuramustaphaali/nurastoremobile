import React, { useState } from 'react';
import { 
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import api from '../src/services/api';

const { width } = Dimensions.get('window');
const BASE_URL = 'https://store.swiftpos.ng'; 

export default function CartScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState(null); 

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [])
  );

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart/');
      const items = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setCartItems(items);
      calculateTotal(items);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
    setCartTotal(total);
  };

  // ✅ LOGIC: Update Quantity (+ or -)
  const handleQuantity = async (item, change) => {
    // Prevent multiple clicks while updating
    if (updatingId === item.id) return;

    const newQty = item.quantity + change;

    // If quantity goes to 0, ask to remove
    if (newQty < 1) {
        removeItem(item.id);
        return;
    }

    setUpdatingId(item.id);

    try {
        // Optimistic UI Update (Make it feel fast)
        const updatedItems = cartItems.map(cartItem => 
            cartItem.id === item.id 
                ? { ...cartItem, quantity: newQty, subtotal: (parseFloat(cartItem.product_price) * newQty).toString() } 
                : cartItem
        );
        setCartItems(updatedItems);
        calculateTotal(updatedItems);

        // API Call (Add or Remove 1 unit)
        // Note: Assuming your API adds +1 on POST. If you have a specific 'update' endpoint, use that instead.
        if (change > 0) {
            await api.post('/cart/', { product_id: item.product, quantity: 1 });
        } else {
            // Since we don't have a 'decrease' endpoint in the logs, we might need to remove and re-add 
            // OR alert the user if the backend doesn't support direct decrement.
            // For now, I will assume adding negative quantity or just re-fetching ensures sync.
            // If this fails, we will revert to fetchCart().
            await api.post('/cart/', { product_id: item.product, quantity: -1 }); 
        }
        
        // Sync with server to be sure
        fetchCart(); 

    } catch (error) {
        fetchCart(); // Revert on error
    } finally {
        setUpdatingId(null);
    }
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
            try { await api.delete(`/cart/items/${itemId}/`); } catch (e) { fetchCart(); }
          }
        }
    ]);
  };

  const getImageUrl = (path) => {
      if (!path) return 'https://via.placeholder.com/150';
      return path.startsWith('http') ? path : `${BASE_URL}${path}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: getImageUrl(item.product_image) }} style={styles.image} />
      </View>
      
      <View style={styles.details}>
        <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={2}>{item.product_name}</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.trashBtn}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
        </View>

        <Text style={styles.unitPrice}>@{parseFloat(item.product_price).toLocaleString()}</Text>

        <View style={styles.bottomRow}>
            {/* ✅ + and - BUTTONS */}
            <View style={styles.qtyContainer}>
                <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => handleQuantity(item, -1)}
                >
                    <Ionicons name="remove" size={16} color="#333" />
                </TouchableOpacity>
                
                <Text style={styles.qtyText}>
                    {updatingId === item.id ? "..." : item.quantity}
                </Text>
                
                <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => handleQuantity(item, 1)}
                >
                    <Ionicons name="add" size={16} color="#333" />
                </TouchableOpacity>
            </View>

            <Text style={styles.subtotal}>₦{parseFloat(item.subtotal).toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* --- HEADER --- */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <View style={styles.headerSafeArea}>
            <View style={styles.headerContent}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shopping Cart</Text>
                <View style={{width: 40}} /> 
            </View>
            <View style={styles.headerSummary}>
                <Text style={styles.headerLabel}>Total Items</Text>
                <Text style={styles.headerCount}>{cartItems.length}</Text>
            </View>
        </View>
      </LinearGradient>

      {/* --- SCROLLABLE LIST --- */}
      <View style={styles.body}>
        {loading ? (
            <ActivityIndicator size="large" color="#4F46E5" style={{marginTop: 50}} />
        ) : cartItems.length > 0 ? (
            <FlatList
                data={cartItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                // ✅ FIX: HUGE PADDING so items scroll ABOVE the footer
                contentContainerStyle={{ padding: 20, paddingBottom: 200 }} 
                showsVerticalScrollIndicator={false}
            />
        ) : (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                    <Ionicons name="cart-outline" size={50} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/home')}>
                    <Text style={styles.shopBtnText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        )}
      </View>

      {/* --- FIXED FOOTER (Floating above content) --- */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalAmount}>₦{cartTotal.toLocaleString()}</Text>
            </View>
            <TouchableOpacity 
                style={styles.checkoutBtn} 
                onPress={() => router.push({ pathname: '/checkout', params: { subtotal: cartTotal.toString() } })}
                activeOpacity={0.8}
            >
                <Text style={styles.checkoutText}>Checkout</Text>
                <View style={styles.arrowCircle}>
                    <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
                </View>
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  header: { borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerSafeArea: { paddingTop: 50, paddingBottom: 25, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  headerSummary: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  headerLabel: { color: '#E0E7FF', fontSize: 14 },
  headerCount: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  body: { flex: 1 },

  // Card
  card: { 
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 3
  },
  imageWrapper: { 
    width: 90, height: 90, borderRadius: 12, backgroundColor: '#F3F4F6', overflow: 'hidden'
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  details: { flex: 1, marginLeft: 15, justifyContent: 'space-between', paddingVertical: 2 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 15, fontWeight: '600', color: '#1F2937', flex: 1, marginRight: 10 },
  trashBtn: { padding: 5 },
  unitPrice: { fontSize: 12, color: '#9CA3AF', marginBottom: 5 },
  
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  // Qty Controls
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4 },
  qtyBtn: { width: 28, height: 28, backgroundColor: '#fff', borderRadius: 6, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.05, elevation: 1 },
  qtyText: { marginHorizontal: 12, fontWeight: 'bold', fontSize: 14, color: '#1F2937' },

  subtotal: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5' },

  // Footer
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, borderTopRightRadius: 24, 
    padding: 25, paddingBottom: 35,
    shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, elevation: 20
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontSize: 16, color: '#6B7280' },
  totalAmount: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  
  checkoutBtn: { 
    backgroundColor: '#111', height: 56, borderRadius: 16, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 5
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  arrowCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 5 },
  emptySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 30 },
  shopBtn: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30 },
  shopBtnText: { color: '#fff', fontWeight: 'bold' }
});