import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAccessTokenRefreshToken, GetUserDetails } from '../apis/userRegister';
import { useUser } from '../context/UserContext';
import { jwtDecode } from "jwt-decode";

export default function Index() {
  const { setUser } = useUser();

  useEffect(() => {
    const checkLogin = async () => {
      const token:string|null = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      let isExpired = isTokenExpired(token);
console.log("Is access token expired?", isExpired);
      if (isExpired) {
        if (!isTokenExpired(refreshToken)) {
          try {
            const response = await getAccessTokenRefreshToken({ refreshToken });
            
            await AsyncStorage.setItem("accessToken", response.accessToken);
            await AsyncStorage.setItem("refreshToken", response.refreshToken);

            setUser(response.data.user); // user comes from refresh endpoint

            router.replace({ pathname: '(tabs)', params: { welcomeBack: 'true' } });
            return;
          } catch (error) {
            console.log("Refresh failed", error);
          }
        }
        // Refresh token also expired
        router.replace('/loginscreen');
      } else {
        try {
          if(token){
          const response = await GetUserDetails(token); 
                    setUser(response.data);
          }
          router.replace({ pathname: '(tabs)', params: { welcomeBack: 'true' } });
        } catch (error) {
          console.log("GetUserDetails failed", error);
          router.replace('/loginscreen');
        }
      }
    };

    setTimeout(checkLogin, 300);
  }, []);

  const isTokenExpired = (token: any) => {
    if (!token) return true;
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    } catch (err) {
      return true;
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );
}
