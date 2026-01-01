import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, Dimensions, Alert 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import api from '../../src/services/api';

const { width, height } = Dimensions.get('window');

export default function ProductDetail() {
  const params = useLocalSearchParams(); 
  const slug = params.slug;

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
      const response = await api.get(`/products/detail/${slug}/`);
      setProduct(response.data);
    } catch (error) {
      console.log("Fetch Error:", error);
      Alert.alert("Error", "Could not load product.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
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
       Alert.alert("Notice", "Could not add item.");
    } finally {
      setAdding(false);
    }
  };

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) return <View style={styles.loadingCenter}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  if (!product) return null;

  const price = parseFloat(product.price || 0);
  const name = product.name || "Unknown Product";
  const image = product.image || 'https://via.placeholder.com/400';
  const category = product.category_name || "General";
  const description = product.description || "No description available.";

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* --- FLOATING HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.glassBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.glassBtn} onPress={() => router.push('/cart')}>
            <Ionicons name="bag-handle-outline" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        
        {/* --- IMAGE BACKGROUND --- */}
        <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        </View>

        {/* --- CONTENT SHEET --- */}
        <View style={styles.contentContainer}>
            <View style={styles.handleBar} />
            
            <View style={styles.headerRow}>
                <View style={{flex: 1, marginRight: 10}}>
                    <Text style={styles.category}>{category}</Text>
                    <Text style={styles.title}>{name}</Text>
                </View>
                <Text style={styles.price}>₦{price.toLocaleString()}</Text>
            </View>

            {/* Rating / Stock (Visual only) */}
            <View style={styles.metaRow}>
                <View style={styles.badge}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.badgeText}>4.8 (Reviews)</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.badgeText, { color: '#10B981' }]}>In Stock</Text>
                </View>
            </View>

            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
      </ScrollView>

      {/* --- BOTTOM FOOTER --- */}
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
                <>
                    <Ionicons name={isAdded ? "checkmark" : "cart"} size={20} color="#fff" style={{marginRight: 8}} />
                    <Text style={styles.addToCartText}>{isAdded ? "Added" : "Add to Cart"}</Text>
                </>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    position: 'absolute', top: 50, left: 0, right: 0, zIndex: 10, 
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 
  },
  glassBtn: { 
    width: 45, height: 45, borderRadius: 25, 
    backgroundColor: 'rgba(255,255,255,0.8)', 
    justifyContent: 'center', alignItems: 'center', 
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 5 
  },

  imageContainer: { width: width, height: height * 0.5, backgroundColor: '#F3F4F6' },
  image: { width: '100%', height: '100%' },

  contentContainer: { 
    flex: 1, backgroundColor: '#fff', marginTop: -50, 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, 
    shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, elevation: 10 
  },
  handleBar: { width: 50, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  category: { fontSize: 12, color: '#4F46E5', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 5 },
  title: { fontSize: 24, fontWeight: '800', color: '#1F2937', lineHeight: 30 },
  price: { fontSize: 22, fontWeight: 'bold', color: '#4F46E5' },

  metaRow: { flexDirection: 'row', marginTop: 15, gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#B45309', marginLeft: 5 },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  description: { fontSize: 15, color: '#6B7280', lineHeight: 24 },

  footer: { 
    position: 'absolute', bottom: 0, width: '100%', 
    backgroundColor: '#fff', padding: 20, paddingBottom: 35, 
    borderTopWidth: 1, borderTopColor: '#F3F4F6', 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, elevation: 10
  },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 5 },
  qtyBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, shadowColor: "#000", shadowOpacity: 0.05, elevation: 1 },
  qtyText: { marginHorizontal: 15, fontSize: 18, fontWeight: 'bold', color: '#111' },
  
  addToCartBtn: { 
    flex: 1, marginLeft: 20, backgroundColor: '#111', height: 54, borderRadius: 16, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 5 
  },
  addedBtn: { backgroundColor: '#10B981' },
  addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});