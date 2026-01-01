import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  ActivityIndicator, SafeAreaView, RefreshControl 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

export default function OrderListScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/');
      setOrders(response.data);
    } catch (error) {
      console.log("Order fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return '#10B981'; // Green
      case 'shipped': return '#3B82F6';   // Blue
      case 'cancelled': return '#EF4444'; // Red
      default: return '#F59E0B';          // Orange (Pending/Processing)
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={() => router.push(`/orders/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={[styles.iconBox, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Ionicons name="cube-outline" size={20} color={getStatusColor(item.status)} />
            </View>
            <View style={{marginLeft: 10}}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
            </View>
        </View>
        <Text style={[styles.statusBadge, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <Text style={styles.itemCount}>
            {item.items.length} {item.items.length === 1 ? 'Item' : 'Items'}
        </Text>
        <Text style={styles.amount}>₦{parseFloat(item.total_amount).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/home')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{width: 24}} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No orders yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 5 },

  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, padding: 15, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconBox: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  orderId: { fontWeight: 'bold', fontSize: 16, color: '#111' },
  date: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  statusBadge: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 5 },
  
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCount: { color: '#6B7280', fontSize: 14 },
  amount: { fontWeight: 'bold', fontSize: 18, color: '#2563EB' },
  
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#999' }
});