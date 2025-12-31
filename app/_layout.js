import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack 
        screenOptions={{
            headerStyle: { backgroundColor: '#212529' }, // Dark header like your web
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="login" options={{ title: "Login" }} />
      </Stack>
    </>
  );
}