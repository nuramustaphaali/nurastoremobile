import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TextInput, 
  ActivityIndicator, SafeAreaView, TouchableOpacity 
} from 'react-native';
import { fetchCategories, fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const HomeScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Data Fetch
  useEffect(() => {
    loadData();
  }, []);

  // 2. Refresh products when category changes
  useEffect(() => {
    loadProducts(selectedCategory);
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      const cats = await fetchCategories();
      setCategories([{ id: null, name: 'All' }, ...cats]); // Add "All" option
      await loadProducts(null);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProducts = async (catId) => {
    setLoading(true);
    try {
      const prods = await fetchProducts(catId);
      setProducts(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Render Category Pill
  const renderCategory = ({ item }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity 
        style={[styles.catPill, isSelected && styles.catPillSelected]}
        onPress={() => setSelectedCategory(item.id)}
      >
        <Text style={[styles.catText, isSelected && styles.catTextSelected]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Search Mockup */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity 
          style={styles.searchBar} 
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.searchText}>Search products...</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal List */}
      <View>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id ? item.id.toString() : 'all'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
        />
      </View>

      {/* Product Grid */}
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard 
              product={item} 
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} 
            />
          )}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  searchBar: {
    backgroundColor: '#fff',
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchText: {
    color: '#ADB5BD',
  },
  catList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  catPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  catPillSelected: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  catText: {
    color: '#666',
    fontWeight: '600',
  },
  catTextSelected: {
    color: '#fff',
  },
  productList: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 50,
  },
});

export default HomeScreen;