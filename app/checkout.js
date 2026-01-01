import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, ScrollView, Alert, ActivityIndicator, Modal, FlatList,
  Linking // ✅ Required for opening Paystack
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import api from '../src/services/api';

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const subtotal = params.subtotal ? parseFloat(params.subtotal) : 0;

  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('POD'); 

  const [formData, setFormData] = useState({
    fullName: '', address: '', city: '', phone: '', note: ''
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await api.get('/delivery-zones/');
      setZones(response.data);
    } catch (error) { console.log("Error fetching zones:", error); }
  };

  const handleSelectZone = (item) => {
    setSelectedZone(item);
    setModalVisible(false);
    if (!formData.city) setFormData(prev => ({ ...prev, city: item.state }));
  };

  // ✅ 1. MAIN CHECKOUT FUNCTION
  const handleCheckout = async () => {
    if (!selectedZone || !formData.fullName || !formData.address || !formData.city || !formData.phone) {
      Alert.alert("Missing Info", "Please fill in all details.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        delivery_zone_id: selectedZone.id,
        state: selectedZone.state,
        full_name: formData.fullName,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        note: formData.note,
        payment_method: paymentMethod
      };

      const response = await api.post('/checkout/', payload);
      
      // ✅ FIX: LOG THE RESPONSE TO SEE WHAT IS COMING
      console.log("Checkout Response:", response.data);

      if (paymentMethod === 'PAYSTACK') {
          // ✅ FIX: Use 'auth_url' (from your Python code) instead of 'authorization_url'
          const { auth_url, reference } = response.data; 
          
          if (auth_url) {
              const supported = await Linking.canOpenURL(auth_url);
              if (supported) {
                  await Linking.openURL(auth_url);
                  
                  setLoading(false);
                  Alert.alert(
                      "Payment in Progress",
                      "We have opened the payment page in your browser.\n\nPlease complete the payment and then click 'I Have Paid' below.",
                      [
                          { text: "Cancel", style: "cancel" },
                          { 
                            text: "I Have Paid", 
                            // Use reference from backend to verify
                            onPress: () => verifyPayment(reference) 
                          }
                      ],
                      { cancelable: false }
                  );
              } else {
                  Alert.alert("Error", "Cannot open browser for payment.");
              }
          } else {
              Alert.alert("Error", "Payment URL not received from server.");
              setLoading(false);
          }

      } else {
          Alert.alert("Order Successful", "Your order has been placed successfully!", [{ text: "View Order", onPress: () => router.replace('/orders/') }]);
          setLoading(false);
      }

    } catch (error) {
      const msg = error.response?.data?.detail || "Could not process order.";
      Alert.alert("Checkout Failed", msg);
      setLoading(false);
    }
  };

  // ✅ 2. VERIFY PAYMENT FUNCTION
  const verifyPayment = async (ref) => {
      if (!ref) {
          Alert.alert("Error", "No transaction reference found.");
          return;
      }
      setLoading(true);
      try {
          await api.get(`/payment/verify/?reference=${ref}`);
          Alert.alert("Success", "Payment Verified! Your order is confirmed.", [
              { text: "View Order", onPress: () => router.replace('/orders/') }
          ]);
      } catch (error) {
          Alert.alert(
              "Verification Failed", 
              "We couldn't verify the payment yet. If you have been debited, please contact support.",
              [
                  { text: "Try Again", onPress: () => verifyPayment(ref) },
                  { text: "Go to Orders", onPress: () => router.replace('/orders/') }
              ]
          );
      } finally {
          setLoading(false);
      }
  };

  const deliveryFee = selectedZone ? parseFloat(selectedZone.fee) : 0;
  const grandTotal = subtotal + deliveryFee;

  const PaymentOption = ({ id, icon, title, subtitle }) => (
    <TouchableOpacity 
      style={[styles.paymentOption, paymentMethod === id && styles.selectedOption]} 
      onPress={() => setPaymentMethod(id)}
    >
      <View style={styles.payIconBox}>
        <FontAwesome name={icon} size={20} color={paymentMethod === id ? "#4F46E5" : "#6B7280"} />
      </View>
      <View style={{flex: 1}}>
        <Text style={[styles.payTitle, paymentMethod === id && {color: '#4F46E5'}]}>{title}</Text>
        <Text style={styles.paySubtitle}>{subtitle}</Text>
      </View>
      {paymentMethod === id && <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <SafeAreaView>
            <View style={styles.headerContent}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{width: 24}} /> 
            </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* DESTINATION */}
        <Text style={styles.sectionTitle}>Delivery Destination</Text>
        <TouchableOpacity style={styles.zoneSelector} onPress={() => setModalVisible(true)}>
            <View style={styles.zoneIcon}>
                <Ionicons name="map" size={24} color="#4F46E5" />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.zoneLabel}>Destination State</Text>
                <Text style={styles.zoneValue}>
                    {selectedZone ? selectedZone.state : "Tap to select..."}
                </Text>
            </View>
            {selectedZone && (
                <Text style={styles.zonePriceBadge}>+ ₦{parseFloat(selectedZone.fee).toLocaleString()}</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" style={{marginLeft: 5}} />
        </TouchableOpacity>

        {/* SHIPPING FORM */}
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        <View style={styles.formCard}>
            <TextInput 
                style={styles.input} placeholder="Full Name" 
                value={formData.fullName} onChangeText={(t) => setFormData({...formData, fullName: t})} 
            />
            <TextInput 
                style={styles.input} placeholder="Address" 
                value={formData.address} onChangeText={(t) => setFormData({...formData, address: t})} 
            />
            <View style={styles.rowInput}>
                <TextInput 
                    style={[styles.input, {flex: 1, marginRight: 10}]} placeholder="City" 
                    value={formData.city} onChangeText={(t) => setFormData({...formData, city: t})} 
                />
                <TextInput 
                    style={[styles.input, {flex: 1}]} placeholder="Phone" keyboardType="phone-pad" 
                    value={formData.phone} onChangeText={(t) => setFormData({...formData, phone: t})} 
                />
            </View>
        </View>

        {/* PAYMENT METHOD */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.formCard}>
            <PaymentOption id="POD" icon="money" title="Pay on Delivery" subtitle="Cash upon receipt" />
            <PaymentOption id="PAYSTACK" icon="credit-card" title="Pay with Card" subtitle="Secured by Paystack" />
            <PaymentOption id="BANK_TRANSFER" icon="bank" title="Bank Transfer" subtitle="Direct Transfer" />
        </View>

        {paymentMethod === 'BANK_TRANSFER' && (
            <View style={styles.bankInfo}>
                <Text style={styles.bankTitle}>Bank Details</Text>
                <Text style={styles.bankText}>Zenith Bank - 1234567890</Text>
                <Text style={styles.bankText}>Nura Store Ltd</Text>
            </View>
        )}

        {/* SUMMARY */}
        <View style={styles.summaryBox}>
            <View style={styles.row}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>₦{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Delivery</Text>
                <Text style={styles.value}>₦{deliveryFee.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.totalLabel}>Total to Pay</Text>
                <Text style={styles.totalValue}>₦{grandTotal.toLocaleString()}</Text>
            </View>
        </View>

      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeBtn} onPress={handleCheckout} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.btnText}>
                    {paymentMethod === 'PAYSTACK' ? `Pay ₦${grandTotal.toLocaleString()}` : 'Place Order'}
                </Text>
            )}
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Delivery State</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                <FlatList 
                    data={zones}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) => (
                        <TouchableOpacity style={styles.zoneItem} onPress={() => handleSelectZone(item)}>
                            <View>
                                <Text style={styles.zoneNameText}>{item.state}</Text>
                                <Text style={styles.estTimeText}>{item.estimated_time || '2-3 Days'}</Text>
                            </View>
                            <Text style={styles.zonePriceText}>₦{parseFloat(item.fee).toLocaleString()}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  backBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },

  content: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 15, color: '#333' },
  
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.03, elevation: 1 },
  
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 15, marginBottom: 10, fontSize: 15, borderWidth: 1, borderColor: '#F3F4F6' },
  rowInput: { flexDirection: 'row' },

  zoneSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.03, elevation: 1 },
  zoneIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  zoneLabel: { fontSize: 12, color: '#6B7280' },
  zoneValue: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  zonePriceBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, color: '#4F46E5', fontWeight: 'bold', fontSize: 12 },

  paymentOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  selectedOption: { backgroundColor: '#EEF2FF', borderRadius: 12, paddingHorizontal: 10, borderBottomWidth: 0 },
  payIconBox: { marginRight: 15, width: 30, alignItems: 'center' },
  payTitle: { fontWeight: '600', fontSize: 15, color: '#374151' },
  paySubtitle: { fontSize: 12, color: '#9CA3AF' },

  bankInfo: { backgroundColor: '#FFFBEB', padding: 15, borderRadius: 12, marginTop: 5 },
  bankTitle: { fontWeight: 'bold', color: '#B45309', marginBottom: 5 },
  bankText: { color: '#B45309', fontSize: 13 },

  summaryBox: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginTop: 20, shadowColor: "#000", shadowOpacity: 0.03, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: '#6B7280' },
  value: { fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5' },

  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  placeBtn: { backgroundColor: '#111', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.1, elevation: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  zoneItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
  zoneNameText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  estTimeText: { fontSize: 12, color: '#9CA3AF' },
  zonePriceText: { fontWeight: 'bold', color: '#4F46E5', fontSize: 16 }
});