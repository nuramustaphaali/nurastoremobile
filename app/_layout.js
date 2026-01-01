import React, { useEffect, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, AuthContext } from '../src/context/AuthContext';
import { Platform } from 'react-native';

// This component listens to Auth state and redirects users
function AuthProtection({ children }) {
  const { userToken, isLoading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)'; // If you used group folders (optional)
    
    // Check where the user is currently trying to go
    const currentRoute = segments.join('/');

    // List of public pages (pages you can see without login)
    // We check if the current route matches 'index', 'login', or 'register'
    const isPublicPage = 
      currentRoute === '' || 
      currentRoute === 'index' || 
      currentRoute === 'login' || 
      currentRoute === 'register';

    if (!userToken && !isPublicPage) {
      // ⛔ NOT LOGGED IN, but trying to access private page -> Kick to Welcome
      router.replace('/');
    } else if (userToken && isPublicPage) {
      // ✅ LOGGED IN, but sitting on login/welcome page -> Send to Home
      router.replace('/home');
    }
  }, [userToken, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return children;
}

export default function Layout() {
  return (
    <AuthProvider>
      <AuthProtection>
        <StatusBar style="light" backgroundColor="#4F46E5" />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: '#4F46E5',
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 0,
              elevation: 10,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: -2 },
              height: Platform.OS === 'ios' ? 100 : 90, 
              paddingBottom: Platform.OS === 'ios' ? 35 : 30, 
              paddingTop: 12,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginBottom: 5 
            }
          }}
        >
          {/* --- MAIN TABS --- */}
          <Tabs.Screen 
            name="home" 
            options={{
              title: "Shop",
              tabBarIcon: ({ color }) => <Ionicons name="storefront-outline" size={24} color={color} />,
            }} 
          />
          <Tabs.Screen 
            name="cart" 
            options={{
              title: "Cart",
              tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={24} color={color} />,
            }} 
          />
          <Tabs.Screen 
            name="orders/index" 
            options={{
              title: "Orders",
              tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={24} color={color} />,
            }} 
          />
          <Tabs.Screen 
            name="profile" 
            options={{
              title: "Profile",
              tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
            }} 
          />

          {/* --- HIDDEN SCREENS --- */}
          <Tabs.Screen name="index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
          <Tabs.Screen name="login" options={{ href: null, tabBarStyle: { display: 'none' } }} />
          <Tabs.Screen name="register" options={{ href: null, tabBarStyle: { display: 'none' } }} />
          <Tabs.Screen name="checkout" options={{ href: null, tabBarStyle: { display: 'none' } }} />
          <Tabs.Screen name="product/[slug]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
          <Tabs.Screen name="orders/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        </Tabs>
      </AuthProtection>
    </AuthProvider>
  );
}