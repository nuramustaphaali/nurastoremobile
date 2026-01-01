import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, ScrollView, Alert, ActivityIndicator, Modal, FlatList 
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
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
    fullName: '',
    address: '',
    city: '', 
    phone: '',
    note: ''
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await api.get('/delivery-zones/');
      setZones(response.data);
    } catch (error) {
      console.log("Error fetching zones:", error);
    }
  };

  const getZoneName = (zone) => zone?.state || "Unknown Zone";
  const getZonePrice = (zone) => parseFloat(zone?.fee || 0);

  const handleSelectZone = (item) => {
    setSelectedZone(item);
    setModalVisible(false);
    
    // Auto-fill City if empty (Optional UX improvement)
    if (!formData.city) {
        setFormData(prev => ({ ...prev, city: item.state }));
    }
  };

  const handleCheckout = async () => {
    if (!selectedZone) {
      Alert.alert("Required", "Please select a Delivery Zone.");
      return;
    }
    if (!formData.fullName || !formData.address || !formData.city || !formData.phone) {
      Alert.alert("Required", "Please fill in Name, Address, City, and Phone.");
      return;
    }

    setLoading(true);
    try {
      // ✅ FIX: Added 'state' to payload
      const payload = {
        delivery_zone_id: selectedZone.id,
        state: selectedZone.state, // Sending the State Name explicitly
        full_name: formData.fullName,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        note: formData.note,
        payment_method: paymentMethod
      };

      const response = await api.post('/checkout/', payload);
      
      if (paymentMethod === 'PAYSTACK' && response.data.authorization_url) {
         Alert.alert("Payment", "Redirecting to Paystack...", [
            { text: "OK", onPress: () => router.replace('/orders/') }
         ]);
      } else {
         Alert.alert("Success", "Order placed successfully!", [
            { text: "View Order", onPress: () => router.replace('/orders/') }
         ]);
      }

    } catch (error) {
      const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      Alert.alert("Checkout Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const deliveryFee = selectedZone ? getZonePrice(selectedZone) : 0;
  const grandTotal = subtotal + deliveryFee;

  const PaymentOption = ({ id, icon, title, subtitle }) => (
    <TouchableOpacity 
      style={[styles.paymentOption, paymentMethod === id && styles.selectedOption]} 
      onPress={() => setPaymentMethod(id)}
    >
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Ionicons 
            name={paymentMethod === id ? "radio-button-on" : "radio-button-off"} 
            size={20} 
            color={paymentMethod === id ? "#007BFF" : "#ccc"} 
        />
        <View style={{marginLeft: 10}}>
            <Text style={styles.payTitle}>{title}</Text>
            {subtitle && <Text style={styles.paySubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <FontAwesome name={icon} size={20} color="#555" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* --- DELIVERY ZONE --- */}
        <Text style={styles.sectionTitle}>Delivery Destination</Text>
        <TouchableOpacity style={styles.zoneSelector} onPress={() => setModalVisible(true)}>
            <View>
                <Text style={styles.label}>Select State</Text>
                <Text style={styles.zoneValue}>
                    {selectedZone ? `${getZoneName(selectedZone)}` : "Tap to select..."}
                </Text>
                {selectedZone && (
                    <Text style={styles.estTime}>Est: {selectedZone.estimated_time}</Text>
                )}
            </View>
            <Text style={styles.zonePrice}>
                {selectedZone ? `+ ₦${getZonePrice(selectedZone).toLocaleString()}` : ""}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" style={{marginLeft: 10}}/>
        </TouchableOpacity>

        {/* --- SHIPPING INFO --- */}
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        
        <TextInput 
            style={styles.input} placeholder="Full Name" 
            value={formData.fullName} onChangeText={(t) => setFormData({...formData, fullName: t})}
        />
        
        <TextInput 
            style={styles.input} placeholder="Address" 
            value={formData.address} onChangeText={(t) => setFormData({...formData, address: t})}
        />

        <TextInput 
            style={styles.input} placeholder="City / Local Govt" 
            value={formData.city} onChangeText={(t) => setFormData({...formData, city: t})}
        />
        
        <TextInput 
            style={styles.input} placeholder="Phone Number" keyboardType="phone-pad"
            value={formData.phone} onChangeText={(t) => setFormData({...formData, phone: t})}
        />

        {/* --- PAYMENT --- */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <PaymentOption id="POD" icon="money" title="Pay on Delivery" subtitle="Cash or Transfer upon receipt" />
        <PaymentOption id="PAYSTACK" icon="credit-card" title="Pay with Card" subtitle="Secured by Paystack" />
        <PaymentOption id="BANK_TRANSFER" icon="bank" title="Bank Transfer" subtitle="Direct transfer to company" />

        {paymentMethod === 'BANK_TRANSFER' && (
            <View style={styles.bankInfo}>
                <Text style={styles.bankTextBold}>Account Name: Swift POS Ltd</Text>
                <Text style={styles.bankText}>Bank: Zenith Bank</Text>
                <Text style={styles.bankText}>Account No: 1234567890</Text>
                <Text style={styles.bankWarning}>* Please use your Name as reference</Text>
            </View>
        )}

        {/* --- SUMMARY --- */}
        <View style={styles.summaryBox}>
            <View style={styles.row}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>₦{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Delivery Fee</Text>
                <Text style={styles.value}>₦{deliveryFee.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.totalLabel}>Total to Pay</Text>
                <Text style={styles.totalValue}>₦{grandTotal.toLocaleString()}</Text>
            </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeBtn} onPress={handleCheckout} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.btnText}>
                    {paymentMethod === 'PAYSTACK' ? `Pay ₦${grandTotal.toLocaleString()}` : 'Place Order'}
                </Text>
            )}
        </TouchableOpacity>
      </View>

      {/* --- MODAL --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Delivery State</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} />
                    </TouchableOpacity>
                </View>
                <FlatList 
                    data={zones}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => (
                        <TouchableOpacity 
                            style={styles.zoneItem} 
                            onPress={() => handleSelectZone(item)}
                        >
                            <View>
                                <Text style={styles.zoneNameText}>{item.state}</Text>
                                <Text style={styles.estTimeText}>{item.estimated_time}</Text>
                            </View>
                            <Text style={styles.zonePriceText}>₦{parseFloat(item.fee).toLocaleString()}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 15, color: '#333' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  zoneSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#007BFF' },
  zoneValue: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 2 },
  estTime: { fontSize: 12, color: '#666', marginTop: 2 },
  zonePrice: { fontSize: 16, fontWeight: 'bold', color: '#007BFF' },
  paymentOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  selectedOption: { borderColor: '#007BFF', backgroundColor: '#F0F7FF' },
  payTitle: { fontWeight: 'bold', color: '#333' },
  paySubtitle: { fontSize: 11, color: '#777' },
  bankInfo: { backgroundColor: '#FFF3CD', padding: 15, borderRadius: 8, marginBottom: 15 },
  bankTextBold: { fontWeight: 'bold', marginBottom: 2 },
  bankText: { marginBottom: 2 },
  bankWarning: { fontSize: 11, color: '#E53E3E', marginTop: 5 },
  summaryBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginTop: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: '#666' },
  value: { fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#007BFF' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  placeBtn: { backgroundColor: '#111', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  zoneItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  zoneNameText: { fontSize: 16, fontWeight: '600' },
  estTimeText: { fontSize: 12, color: '#888' },
  zonePriceText: { fontWeight: 'bold', color: '#007BFF', fontSize: 16 }
});