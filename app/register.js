import React, { useContext, useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router'; // <--- NEW IMPORT
import { AuthContext } from '../src/context/AuthContext';

export default function RegisterScreen() {
  const { register } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(username, email, password);
      alert('Account Created! Please Login.');
      // Navigate back to login
      router.back();
    } catch (e) {
      alert('Registration Failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1, justifyContent: 'center'}}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
        </View>

        <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.footer} onPress={() => router.back()}>
            <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    content: { padding: 25 },
    title: { fontSize: 30, fontWeight: 'bold', marginBottom: 30, color: '#1A1A1A' },
    inputWrapper: { marginBottom: 15 },
    label: { marginBottom: 5, fontWeight: '600', color: '#495057' },
    input: { height: 50, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: '#DEE2E6' },
    button: { backgroundColor: '#28A745', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    footer: { marginTop: 20, alignItems: 'center' },
    linkText: { color: '#007BFF', fontWeight: 'bold' }
});