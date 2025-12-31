import React, { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { searchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const data = await searchProducts(text);
        setResults(data);
      } catch (e) { console.error(e); }
    } else {
      setResults([]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Type to search..."
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ marginLeft: 10, color: '#007BFF' }}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
            <ProductCard 
              product={item} 
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} 
            />
        )}
        contentContainerStyle={{ padding: 10 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListEmptyComponent={
          query.length > 0 ? <Text style={styles.emptyText}>No results found</Text> : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    height: 45,
    backgroundColor: '#F1F3F5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  }
});

export default SearchScreen;