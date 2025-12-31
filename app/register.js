import React, { useContext, useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Import Icon
import { AuthContext } from '../src/context/AuthContext';

export default function RegisterScreen() {
  const { register } = useContext(AuthContext);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New State
  const [loading, setLoading] = useState(false);

  // Toggles for visibility
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      // Pass all 4 fields to context
      await register(username, email, password, confirmPassword);
      alert('Account Created! Please Login.');
      router.back();
    } catch (e) {
      // Error is handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.title}>Create Account</Text>
        
        {/* Username */}
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input} 
                    value={username} 
                    onChangeText={setUsername} 
                    autoCapitalize="none" 
                    placeholder="Choose a username"
                />
            </View>
        </View>

        {/* Email */}
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input} 
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address" 
                    autoCapitalize="none"
                    placeholder="name@example.com"
                />
            </View>
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input} 
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry={!showPass} // Toggle this
                    placeholder="Enter password"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
                    <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color="#6C757D" />
                </TouchableOpacity>
            </View>
        </View>

        {/* Confirm Password (NEW) */}
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input} 
                    value={confirmPassword} 
                    onChangeText={setConfirmPassword} 
                    secureTextEntry={!showConfirmPass}
                    placeholder="Re-enter password"
                />
                <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeIcon}>
                    <Ionicons name={showConfirmPass ? "eye-off" : "eye"} size={20} color="#6C757D" />
                </TouchableOpacity>
            </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.footer} onPress={() => router.back()}>
            <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { padding: 25, justifyContent: 'center', minHeight: '100%' },
    title: { fontSize: 30, fontWeight: 'bold', marginBottom: 30, color: '#1A1A1A' },
    inputWrapper: { marginBottom: 15 },
    label: { marginBottom: 5, fontWeight: '600', color: '#495057' },
    
    // Updated Input Style for Icon Support
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DEE2E6',
        height: 50,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#333',
    },
    eyeIcon: {
        padding: 5,
    },

    button: { backgroundColor: '#28A745', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    footer: { marginTop: 20, alignItems: 'center' },
    linkText: { color: '#007BFF', fontWeight: 'bold' }
});