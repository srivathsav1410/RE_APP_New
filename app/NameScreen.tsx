import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SaveUser } from '../apis/userRegister';
import { useUser } from '../context/UserContext'; 
const NameScreen = () => {
  const router = useRouter();
  const { isNewUser, mobilenumber } = useLocalSearchParams();
  const [name, setName] = useState('');
  const { setUser } = useUser();

  const isNewUserBool = isNewUser === 'true';

  const payload = {
    userName: name,
    userRole: 'User',
    phoneNumber: mobilenumber,
  };

  useEffect(() => {
    if (!isNewUserBool) {
      console.log('🚫 Not a new user, redirecting...');
      router.replace({
  pathname: '(tabs)',
  params: { welcomeBack: 'true' },
});
    }
  }, [isNewUserBool, router]);

const handleContinue = async () => {
  if (name.trim()) {
    try {
      const response=await SaveUser(payload);
      console.log("Response from SaveUser:", response);
setUser(response.user);
      console.log('✅ User saved successfully:', name);
      router.replace({
        pathname: '(tabs)',
        params: { welcomeBack: 'false', name },
      });
    } catch (error) {

      // console.error('❌ Error saving user:', error);
    }
  } else {
    console.log('⚠️ Please enter your name.');
  }
};


  if (!isNewUserBool) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>⛔ Not a new user</Text>
        <Text>Param: {String(isNewUser)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Please enter your name</Text>
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TouchableOpacity onPress={handleContinue} style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4ade80',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
