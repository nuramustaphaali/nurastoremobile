import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have: npx expo install @expo/vector-icons
import { fetchProductDetails } from '../services/api';
import { CartContext } from '../context/CartContext';

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const { addItem } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const data = await fetchProductDetails(productId);
      setProduct(data);
    } catch (e) {
      alert('Error loading product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addItem(product.id);
    // Note: The Context handles the "Toast" success message
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!product) return null;

  // Format Price to Naira
  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(product.price);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO IMAGE SECTION */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image }} 
            style={styles.image} 
            resizeMode="contain" 
          />
          
          {/* Back Button Overlay */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* DETAILS SECTION */}
        <View style={styles.detailsContainer}>
          
          {/* Title & Price Row */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{product.name}</Text>
              <View style={styles.categoryBadge}>
                 {/* Assuming category name is available, otherwise hide */}
                 <Text style={styles.categoryText}>
                   {product.category_name || 'Product'}
                 </Text>
              </View>
            </View>
            <Text style={styles.price}>{formattedPrice}</Text>
          </View>

          <View style={styles.divider} />

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <View style={[styles.dot, { backgroundColor: product.in_stock ? '#28A745' : '#DC3545' }]} />
            <Text style={styles.stockText}>
              {product.in_stock ? 'In Stock & Ready to Ship' : 'Currently Out of Stock'}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>
            {product.description || 'No description available for this product.'}
          </Text>

        </View>
      </ScrollView>

      {/* STICKY FOOTER */}
      <SafeAreaView style={styles.footer}>
        <View style={styles.footerContent}>
          <TouchableOpacity 
            style={[styles.addToCartBtn, !product.in_stock && styles.disabledBtn]} 
            onPress={handleAddToCart}
            disabled={!product.in_stock || addingToCart}
          >
            {addingToCart ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </Text>
            )}
            {product.in_stock && !addingToCart && (
               <Ionicons name="cart" size={20} color="#fff" style={{ marginLeft: 10 }} />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100, // Space for footer
  },
  imageContainer: {
    height: 350,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '80%',
  },
  backButton: {
    position: 'absolute',
    top: 50, // Adjust for safe area
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  detailsContainer: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30, // Overlap effect
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 32,
  },
  categoryBadge: {
    backgroundColor: '#F1F3F5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007BFF',
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 20,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    // Shadow pointing up
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
  footerContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  addToCartBtn: {
    backgroundColor: '#1A1A1A',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#ADB5BD',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ProductDetailScreen;