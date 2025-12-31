import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView 
} from 'react-native';
import { fetchOrders } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const OrderListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return '#28A745'; // Green
      case 'shipped': return '#007BFF';   // Blue
      case 'pending': return '#FFC107';   // Yellow/Orange
      case 'cancelled': return '#DC3545'; // Red
      default: return '#6C757D';
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Total Amount:</Text>
        <Text style={styles.value}>₦{item.total_amount}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Items:</Text>
        <Text style={styles.value}>{item.items_count} Items</Text>
      </View>

      <View style={styles.footer}>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <View style={styles.link}>
            <Text style={styles.linkText}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color="#007BFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
         </TouchableOpacity>
         <Text style={styles.title}>My Orders</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={styles.empty}>No orders found.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  date: { color: '#999', fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { color: '#666' },
  value: { fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F3F5' },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  link: { flexDirection: 'row', alignItems: 'center' },
  linkText: { color: '#007BFF', fontWeight: '600', marginRight: 5, fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default OrderListScreen;