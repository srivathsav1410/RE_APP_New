import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from '../../context/UserContext';

const UserRegistered = () => {
  const { name, welcomeBack } = useLocalSearchParams();
  const isWelcomeBack = welcomeBack === 'true';
  const router = useRouter();

  const goToSchedule = () => {
    router.replace('/scheduleLocation');
  };
const token=  AsyncStorage.getItem("userToken");
  console.log("Token from AsyncStorage:", token);
    const { user } = useUser();

  console.log("User from context in index:", user);
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Text */}
        <Text style={styles.welcomeText}>
          {isWelcomeBack ? ` Welcome back ${user?.userName}!` : `Welcome ${user?.userName}!`}
        </Text>

        {/* Schedule Pickup Section */}
       { /*<Text style={styles.sectionTitle}>Schedule Pickup</Text>*/}
        <View style={styles.card}>
          <Image
            source={require('../../assets/images/truck.png')}
            style={styles.truckImage}
            resizeMode="contain"
          />
          <Text style={styles.cardTitle}>Request a Pickup</Text>
          <Text style={styles.cardText}>
            Schedule a pickup for your waste.{"\n"}Choose your preferred date and time.
          </Text>
          <TouchableOpacity style={styles.scheduleButton} onPress={goToSchedule}>
            <Text style={styles.scheduleButtonText}>Schedule Pickup</Text>
          </TouchableOpacity>
        </View>

       {/* Quote Section */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quoteText}>
            Turn trash into cash –{"\n"}Recycle today!. 🌍
          </Text>
          <Text style={styles.quoteMarkRight}>”</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4', // 🌿 Soft green background
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 100,
    backgroundColor: '#F0FDF4',
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  truckImage: {
    width: '100%',
    height: 160,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  scheduleButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  scheduleButtonText: {
    fontWeight: '600',
    color: '#fff',
  },

  // Quote Card
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  quoteMark: {
    fontSize: 36,
    color: '#4ade80',
    fontWeight: '900',
    alignSelf: 'flex-start',
  },
  quoteMarkRight: {
    fontSize: 36,
    color: '#4ade80',
    fontWeight: '900',
    alignSelf: 'flex-end',
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 26,
  },
});

export default UserRegistered;
