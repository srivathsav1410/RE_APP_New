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

const UserRegistered = () => {
  const { name, welcomeBack } = useLocalSearchParams();
  const isWelcomeBack = welcomeBack === 'true';
  const router = useRouter();

  const goToSchedule = () => {
    router.replace('/scheduleLocation');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Text */}
        <Text style={styles.welcomeText}>
          {isWelcomeBack ? 'Welcome back!' : `Welcome ${name}!`}
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
            <Text style={styles.scheduleButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Pickups Section */}
        <Text style={styles.sectionTitle}>Upcoming Pickups</Text>
        <View style={styles.upcomingCard}>
          <Text style={styles.upcomingTitle}>No Upcoming Pickups</Text>
          <Text style={styles.upcomingText}>
            You don’t have any pickups scheduled.{"\n"}Tap the button above to schedule one.
          </Text>
          <TouchableOpacity style={styles.scheduleSecondary} onPress={goToSchedule}>
            <Text style={styles.scheduleSecondaryText}>Schedule Pickup</Text>
          </TouchableOpacity>
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
  fontSize: 26, // bigger
  fontWeight: '800', // bolder
  fontFamily: 'sans-serif-medium', // optional, use your preferred font
//  color: '#4ade80',
  marginBottom: 20,
  textAlign: 'center',
},

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  truckImage: {
    width: '100%',
    height: 150,
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
  },
  upcomingCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  upcomingTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  upcomingText: {
    textAlign: 'center',
    color: '#444',
    marginBottom: 16,
  },
  scheduleSecondary: {
    backgroundColor: '#4ade80',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  scheduleSecondaryText: {
    fontWeight: '600',
  },
});

export default UserRegistered;
