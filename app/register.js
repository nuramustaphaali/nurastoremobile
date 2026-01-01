import React, { useContext, useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Dimensions 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../src/context/AuthContext';

const { height } = Dimensions.get('window');

export default function RegisterScreen() {
  const { register } = useContext(AuthContext);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Visibility Toggles
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
        alert("Please fill all fields.");
        return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true); // Button changes state here
    try {
      await register(username, email, password, confirmPassword);
      alert('Account Created! Please Login.');
      router.back();
    } catch (e) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* --- BACKGROUND GRADIENT --- */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']} 
        style={styles.background}
      />

      {/* --- HEADER --- */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View>
                <Text style={styles.title}>Join Nura Store</Text>
                <Text style={styles.subtitle}>Create an account to start shopping</Text>
            </View>
        </View>
      </SafeAreaView>

      {/* --- FORM CARD --- */}
      <View style={styles.cardContainer}>
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={{flex: 1}}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            
            {/* Username */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" style={{marginRight: 10}} />
                    <TextInput 
                        style={styles.input} 
                        value={username} 
                        onChangeText={setUsername} 
                        placeholder="Choose a username"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none" 
                    />
                </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={{marginRight: 10}} />
                    <TextInput 
                        style={styles.input} 
                        value={email} 
                        onChangeText={setEmail} 
                        placeholder="name@example.com"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address" 
                        autoCapitalize="none"
                    />
                </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{marginRight: 10}} />
                    <TextInput 
                        style={styles.input} 
                        value={password} 
                        onChangeText={setPassword} 
                        placeholder="Create a password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPass} 
                    />
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                        <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" style={{marginRight: 10}} />
                    <TextInput 
                        style={styles.input} 
                        value={confirmPassword} 
                        onChangeText={setConfirmPassword} 
                        placeholder="Repeat password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showConfirmPass}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                        <Ionicons name={showConfirmPass ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- ACTION BUTTON (CHANGES WHEN LOADING) --- */}
            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleRegister} 
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <View style={styles.loadingContent}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.buttonText}>Creating Account...</Text>
                    </View>
                ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.linkText}>Log In</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
                By creating an account, you agree to Nura Store's Terms of Service.
            </Text>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  
  headerSafeArea: { zIndex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30, flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 10, marginRight: 15, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#E0E7FF', marginTop: 2 },

  cardContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden', 
    shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10
  },
  scrollContent: { padding: 30, paddingBottom: 50 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginLeft: 5 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6',
    borderRadius: 16, height: 56, paddingHorizontal: 15,
    borderWidth: 1, borderColor: 'transparent',
  },
  input: { flex: 1, height: '100%', fontSize: 16, color: '#1F2937' },

  // Button Styles
  button: {
    backgroundColor: '#4F46E5', height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 15,
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  buttonDisabled: {
    backgroundColor: '#818CF8', // Lighter purple when loading
    shadowOpacity: 0
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#6B7280', fontSize: 14 },
  linkText: { color: '#4F46E5', fontWeight: 'bold', fontSize: 14 },
  
  termsText: { textAlign: 'center', color: '#9CA3AF', fontSize: 11, marginTop: 30 }
});