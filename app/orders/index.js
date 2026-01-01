import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  ActivityIndicator, SafeAreaView, RefreshControl 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      case 'delivered': return '#10B981'; 
      case 'shipped': return '#3B82F6';   
      case 'cancelled': return '#EF4444'; 
      default: return '#F59E0B';          
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={() => router.push(`/orders/${item.id}`)}
    >
      <View style={styles.cardTop}>
        <View style={styles.idRow}>
            <View style={[styles.iconBox, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <Ionicons name="cube" size={18} color={getStatusColor(item.status)} />
            </View>
            <View style={{marginLeft: 10}}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBottom}>
        <Text style={styles.itemCount}>{item.items.length} Items</Text>
        <Text style={styles.amount}>₦{parseFloat(item.total_amount).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <SafeAreaView>
            <View style={styles.headerContent}>
                <TouchableOpacity onPress={() => router.push('/home')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={{width: 24}} /> 
            </View>
        </SafeAreaView>
      </LinearGradient>

      {/* --- CONTENT --- */}
      <View style={styles.content}>
        {loading ? (
            <ActivityIndicator size="large" color="#4F46E5" style={{marginTop: 50}} />
        ) : (
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
                        </View>
                        <Text style={styles.emptyText}>No orders placed yet.</Text>
                        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/home')}>
                            <Text style={styles.shopBtnText}>Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  backBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },

  content: { flex: 1, paddingHorizontal: 20, marginTop: 15 },

  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 15, padding: 15, shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  idRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  orderId: { fontWeight: 'bold', fontSize: 16, color: '#1F2937' },
  date: { color: '#9CA3AF', fontSize: 12 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCount: { color: '#6B7280', fontSize: 14 },
  amount: { fontWeight: 'bold', fontSize: 18, color: '#4F46E5' },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyText: { color: '#6B7280', fontSize: 16, marginBottom: 20 },
  shopBtn: { backgroundColor: '#111', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30 },
  shopBtnText: { color: '#fff', fontWeight: 'bold' }
});