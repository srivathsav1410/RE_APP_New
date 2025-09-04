import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VerifyOtp, FindUser } from '../apis/userRegister';
import { useUser } from '../context/UserContext';

const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [showResendPrompt, setShowResendPrompt] = useState(false);
  const [resendClicked, setResendClicked] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const { setUser } = useUser();
  const router = useRouter();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    let countdown: ReturnType<typeof setInterval>;
    if (isOtpSent && !resendClicked && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !resendClicked) {
      setShowResendPrompt(true);
    }

    return () => clearInterval(countdown);
  }, [isOtpSent, timer, resendClicked]);

  // Clear messages after timeout
  useEffect(() => {
    if (otpSuccess) {
      const timeout = setTimeout(() => setOtpSuccess(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [otpSuccess]);

  useEffect(() => {
    if (otpError) {
      const timeout = setTimeout(() => setOtpError(''), 5000);
      return () => clearTimeout(timeout);
    }
  }, [otpError]);

  const validateMobile = (number: string) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
  };

  const handleSendOtp = async () => {
    if (!validateMobile(mobile)) {
      setOtpError('Enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call for sending OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsOtpSent(true);
      setOtpError('');
      setOtp(Array(6).fill(''));
      setTimer(30);
      setShowResendPrompt(false);
      setResendClicked(false);
      setOtpSuccess('OTP sent successfully to +91 ' + mobile);
      
      // Auto focus first OTP input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      
    } catch (error) {
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendClicked || isResending) return;

    setIsResending(true);
    try {
      // Simulate API call for resending OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResendClicked(true);
      setTimer(0);
      setOtpError('');
      setOtp(Array(6).fill(''));
      setOtpSuccess('OTP has been resent successfully');
      
      // Reset OTP inputs
      inputRefs.current.forEach(ref => {
        if (ref) ref.clear();
      });
      inputRefs.current[0]?.focus();
      
    } catch (error) {
      setOtpError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeOtp = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d$/.test(text)) return;
    
    if (otpError) setOtpError('');
    if (otpSuccess) setOtpSuccess('');
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join("");
    
    if (enteredOtp.length !== 6) {
      setOtpError('Please enter complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const response = await VerifyOtp({ 
        phoneNumber: mobile, 
        otpCode: enteredOtp 
      });
      
      if (response.success) {
        setOtpSuccess("OTP verified successfully ✅");

        const { accessToken, refreshToken } = response.data;

        // Save tokens
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);

        const user = await FindUser(mobile, accessToken);
        setUser(user);

        const isNewUser = user ? false : true;

        // Small delay to show success message
        setTimeout(() => {
          router.replace({
            pathname: "/NameScreen",
            params: {
              isNewUser: isNewUser ? "true" : "false",
              mobilenumber: mobile,
            },
          });
        }, 1000);
        
      } else {
        setOtpError(response?.data?.message || "Invalid OTP. Please try again.");
        // Clear OTP on error
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setOtpError("Something went wrong. Please try again.");
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
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
            setIsOtpSent(false);
            setOtp(Array(6).fill(''));
            setOtpError('');
            setOtpSuccess('');
            setTimer(30);
            setResendClicked(false);
            setShowResendPrompt(false);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {!isOtpSent ? 'ReApp Solutions!' : 'Verify OTP'}
            </Text>
            <Text style={styles.subtitle}>
              {!isOtpSent 
                ? 'Enter your mobile number to continue' 
                : `Enter the 6-digit code sent to +91 ${mobile}`
              }
            </Text>
          </View>

          <View style={styles.formContainer}>
            {!isOtpSent ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Mobile Number</Text>
                  <TextInput
                    style={[styles.input, otpError && styles.inputError]}
                    placeholder="Enter 10-digit mobile number"
                    keyboardType="numeric"
                    maxLength={10}
                    value={mobile}
                    onChangeText={(text) => {
                      setMobile(text.replace(/[^0-9]/g, ''));
                      if (otpError) setOtpError('');
                    }}
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.button, isLoading && styles.buttonDisabled]} 
                  onPress={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.mobileDisplay} 
                  onPress={handleEditNumber}
                >
                  <Text style={styles.mobileText}>+91 {mobile}</Text>
                  <Text style={styles.editText}>Tap to edit</Text>
                </TouchableOpacity>

                <View style={styles.otpSection}>
                  <Text style={styles.inputLabel}>Enter OTP</Text>
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        style={[
                          styles.otpBox, 
                          digit && styles.otpBoxFilled,
                          otpError && styles.otpBoxError
                        ]}
                        keyboardType="numeric"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleChangeOtp(text, index)}
                        onKeyPress={({ nativeEvent }) => 
                          handleBackspace(nativeEvent.key, index)
                        }
                        ref={(ref) => {
                          inputRefs.current[index] = ref;
                        }}
                        editable={!isLoading}
                        selectTextOnFocus
                      />
                    ))}
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.button, isLoading && styles.buttonDisabled]} 
                  onPress={verifyOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendSection}>
                  {!resendClicked && !showResendPrompt && timer > 0 && (
                    <Text style={styles.timerText}>
                      Resend OTP in {timer} seconds
                    </Text>
                  )}

                  {showResendPrompt && !resendClicked && (
                    <TouchableOpacity 
                      onPress={handleResendOtp}
                      disabled={isResending}
                    >
                      {isResending ? (
                        <View style={styles.resendLoading}>
                          <ActivityIndicator size="small" color="#16a34a" />
                          <Text style={styles.resendingText}>Sending...</Text>
                        </View>
                      ) : (
                        <Text style={styles.linkText}>
                          Didn&apos;t receive OTP? Resend OTP
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Message Container */}
          <View style={styles.messageContainer}>
            {otpError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {otpError}</Text>
              </View>
            ) : null}
            
            {otpSuccess ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>✅ {otpSuccess}</Text>
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
    backgroundColor: '#E6F4EA', // light green background
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#065F46', // dark green
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -60,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: '#D1FAE5', // greenish border
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#F0FFF4', // very light green
    color: '#065F46',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#fff5f5',
  },
  mobileDisplay: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  mobileText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  editText: {
    fontSize: 14,
    color: '#16a34a',
    textDecorationLine: 'underline',
  },
  otpSection: {
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  otpBox: {
    borderWidth: 2,
    borderColor: '#D1FAE5',
    borderRadius: 12,
    width: 48,
    height: 56,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: '#F0FFF4',
    color: '#065F46',
  },
  otpBoxFilled: {
    borderColor: '#16a34a',
    backgroundColor: '#E6F4EA',
  },
  otpBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#fff5f5',
  },
  button: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A7F3D0',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  resendSection: {
    marginTop: 24,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#16a34a',
    textAlign: 'center',
  },
  linkText: {
    fontSize: 15,
    color: '#065F46',
    textAlign: 'center',
    fontWeight: '500',
  },
  resendLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendingText: {
    fontSize: 15,
    color: '#16a34a',
    fontWeight: '500',
  },
  messageContainer: {
    minHeight: 60,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  successText: {
    color: '#16a34a',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
