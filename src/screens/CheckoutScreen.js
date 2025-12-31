import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, ScrollView, TouchableOpacity, 
  StyleSheet, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Paystack } from 'react-native-paystack-webview';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { getDeliveryFee, placeOrder } from '../services/api';

const CheckoutScreen = ({ navigation }) => {
  const { cartTotal, cartItems, refreshCart } = useContext(CartContext);
  
  // Form State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  
  // Logic State
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('paystack'); // 'paystack' or 'pod'
  const [loading, setLoading] = useState(false);
  const paystackWebViewRef = useRef();

  // 1. Calculate Delivery Fee when State changes
  // (Debounce this in production, simplified here)
  useEffect(() => {
    if (state.length > 2) {
      calculateFee();
    }
  }, [state]);

  const calculateFee = async () => {
    try {
      const data = await getDeliveryFee(state);
      setDeliveryFee(data.fee);
    } catch (e) {
      setDeliveryFee(0); // Default or error handling
    }
  };

  const finalTotal = cartTotal + deliveryFee;

  // 2. Handle Order Submission
  const handleCheckout = () => {
    if (!address || !city || !state || !phone) {
      Alert.alert('Missing Info', 'Please fill in all delivery details.');
      return;
    }

    if (paymentMethod === 'paystack') {
      // Trigger Paystack Modal
      paystackWebViewRef.current.startTransaction();
    } else {
      // Pay on Delivery
      submitOrder({ payment_method: 'pod', reference: null });
    }
  };

  const submitOrder = async (paymentDetails) => {
    setLoading(true);
    try {
      const orderData = {
        address, city, state, phone,
        delivery_fee: deliveryFee,
        items: cartItems,
        total: finalTotal,
        payment_method: paymentDetails.payment_method,
        payment_reference: paymentDetails.reference,
      };

      await placeOrder(orderData);
      
      // Success Logic
      refreshCart(); // Clear cart logic should be handled by backend or manually here
      Alert.alert('Success!', 'Your order has been placed.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Section 1: Delivery Details */}
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.formCard}>
            <TextInput 
              style={styles.input} 
              placeholder="Full Address" 
              value={address} 
              onChangeText={setAddress} 
            />
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, { flex: 1, marginRight: 10 }]} 
                placeholder="City (e.g., Kano)" 
                value={city} 
                onChangeText={setCity} 
              />
              <TextInput 
                style={[styles.input, { flex: 1 }]} 
                placeholder="State" 
                value={state} 
                onChangeText={setState} 
                onBlur={() => calculateFee()} // Fetch fee on blur
              />
            </View>
            <TextInput 
              style={styles.input} 
              placeholder="Phone Number" 
              keyboardType="phone-pad"
              value={phone} 
              onChangeText={setPhone} 
            />
          </View>

          {/* Section 2: Payment Method */}
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentContainer}>
            
            {/* Paystack Option */}
            <TouchableOpacity 
              style={[styles.paymentOption, paymentMethod === 'paystack' && styles.selectedOption]}
              onPress={() => setPaymentMethod('paystack')}
            >
              <Ionicons 
                name="card" 
                size={24} 
                color={paymentMethod === 'paystack' ? '#007BFF' : '#666'} 
              />
              <Text style={[styles.paymentText, paymentMethod === 'paystack' && styles.selectedText]}>
                Pay with Card
              </Text>
              {paymentMethod === 'paystack' && <Ionicons name="checkmark-circle" size={20} color="#007BFF" />}
            </TouchableOpacity>

            {/* POD Option */}
            <TouchableOpacity 
              style={[styles.paymentOption, paymentMethod === 'pod' && styles.selectedOption]}
              onPress={() => setPaymentMethod('pod')}
            >
              <Ionicons 
                name="cash" 
                size={24} 
                color={paymentMethod === 'pod' ? '#007BFF' : '#666'} 
              />
              <Text style={[styles.paymentText, paymentMethod === 'pod' && styles.selectedText]}>
                Pay on Delivery
              </Text>
              {paymentMethod === 'pod' && <Ionicons name="checkmark-circle" size={20} color="#007BFF" />}
            </TouchableOpacity>
          </View>

          {/* Section 3: Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatMoney(cartTotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{formatMoney(deliveryFee)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatMoney(finalTotal)}</Text>
            </View>
          </View>

        </ScrollView>

        {/* Footer Action */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.payBtn} onPress={handleCheckout} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.payBtnText}>
                {paymentMethod === 'pod' ? 'Place Order' : `Pay ${formatMoney(finalTotal)}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Paystack Hidden Component */}
        <Paystack
          paystackKey="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // REPLACE WITH YOUR PUBLIC KEY
          amount={finalTotal} // Note: Check if library expects Kobo or Naira. Usually Naira for this lib.
          billingEmail="user@example.com" // You should pull this from AuthContext
          activityIndicatorColor="green"
          onCancel={(e) => {
            Alert.alert("Payment Cancelled");
          }}
          onSuccess={(res) => {
            // res contains transaction reference
            submitOrder({ payment_method: 'paystack', reference: res.data.transactionRef.reference });
          }}
          ref={paystackWebViewRef}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#fff'
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 100 },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#666', marginBottom: 10, marginTop: 10 },
  
  formCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  input: {
    backgroundColor: '#F1F3F5', height: 50, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15
  },
  row: { flexDirection: 'row' },
  
  paymentContainer: { marginBottom: 20 },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#fff'
  },
  selectedOption: { borderColor: '#007BFF', backgroundColor: '#F0F7FF' },
  paymentText: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '600', color: '#333' },
  selectedText: { color: '#007BFF' },
  
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 15, color: '#666' },
  summaryValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#F1F3F5', marginVertical: 10 },
  totalLabel: { fontSize: 18, fontWeight: '800' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#007BFF' },
  
  footer: {
    padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee'
  },
  payBtn: {
    backgroundColor: '#1A1A1A', height: 55, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center'
  },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});

export default CheckoutScreen;Alert