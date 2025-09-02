import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [showResendPrompt, setShowResendPrompt] = useState(false);
  const [resendClicked, setResendClicked] = useState(false);
  const [timer, setTimer] = useState(30);

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

  const handleSendOtp = () => {
    if (mobile.length !== 10) {
      setOtpError('Enter valid mobile number');
      return;
    }

    setIsOtpSent(true);
    setOtpError('');
    setOtp(Array(6).fill(''));
    setTimer(30);
    setShowResendPrompt(false);
    setResendClicked(false);
  };

  const handleResendOtp = () => {
    if (resendClicked) return;

    setResendClicked(true);
    setTimer(0);
    setOtpError('');
    setOtpSuccess('OTP has been resent');
    setTimeout(() => setOtpSuccess(''), 3000);
  };

  const handleChangeOtp = (text: string, index: number) => {

    if (otpError) setOtpError('');
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const verifyOtp = async() => {
    const enteredOtp = otp.join('');
    if (enteredOtp === '123456') {
      // simulate if user is new
      const isNewUser = mobile.endsWith('56')
   // const isNewUser=await FindUser(mobile)
    ; console.log(isNewUser);
      if (!isNewUser) {
        console.log('New user, redirecting to NameScreen...');
              router.replace({
        pathname: '/NameScreen',
        params: { isNewUser: 'true',mobilenumber: mobile },
      });
      } else {
         router.replace({
        pathname: '/NameScreen',
        params: { isNewUser: 'false',mobilenumber: mobile },
      });
      }
    } else {
      setOtpError('Incorrect OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {!isOtpSent ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
            keyboardType="numeric"
            maxLength={10}
            value={mobile}
            onChangeText={setMobile}
          />
          <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.mobileDisplay}>{mobile}</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.otpBox}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChangeOtp(text, index)}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                              />
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={verifyOtp}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>

          {otpError ? <Text style={styles.error}>{otpError}</Text> : null}
          {otpSuccess ? <Text style={styles.success}>{otpSuccess}</Text> : null}

          {!resendClicked && !showResendPrompt && (
            <Text style={styles.timerText}>Resend available in {timer} sec</Text>
          )}

          {showResendPrompt && !resendClicked && (
            <TouchableOpacity onPress={handleResendOtp}>
              <Text style={styles.linkText}>Didn&#39;t receive OTP? Resend OTP</Text>
            </TouchableOpacity>
          )}

        </>
      )}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
container: {
  flex: 1,
  padding: 20,
  paddingTop: 60,        // Moves everything up
  justifyContent: 'flex-start',
  backgroundColor: '#fff',
},
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    width: 40,
    height: 48,
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#4ade80',
    paddingVertical: 14,
    borderRadius: 24,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  mobileDisplay: {
    fontSize: 16,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 8,
  },
  success: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 8,
  },
  timerText: {
    textAlign: 'center',
    color: '#888',
  },
  linkText: {
    textAlign: 'center',
    color: 'blue',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});
