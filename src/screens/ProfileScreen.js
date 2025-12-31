import React, { useContext, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, Switch, ScrollView, SafeAreaView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { logout, userInfo } = useContext(AuthContext);
  
  // Menu Item Component
  const MenuItem = ({ icon, title, subtitle, onPress, color = '#333' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: '#F8F9FA' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuTitle, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* Header Profile Card */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.username}>{userInfo?.username || 'Guest User'}</Text>
          <Text style={styles.email}>{userInfo?.email || 'No email connected'}</Text>
          
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Orders</Text>
          <MenuItem 
            icon="cube-outline" 
            title="Order History" 
            subtitle="Track, return, or buy things again"
            onPress={() => navigation.navigate('OrderList')}
          />
          <MenuItem 
            icon="heart-outline" 
            title="Wishlist" 
            subtitle="Your saved products"
            onPress={() => {}}
          />
        </View>

        {/* Section: Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <MenuItem 
            icon="location-outline" 
            title="Saved Addresses" 
            onPress={() => {}}
          />
          <MenuItem 
            icon="notifications-outline" 
            title="Notifications" 
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <MenuItem 
            icon="log-out-outline" 
            title="Log Out" 
            color="#FF3B30"
            onPress={() => {
                Alert.alert("Logout", "Are you sure?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Logout", style: "destructive", onPress: logout }
                ]);
            }}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15
  },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  username: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  email: { fontSize: 14, color: '#666', marginBottom: 15 },
  editBtn: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD'
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: '#333' },
  
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 10,
    paddingVertical: 15
  },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: '#999', marginLeft: 15, marginBottom: 10, textTransform: 'uppercase'
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600' },
  menuSubtitle: { fontSize: 12, color: '#999', marginTop: 2 }
});

export default ProfileScreen;