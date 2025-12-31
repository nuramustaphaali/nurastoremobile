import { View, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to NuraStore</Text>
      <Text style={styles.subtitle}>Mobile App</Text>
      
      <View style={styles.btnContainer}>
        <Button 
            title="Go to Login" 
            onPress={() => router.push('/login')} 
            color="#0d6efd" // Your Bootstrap Blue
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'gray', marginBottom: 20 },
  btnContainer: { marginTop: 20, width: '50%' }
});