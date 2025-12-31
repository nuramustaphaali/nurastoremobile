import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width / 2) - 20; // 2 columns with padding

const ProductCard = ({ product, onPress }) => {
  // Format Price to Naira
  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(product.price);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.image }} 
          style={styles.image} 
          resizeMode="cover" 
        />
        {/* Optional: Add a "New" or "Sale" badge here */}
      </View>
      
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>{formattedPrice}</Text>
        
        {/* Simple Add Button */}
        <View style={styles.addBtn}>
          <Text style={styles.addBtnText}>+</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 5,
    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 150,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    height: 40, // Fixed height for alignment
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007BFF', // Brand Color
  },
  addBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#F1F3F5',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 18,
    color: '#333',
    marginTop: -2,
  }
});

export default ProductCard;