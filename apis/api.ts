import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const apiClient = axios.create({
  baseURL: "https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/api",
  headers: { "Content-Type": "application/json" },
});

// 🔹 Request interceptor: attach token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 Response interceptor: handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API Error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      // Token expired → try refresh
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(
            "https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/api/Verfication/refresh-token",
            { refreshToken }
          );
          const { accessToken } = res.data;

          await AsyncStorage.setItem("accessToken", accessToken);

          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient.request(error.config);
        } catch (refreshErr) {
          console.error("Token refresh failed:", refreshErr);
          await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
