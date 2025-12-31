import React, { useContext } from 'react';
import { 
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { CartContext } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install: expo install @expo/vector-icons

const CartScreen = ({ navigation }) => {
  const { cartItems, cartTotal, updateQuantity, removeItem, loading } = useContext(CartContext);

  const formatPrice = (price) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.image }} style={styles.itemImage} />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.product.price)}</Text>
        
        <View style={styles.controls}>
          <View style={styles.qtyContainer}>
            <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.qtyText}>{item.quantity}</Text>
            
            <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && cartItems.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Cart</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#DDD" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.shopBtn}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(cartTotal)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutBtn} 
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: '800', margin: 20, color: '#1A1A1A' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  
  cartItem: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  itemImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F1F3F5' },
  itemDetails: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemPrice: { fontSize: 14, color: '#007BFF', fontWeight: '700' },
  
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 8 },
  qtyBtn: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18, color: '#333' },
  qtyText: { marginHorizontal: 10, fontWeight: '600' },
  deleteBtn: { padding: 5 },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#fff', padding: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 18, color: '#666' },
  totalValue: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  checkoutBtn: { backgroundColor: '#1A1A1A', height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -50 },
  emptyText: { fontSize: 18, color: '#999', marginVertical: 20 },
  shopBtn: { paddingVertical: 12, paddingHorizontal: 30, backgroundColor: '#007BFF', borderRadius: 25 },
  shopBtnText: { color: '#fff', fontWeight: '600' }
});

export default CartScreen;