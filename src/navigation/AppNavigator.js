import React, { useContext } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// --- Contexts ---
import { AuthContext } from '../context/AuthContext';
import { CartProvider, CartContext } from '../context/CartContext';

// --- Screens: Auth ---
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// --- Screens: Shop & Checkout ---
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import SearchScreen from '../screens/SearchScreen'; // Optional, if you created it

// --- Screens: Cart ---
import CartScreen from '../screens/CartScreen';

// --- Screens: Profile & Orders ---
import ProfileScreen from '../screens/ProfileScreen';
import OrderListScreen from '../screens/OrderListScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';

// --- Navigators ---
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// ============================================================
// 1. HOME STACK (Discover -> Product -> Checkout)
// ============================================================
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <HomeStack.Screen name="Search" component={SearchScreen} />
      <HomeStack.Screen name="Checkout" component={CheckoutScreen} />
    </HomeStack.Navigator>
  );
};

// ============================================================
// 2. PROFILE STACK (Profile -> Orders -> Details)
// ============================================================
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="OrderList" component={OrderListScreen} />
      <ProfileStack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </ProfileStack.Navigator>
  );
};

// ============================================================
// 3. MAIN TABS (Shop | Cart | Account)
// ============================================================
const MainTabs = () => {
  const { cartCount } = useContext(CartContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007BFF', // Brand Blue
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          borderTopColor: '#F1F3F5',
          backgroundColor: '#ffffff',
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Shop') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Shop" 
        component={HomeStackNavigator} 
      />
      
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ 
          tabBarBadge: cartCount > 0 ? cartCount : null,
          tabBarBadgeStyle: { 
            backgroundColor: '#FF3B30', 
            fontSize: 12,
            marginTop: -4 
          }
        }} 
      />
      
      <Tab.Screen 
        name="Account" 
        component={ProfileStackNavigator} 
      />
    </Tab.Navigator>
  );
};

// ============================================================
// 4. ROOT NAVIGATOR (Auth Logic)
// ============================================================
const AppNavigator = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  // Splash Screen State
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {userToken == null ? (
            // --- AUTH STACK (Not Logged In) ---
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            // --- APP STACK (Logged In) ---
            <Stack.Screen name="Main" component={MainTabs} />
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
};

export default AppNavigator;