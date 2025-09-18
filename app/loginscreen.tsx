import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FindUser, VerifyOtp } from "../apis/userRegister";
import { useUser } from "../context/UserContext";
import { registerForPushNotificationsAsync } from "../utils/Notification";
import { Ionicons } from "@expo/vector-icons";


const LoginScreen = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useUser();
  const router = useRouter();

  const validateMobile = (number: string) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
  };

  const handleLogin = async () => {
    if (!validateMobile(mobile)) {
      setErrorMsg("Enter a valid 10-digit mobile number");
      return;
    }
    if (!password) {
      setErrorMsg("Password cannot be empty");
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Replace with your real API for password-based login
          const response = await VerifyOtp({ phoneNumber: mobile, otpCode: password });
      if (response?.success) {
        setSuccessMsg("Login successful ✅");

        const { accessToken, refreshToken } = response.data;
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);

        const user = await FindUser(mobile, accessToken).catch(() => null);
        setUser(user);

        if (user?.userId) {
          try {
            const token = await registerForPushNotificationsAsync();
            if (token) {
              await axios.post("https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/Notification/save-token", {
                expoPushToken: token,
                UserId: user.userId,
              });
              console.log("Push token saved:", token);
            }
          } catch (err) {
            console.error("Failed to save device token", err);
          }
        }

        setTimeout(() => {
          router.replace({
            pathname: "/NameScreen",
            params: {
              isNewUser: user ? "false" : "true",
              mobilenumber: mobile,
            },
          });
        }, 1000);
      } else {
        setErrorMsg(
          response?.data?.message || "Invalid credentials. Please try again."
        );
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNumber = () => {
    Alert.alert(
      "Edit Mobile Number",
      "Are you sure you want to change the mobile number?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            setMobile("");
            setPassword("");
            setErrorMsg("");
            setSuccessMsg("");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>ReApp Solutions!</Text>
            <Text style={styles.subtitle}>
              Enter your mobile number and password 
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={[styles.input, errorMsg && styles.inputError]}
                placeholder="Enter 10-digit mobile number"
                keyboardType="numeric"
                maxLength={10}
                value={mobile}
                onChangeText={(text) => {
                  setMobile(text.replace(/[^0-9]/g, ""));
                  if (errorMsg) setErrorMsg("");
                }}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, errorMsg && styles.inputError, { flex: 1 }]}
                    placeholder="Enter password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errorMsg) setErrorMsg("");
                    }}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color="#065F46"
                    />
                  </TouchableOpacity>
                </View>
              </View>


            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Message Container */}
          <View style={styles.messageContainer}>
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>✅ {successMsg}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4EA", // light green background
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#065F46", // dark green
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#065F46",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: {
  flex: 1,
  justifyContent: "flex-start", // keep natural flow
  marginTop: 20, // add small positive spacing instead of negative
},
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: "#F0FFF4",
    color: "#065F46",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#fff5f5",
  },
  button: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#A7F3D0",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  messageContainer: {
    minHeight: 60,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  errorContainer: {
    backgroundColor: "#fff5f5",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  errorText: {
    color: "#cc0000",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  successContainer: {
    backgroundColor: "#D1FAE5",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  successText: {
    color: "#16a34a",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  passwordContainer: {
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 2,
  borderColor: "#D1FAE5",
  borderRadius: 12,
  backgroundColor: "#F0FFF4",
  height: 52,
  paddingRight: 12, // space for eye icon
},
eyeIcon: {
  padding: 6,
},

})