import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // We installed this earlier
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* 1. Hero Section (Top) */}
      <View style={styles.heroContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="cart" size={60} color="#007BFF" />
        </View>
        <Text style={styles.appName}>NuraStore</Text>
        <Text style={styles.tagline}>Quality Products. Best Prices.</Text>
      </View>

      {/* 2. Illustration / Info Area (Middle) */}
      <View style={styles.infoContainer}>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={20} color="#28A745" />
          <Text style={styles.featureText}>Fast Delivery within Kano</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={20} color="#28A745" />
          <Text style={styles.featureText}>Secure Payments via Paystack</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={20} color="#28A745" />
          <Text style={styles.featureText}>24/7 Customer Support</Text>
        </View>
      </View>

      {/* 3. Action Buttons (Bottom) */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => router.push('/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => router.push('/register')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Create an Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between', // Pushes content apart
  },
  // Hero Section
  heroContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F7FF', // Very light blue
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800', // Extra bold
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 5,
  },
  // Info Section
  infoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: width * 0.7, // 70% of screen width
  },
  featureText: {
    fontSize: 15,
    color: '#495057',
    marginLeft: 10,
    fontWeight: '500',
  },
  // Bottom Buttons
  bottomContainer: {
    padding: 30,
    paddingBottom: 50,
  },
  primaryButton: {
    backgroundColor: '#007BFF', // Brand Blue
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    // Shadow for depth
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  secondaryButtonText: {
    color: '#343A40',
    fontSize: 16,
    fontWeight: '600',
  },
});