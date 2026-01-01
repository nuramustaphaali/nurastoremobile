import React, { useEffect, useRef } from 'react';
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, 
  Dimensions, Animated, StatusBar 
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // ✅ Using the package you installed!
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 6, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* --- COLORFUL BACKGROUND --- */}
      <LinearGradient
        // Bright Blue to Deep Purple Gradient
        colors={['#4F46E5', '#7C3AED']} 
        style={styles.background}
      />

      {/* --- HERO IMAGE WITH BLEND --- */}
      <View style={styles.topSection}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000&auto=format&fit=crop' }} 
          style={styles.heroImage} 
          resizeMode="cover" 
        />
        {/* Gradient Overlay to fade image into background */}
        <LinearGradient
            colors={['transparent', '#4F46E5']}
            style={styles.heroOverlay}
        />
      </View>

      {/* --- CONTENT AREA --- */}
      <Animated.View 
        style={[
          styles.content, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
        ]}
      >
        <View style={styles.iconBadge}>
           <Ionicons name="cart" size={32} color="#4F46E5" />
        </View>

        <Text style={styles.title}>Nura Store</Text>
        <Text style={styles.subtitle}>
          The smartest way to shop, order, and track your deliveries in Northern Nigeria.
        </Text>

        <View style={styles.buttonContainer}>
          {/* PRIMARY BUTTON (White with Color Text) */}
          <TouchableOpacity 
            style={styles.btnPrimary} 
            activeOpacity={0.9}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.btnPrimaryText}>Login to Account</Text>
            <Ionicons name="arrow-forward" size={20} color="#4F46E5" />
          </TouchableOpacity>

          {/* SECONDARY BUTTON (Outline/Glass) */}
          <TouchableOpacity 
            style={styles.btnSecondary} 
            activeOpacity={0.7}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.btnSecondaryText}>Create New Account</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4F46E5' },
  
  background: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
  },

  topSection: {
    height: height * 0.55, // Top 55%
    width: width,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  heroOverlay: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 150, // Fades the bottom of image into the background color
  },

  content: {
    flex: 1,
    marginTop: -40,
    paddingHorizontal: 30,
    alignItems: 'center',
  },

  iconBadge: {
    width: 70, height: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 10
  },

  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF', // Light Indigo
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },

  buttonContainer: {
    width: '100%',
    gap: 15,
  },

  btnPrimary: {
    backgroundColor: '#fff',
    height: 58,
    borderRadius: 30, // Pill shape
    flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  btnPrimaryText: {
    color: '#4F46E5', // Matches background
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },

  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.15)', // Glass effect
    height: 58,
    borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  btnSecondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});