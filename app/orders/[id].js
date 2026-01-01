import React, { useEffect, useState } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, ActivityIndicator, 
  SafeAreaView, TouchableOpacity, Image 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const response = await api.get(`/orders/${id}/`);
      setOrder(response.data);
    } catch (error) {
      console.log("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#000" style={{marginTop: 50}} />;
  if (!order) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '#10B981';
      case 'shipped': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* --- STATUS HEADER --- */}
        <View style={styles.statusCard}>
            <View>
                <Text style={styles.label}>Order ID</Text>
                <Text style={styles.orderId}>#{order.id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status?.toUpperCase()}
                </Text>
            </View>
        </View>

        <Text style={styles.dateText}>
            Placed on {new Date(order.created_at).toLocaleString()}
        </Text>

        {/* --- ITEMS LIST --- */}
        <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
        <View style={styles.card}>
            {order.items.map((item, index) => (
                <View key={index} style={[styles.itemRow, index === order.items.length - 1 && {borderBottomWidth: 0}]}>
                    <View style={styles.qtyBox}>
                        <Text style={styles.qtyText}>{item.quantity}x</Text>
                    </View>
                    <View style={{flex: 1, marginHorizontal: 15}}>
                        <Text style={styles.itemName}>{item.product_name}</Text>
                    </View>
                    <Text style={styles.itemPrice}>
                        ₦{(parseFloat(item.price) * item.quantity).toLocaleString()}
                    </Text>
                </View>
            ))}
        </View>

        {/* --- SHIPPING INFO --- */}
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        <View style={styles.card}>
            <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={18} color="#666" />
                <Text style={styles.infoText}>{order.full_name}</Text>
            </View>
            <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color="#666" />
                <Text style={styles.infoText}>{order.phone}</Text>
            </View>
            <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.infoText}>
                    {order.address}, {order.city}, {order.state}
                </Text>
            </View>
        </View>

        {/* --- PAYMENT SUMMARY --- */}
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.card}>
            <View style={styles.summaryRow}>
                <Text style={styles.label}>Total Amount</Text>
                <Text style={styles.totalAmount}>₦{parseFloat(order.total_amount).toLocaleString()}</Text>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  
  // Status Card
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  orderId: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  label: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  dateText: { color: '#9CA3AF', fontSize: 13, marginBottom: 25 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10, color: '#374151' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.03, elevation: 1 },

  // Items
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  qtyBox: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  qtyText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  itemName: { fontSize: 15, color: '#1F2937' },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#111' },

  // Shipping
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { marginLeft: 10, fontSize: 15, color: '#4B5563' },

  // Summary
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#2563EB' }
});