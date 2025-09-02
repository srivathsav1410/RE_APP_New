import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function Index() {
  useEffect(() => {
    const checkLogin = async () => {
      const token = false; // later replace with AsyncStorage
      if (token) {
        router.replace({
          pathname: '(tabs)',
          params: { welcomeBack: 'true' },
        });
      } else {
        router.replace('/loginscreen');
      }
    };

    setTimeout(checkLogin, 300);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );
}
