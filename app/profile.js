import React, { useContext, useEffect, useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../src/context/AuthContext';
import api from '../src/services/api';

export default function ProfileScreen() {
  const { logout, userInfo } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const res = await api.get('/me/'); 
            setProfileData(res.data);
        } catch (e) {
            setProfileData(userInfo);
        }
    };
    fetchProfile();
  }, []);

  const MenuItem = ({ icon, label, onPress, color = '#333', isDanger = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: isDanger ? '#FEF2F2' : '#F3F4F6' }]}>
                <Ionicons name={icon} size={20} color={isDanger ? '#EF4444' : '#4F46E5'} />
            </View>
            <Text style={[styles.menuText, { color: isDanger ? '#EF4444' : '#1F2937' }]}>{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* --- HEADER --- */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <SafeAreaView>
            <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>My Profile</Text>
            </View>
        </SafeAreaView>
      </LinearGradient>
      <View style={{width: 24}} /> 


      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- PROFILE CARD --- */}
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

        {/* --- MENUS --- */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
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
            </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.menuContainer}>
                <MenuItem 
                    icon="lock-closed-outline" label="Change Password" 
                    onPress={() => alert('Change Password Feature Coming Soon')} 
                />
                <MenuItem 
                    icon="log-out-outline" label="Log Out" isDanger={true}
                    onPress={logout} 
                />
            </View>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  header: { height: 100, paddingHorizontal: 20, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },

  profileCard: { 
    backgroundColor: '#fff', alignItems: 'center', padding: 25, marginTop: -60, borderRadius: 20,
    shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  avatar: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#4F46E5', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 4, borderColor: '#EEF2FF'
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  email: { fontSize: 14, color: '#6B7280', marginBottom: 15 },
  editBtn: { 
    backgroundColor: '#EEF2FF', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 
  },
  editBtnText: { color: '#4F46E5', fontWeight: '600', fontSize: 13 },

  section: { marginTop: 25 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },
  
  menuContainer: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  menuItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { fontSize: 15, fontWeight: '600' },
  
  version: { textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 30 }
});