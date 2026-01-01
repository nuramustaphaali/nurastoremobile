import React, { useContext, useState } from 'react';
import { 
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, 
  ActivityIndicator, SafeAreaView, Dimensions, TextInput, Alert 
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../src/context/AuthContext';
import api from '../src/services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { userInfo } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [addingId, setAddingId] = useState(null); 

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
      fetchCartCount();
    }, [])
  );

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.log("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
        const response = await api.get('/cart/');
        let count = 0;
        const items = Array.isArray(response.data) ? response.data : (response.data.items || []);
        count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(count);
    } catch (error) {
        setCartCount(0);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const newData = products.filter(item => 
        item.name.toUpperCase().includes(text.toUpperCase())
      );
      setFilteredProducts(newData);
    } else {
      setFilteredProducts(products);
    }
  };

  const handleQuickAdd = async (product) => {
    setAddingId(product.id);
    try {
      await api.post('/cart/', { product_id: product.id, quantity: 1 });
      setCartCount(prev => prev + 1);
      Alert.alert("Success", "Added to cart!");
    } catch (error) {
      Alert.alert("Notice", "Could not add item.");
    } finally {
      setAddingId(null);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${item.slug}`)}
    >
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
          style={styles.cardImage} 
          resizeMode="cover"
        />
        {/* Favorite Icon Placeholder */}
        <View style={styles.favIcon}>
            <Ionicons name="heart-outline" size={16} color="#4F46E5" />
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardCategory}>{item.category_name || 'General'}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.priceRow}>
            <Text style={styles.cardPrice}>₦{parseFloat(item.price).toLocaleString()}</Text>
            
            <TouchableOpacity 
                style={styles.addBtn} 
                onPress={(e) => { e.stopPropagation(); handleQuickAdd(item); }}
                disabled={addingId === item.id}
            >
                {addingId === item.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Ionicons name="add" size={20} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']} 
            style={styles.gradientHeader}
          >
            <SafeAreaView>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greetingText}>Hello, {userInfo?.username || 'Guest'} 👋</Text>
                        <Text style={styles.subGreeting}>What are you looking for today?</Text>
                    </View>
                    
                    <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartBtnHeader}>
                        <Ionicons name="cart" size={24} color="#4F46E5" />
                        {cartCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{cartCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
          </LinearGradient>

          {/* --- FLOATING SEARCH BAR --- */}
          <View style={styles.searchFloating}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={{marginRight: 10}} />
            <TextInput 
                placeholder="Search shoes, fashion..." 
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
            />
          </View>
      </View>

      {/* --- CONTENT --- */}
      <View style={styles.bodyContainer}>
        {loading ? (
            <ActivityIndicator size="large" color="#4F46E5" style={{marginTop: 50}} />
        ) : (
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2} 
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                ListHeaderComponent={
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>New Arrivals</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                    </View>
                }
                ListEmptyComponent={<Text style={styles.emptyText}>No products found</Text>}
            />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  // Header Styles
  headerWrapper: { marginBottom: 20 },
  gradientHeader: { 
    height: 180, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 40 // Adjust for status bar
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  greetingText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 13, color: '#E0E7FF', marginTop: 2 },
  
  cartBtnHeader: { 
    backgroundColor: '#fff', 
    width: 45, height: 45, 
    borderRadius: 22.5, 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 5
  },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Search Bar
  searchFloating: {
    position: 'absolute',
    bottom: -25, left: 20, right: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    height: 50,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333', height: '100%' },

  // Body
  bodyContainer: { flex: 1, paddingHorizontal: 20, marginTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  seeAll: { color: '#4F46E5', fontWeight: '600', fontSize: 13 },

  // Card
  columnWrapper: { justifyContent: 'space-between' },
  card: { 
    width: (width / 2) - 25, 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginBottom: 20, 
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
  },
  imageWrapper: { height: 140, width: '100%', position: 'relative' },
  cardImage: { width: '100%', height: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  favIcon: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center'
  },
  
  cardContent: { padding: 12 },
  cardCategory: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 15, fontWeight: 'bold', color: '#4F46E5' },
  
  addBtn: {
    backgroundColor: '#111',
    width: 32, height: 32,
    borderRadius: 16,
    justifyContent: 'center', alignItems: 'center'
  },
  
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 50 },
  btnText: { color: '#fff', fontSize: 12 } // Fallback
});