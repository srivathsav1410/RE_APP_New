import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { UserProvider } from '../context/UserContext';
import { registerForPushNotificationsAsync } from '../utils/Notification';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [expoPushToken, setExpoPushToken] = useState<any>('');

  useEffect(() => {
    // 1️⃣ Register for push notifications
    async function getToken() {
      try {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
        console.log('Expo Push Token:', token);

        // TODO: Send the token to your backend here
        // await sendTokenToBackend(token);

      } catch (error) {
        console.error('Failed to get Expo push token:', error);
      }
    }
    getToken();

    // 2️⃣ Foreground notifications listener
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      Alert.alert(
        notification.request.content.title || 'Notification',
        notification.request.content.body || ''
      );
    });

    // 3️⃣ Background / tapped notifications listener
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { title, body, data } = response.notification.request.content;
      Alert.alert(title || 'Notification', body || '');
      
      // Optional: navigate to specific screen based on data
      // if(data.screen) navigation.navigate(data.screen);
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!loaded) return null;

  return (
    <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="loginscreen" />
          <Stack.Screen name="NameScreen" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </UserProvider>
  );
}