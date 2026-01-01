import React, { useContext, useEffect, useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../src/context/AuthContext';
import api from '../src/services/api';

export default function ProfileScreen() {
  const { logout, userInfo } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Fetch fresh user data if endpoint exists, otherwise use Context
    const fetchProfile = async () => {
        try {
            const res = await api.get('/me/'); // Assuming you have a /me/ endpoint
            setProfileData(res.data);
        } catch (e) {
            setProfileData(userInfo);
        }
    };
    fetchProfile();
  }, []);

  const MenuItem = ({ icon, label, onPress, color = '#333' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#F8F9FA' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.menuText, { color }]}>{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 50}}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {profileData?.username ? profileData.username.charAt(0).toUpperCase() : 'U'}
                </Text>
            </View>
            <Text style={styles.name}>{profileData?.username || 'Guest User'}</Text>
            <Text style={styles.email}>{profileData?.email || 'no-email@example.com'}</Text>
            <TouchableOpacity style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
            <MenuItem 
                icon="receipt-outline" label="My Orders" 
                onPress={() => router.push('/orders/')} 
            />
            <MenuItem 
                icon="cart-outline" label="My Cart" 
                onPress={() => router.push('/cart')} 
            />
            <MenuItem 
                icon="location-outline" label="Shipping Address" 
                onPress={() => alert('Address Edit Feature Coming Soon')} 
            />
             <MenuItem 
                icon="lock-closed-outline" label="Change Password" 
                onPress={() => alert('Change Password Feature Coming Soon')} 
            />
        </View>

        {/* Logout */}
        <View style={styles.menuContainer}>
            <MenuItem 
                icon="log-out-outline" label="Log Out" color="#DC3545"
                onPress={logout} 
            />
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  
  profileCard: { 
    backgroundColor: '#fff', alignItems: 'center', padding: 30, marginBottom: 20 
  },
  avatar: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#007BFF', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  email: { fontSize: 14, color: '#6C757D', marginBottom: 15 },
  editBtn: { 
    borderColor: '#007BFF', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 
  },
  editBtnText: { color: '#007BFF', fontWeight: '600' },

  menuContainer: { backgroundColor: '#fff', marginBottom: 20, paddingVertical: 10 },
  menuItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { fontSize: 16, fontWeight: '500' },
  
  version: { textAlign: 'center', color: '#aaa', fontSize: 12 }
});