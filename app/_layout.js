import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from '../src/context/AuthContext';
import { View, Platform } from 'react-native';

export default function Layout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#4F46E5" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#4F46E5', // Active Color (Indigo)
          tabBarInactiveTintColor: '#9CA3AF', // Gray
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            elevation: 10, // Android Shadow
            shadowColor: '#000', // iOS Shadow
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: -2 },
            
            // ✅ FIX: Increased Padding & Height significantly
            height: Platform.OS === 'ios' ? 100 : 90, 
            paddingBottom: Platform.OS === 'ios' ? 35 : 30, 
            paddingTop: 12,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: 5 // Added margin to space label from bottom
          }
        }}
      >
        {/* --- MAIN TABS --- */}
        
        <Tabs.Screen 
          name="home" 
          options={{
            title: "Shop",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="storefront-outline" size={24} color={color} />
            ),
          }} 
        />

        <Tabs.Screen 
          name="cart" 
          options={{
            title: "Cart",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cart-outline" size={24} color={color} />
            ),
          }} 
        />

        <Tabs.Screen 
          name="orders/index" 
          options={{
            title: "Orders",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="receipt-outline" size={24} color={color} />
            ),
          }} 
        />

        <Tabs.Screen 
          name="profile" 
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }} 
        />

        {/* --- HIDDEN SCREENS (No Tab Bar) --- */}
        <Tabs.Screen name="index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="login" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="register" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="checkout" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="product/[slug]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="orders/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />

      </Tabs>
    </AuthProvider>
  );
}