import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, Image, StyleSheet, ScrollView, 
  SafeAreaView, ActivityIndicator, TouchableOpacity, TextInput, Modal 
} from 'react-native';
import { fetchOrderDetails, submitReview } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const data = await fetchOrderDetails(orderId);
      setOrder(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if(!selectedItem) return;
    try {
        await submitReview(selectedItem.product.id, rating, comment);
        alert('Review Submitted!');
        setModalVisible(false);
        setComment('');
    } catch(e) {
        alert('Failed to submit review');
    }
  };

  const openReviewModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#000" />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Status Header */}
        <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Order Status</Text>
            <Text style={styles.statusText}>{order.status}</Text>
        </View>

        {/* Address Card */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Details</Text>
            <Text style={styles.addressText}>{order.address}</Text>
            <Text style={styles.addressText}>{order.city}, {order.state}</Text>
            <Text style={styles.addressText}>{order.phone}</Text>
        </View>

        {/* Items List */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
            {order.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                    <Image source={{ uri: item.product.image }} style={styles.itemImage} />
                    <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.product.name}</Text>
                        <Text style={styles.itemMeta}>Qty: {item.quantity} | ₦{item.price}</Text>
                        
                        {/* Review Button Logic */}
                        {order.status.toLowerCase() === 'delivered' && (
                            <TouchableOpacity onPress={() => openReviewModal(item)} style={styles.reviewBtn}>
                                <Text style={styles.reviewBtnText}>Write a Review</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
             <View style={styles.row}><Text>Subtotal</Text><Text>₦{order.subtotal}</Text></View>
             <View style={styles.row}><Text>Delivery</Text><Text>₦{order.delivery_fee}</Text></View>
             <View style={[styles.row, styles.totalRow]}><Text style={styles.totalText}>Total</Text><Text style={styles.totalText}>₦{order.total_amount}</Text></View>
        </View>

      </ScrollView>

      {/* Review Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Rate {selectedItem?.product.name}</Text>
                
                {/* Star Rating Input (Simplified) */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Ionicons name={star <= rating ? "star" : "star-outline"} size={32} color="#FFC107" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput 
                    style={styles.input} 
                    placeholder="Write your experience..." 
                    multiline 
                    value={comment}
                    onChangeText={setComment}
                />
                
                <TouchableOpacity style={styles.submitBtn} onPress={handleReview}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit Review</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setModalVisible(false)}>
                    <Text style={{ color: '#666' }}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  statusHeader: { backgroundColor: '#1A1A1A', padding: 20, alignItems: 'center' },
  statusTitle: { color: '#888', fontSize: 12, textTransform: 'uppercase' },
  statusText: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 5, textTransform: 'uppercase' },
  
  section: { backgroundColor: '#fff', padding: 20, marginTop: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  addressText: { color: '#666', marginBottom: 5, fontSize: 15 },
  
  itemRow: { flexDirection: 'row', marginBottom: 20 },
  itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: { fontWeight: '600', fontSize: 15, color: '#333' },
  itemMeta: { color: '#888', marginTop: 4, fontSize: 13 },
  reviewBtn: { marginTop: 8 },
  reviewBtnText: { color: '#007BFF', fontSize: 13, fontWeight: '600' },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 5 },
  totalText: { fontWeight: 'bold', fontSize: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 15, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', height: 80, backgroundColor: '#F8F9FA', borderRadius: 10, padding: 10, textAlignVertical: 'top' },
  submitBtn: { width: '100%', backgroundColor: '#007BFF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 }
});

export default OrderDetailScreen;