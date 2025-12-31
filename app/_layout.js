import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext'; // Import the provider

export default function Layout() {
  return (
    // Wrap the entire Stack in the AuthProvider
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack 
        screenOptions={{
            headerStyle: { backgroundColor: '#212529' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Welcome" }} />
        <Stack.Screen name="login" options={{ title: "Login" }} />
        <Stack.Screen name="home" options={{ title: "Dashboard", headerLeft: () => null }} />
      </Stack>
    </AuthProvider>
  );
}