import React, { useEffect, useState } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, ActivityIndicator, 
  SafeAreaView, TouchableOpacity 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;
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
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <SafeAreaView>
            <View style={styles.headerContent}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{width: 24}} /> 
            </View>
            
            {/* Header Content */}
            <View style={styles.headerHero}>
                <Text style={styles.heroLabel}>Total Amount</Text>
                <Text style={styles.heroAmount}>₦{parseFloat(order.total_amount).toLocaleString()}</Text>
                <View style={[styles.heroStatus, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.heroStatusText}>{order.status.toUpperCase()}</Text>
                </View>
            </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* --- INFO CARDS --- */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Order ID</Text>
                    <Text style={styles.rowValue}>#{order.id}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Date</Text>
                    <Text style={styles.rowValue}>{new Date(order.created_at).toLocaleString()}</Text>
                </View>
            </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
            <View style={styles.card}>
                {order.items.map((item, index) => (
                    <View key={index} style={[styles.itemRow, index === order.items.length - 1 && {borderBottomWidth: 0}]}>
                        <View style={styles.qtyBox}>
                            <Text style={styles.qtyText}>{item.quantity}x</Text>
                        </View>
                        <View style={{flex: 1, marginHorizontal: 15}}>
                            <Text style={styles.itemName}>{item.product_name}</Text>
                            <Text style={styles.itemPriceUnit}>@{parseFloat(item.price).toLocaleString()}</Text>
                        </View>
                        <Text style={styles.itemTotal}>
                            ₦{(parseFloat(item.price) * item.quantity).toLocaleString()}
                        </Text>
                    </View>
                ))}
            </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Details</Text>
            <View style={styles.card}>
                <View style={styles.iconRow}>
                    <Ionicons name="person" size={18} color="#6B7280" />
                    <Text style={styles.iconText}>{order.full_name}</Text>
                </View>
                <View style={styles.iconRow}>
                    <Ionicons name="call" size={18} color="#6B7280" />
                    <Text style={styles.iconText}>{order.phone}</Text>
                </View>
                <View style={styles.iconRow}>
                    <Ionicons name="location" size={18} color="#6B7280" />
                    <Text style={styles.iconText}>
                        {order.address}, {order.city}, {order.state}
                    </Text>
                </View>
            </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  backBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },
  
  headerHero: { alignItems: 'center' },
  heroLabel: { color: '#E0E7FF', fontSize: 14, marginBottom: 5 },
  heroAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  heroStatus: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  heroStatusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  content: { padding: 20, paddingBottom: 50 },
  
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 10, marginLeft: 5 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 15, shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, elevation: 2 },
  
  // Info Rows
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { color: '#6B7280', fontSize: 14 },
  rowValue: { color: '#111', fontWeight: '600', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },

  // Items
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  qtyBox: { backgroundColor: '#F3F4F6', width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  itemName: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  itemPriceUnit: { fontSize: 12, color: '#9CA3AF' },
  itemTotal: { fontSize: 14, fontWeight: 'bold', color: '#4F46E5' },

  // Shipping Icons
  iconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconText: { marginLeft: 12, fontSize: 14, color: '#4B5563', flex: 1 },
});