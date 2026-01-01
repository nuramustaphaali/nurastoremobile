import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, Dimensions, Alert 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import api from '../../src/services/api';

const { width } = Dimensions.get('window');

export default function ProductDetail() {
  const params = useLocalSearchParams(); 
  const slug = params.slug; // ✅ CAPTURE SLUG

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false); 

  useEffect(() => {
    if (slug) {
      fetchProductDetail();
    } else {
        Alert.alert("Error", "Product link is broken.");
        router.back();
    }
  }, [slug]);

  const fetchProductDetail = async () => {
    try {
      // ✅ FETCH BY SLUG (Standard Django REST Framework)
      // Assuming you set lookup_field='slug' in Django view
      const response = await api.get(`/products/${slug}/`);
      setProduct(response.data);
    } catch (error) {
      console.log("Fetch Error:", error);
      Alert.alert("Error", "Could not load product. Ensure your backend supports slugs.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      // ✅ SEND ID TO CART (Backend needs ID to create relationship)
      await api.post('/cart/', { 
        product_id: product.id, 
        quantity: quantity 
      });
      
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);

      Alert.alert(
        "Success", 
        `${product.name} added to cart!`,
        [
          { text: "Continue", style: "cancel" },
          { text: "View Cart", onPress: () => router.push('/cart') }
        ]
      );
    } catch (error) {
       Alert.alert("Notice", "Could not add item. It might already be in your cart.");
    } finally {
      setAdding(false);
    }
  };

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) return <ActivityIndicator size="large" color="#000" style={{marginTop: 50}} />;
  if (!product) return null;

  const price = parseFloat(product.price || 0);
  const name = product.name || "Unknown Product";
  const image = product.image || 'https://via.placeholder.com/400';
  const category = product.category_name || "General";
  const description = product.description || "No description available.";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.push('/cart')}>
            <Ionicons name="bag-handle-outline" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.contentContainer}>
            <View style={styles.handleBar} />
            <View style={styles.titleRow}>
                <View style={{flex: 1}}>
                    <Text style={styles.category}>{category}</Text>
                    <Text style={styles.title}>{name}</Text>
                </View>
                <Text style={styles.price}>₦{price.toLocaleString()}</Text>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.qtyContainer}>
            <TouchableOpacity style={styles.qtyBtn} onPress={decrementQty}>
                <Ionicons name="remove" size={20} color="#111" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={incrementQty}>
                <Ionicons name="add" size={20} color="#111" />
            </TouchableOpacity>
        </View>

        <TouchableOpacity 
            style={[styles.addToCartBtn, isAdded && styles.addedBtn]} 
            onPress={handleAddToCart} 
            disabled={adding}
        >
            {adding ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.addToCartText}>{isAdded ? "Added!" : "Add to Cart"}</Text>
            )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { position: 'absolute', top: 50, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  circleBtn: { width: 45, height: 45, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 5 },
  imageContainer: { width: width, height: 400, backgroundColor: '#F3F4F6' },
  image: { width: '100%', height: '100%' },
  contentContainer: { flex: 1, backgroundColor: '#fff', marginTop: -40, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, elevation: 10 },
  handleBar: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  category: { fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 5 },
  title: { fontSize: 24, fontWeight: '800', color: '#111', lineHeight: 30 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#2563EB' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  description: { fontSize: 15, color: '#4B5563', lineHeight: 24 },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 5 },
  qtyBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10 },
  qtyText: { marginHorizontal: 15, fontSize: 18, fontWeight: 'bold', color: '#111' },
  addToCartBtn: { flex: 1, marginLeft: 20, backgroundColor: '#111', height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 5 },
  addedBtn: { backgroundColor: '#10B981' },
  addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});