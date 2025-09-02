import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const statesOfIndia = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
].sort();

const serviceablePincodes = ["500001", "500002", "600001", "110001"];

const LocationScreen = () => {
  const router = useRouter();
  const { imageUri, pickedLocation } = useLocalSearchParams();

  const [pincode, setPincode] = useState("");
  const [manualEntry, setManualEntry] = useState(false);
  const [locationCard, setLocationCard] = useState(false);
  const [loading, setLoading] = useState(false);

  const [houseNo, setHouseNo] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [location, setLocation] = useState(
    pickedLocation ? decodeURIComponent(pickedLocation as string) : ""
  );

  const [notServiceable, setNotServiceable] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleBack = () => {
    if (manualEntry) {
      setManualEntry(false);
    } else if (locationCard) {
      setLocationCard(false);
    } else {
      router.replace({ pathname: "(tabs)" });
    }
  };

  const checkPincode = () => {
    if (serviceablePincodes.includes(pincode)) {
      setNotServiceable(false);
      setLocationCard(true);
    } else {
      setNotServiceable(true);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setLoading(false);
      Alert.alert(
        "Permission Required",
        "Location permission is required. Please enable it in your phone’s Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const address = await Location.reverseGeocodeAsync(loc.coords);
    const addr = address[0];
    const formatted = `${addr.name || ""}, ${addr.street || ""}, ${addr.city || ""}`;

    router.push({
      pathname: "/mapScreen",
      params: {
        imageUri,
        initialLat: loc.coords.latitude,
        initialLng: loc.coords.longitude,
        initialAddress: formatted,
      },
    });

    setLoading(false);
  };

  const validateFields = () => {
    let tempErrors: any = {};
    if (!houseNo) tempErrors.houseNo = "This is a required field";
    if (!landmark) tempErrors.landmark = "This is a required field";
    if (!city) tempErrors.city = "This is a required field";
    if (!selectedState) tempErrors.selectedState = "This is a required field";
    if (!pincode) tempErrors.pincode = "This is a required field";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateFields()) return;

    let finalLocation = location;
    if (manualEntry && houseNo && landmark && city && selectedState && pincode) {
      finalLocation = `${houseNo}, ${landmark}, ${city}, ${selectedState} - ${pincode}`;
    }
    router.push({
      pathname: "/scheduleMaterial",
      params: { imageUri, location: finalLocation },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Back Arrow */}
        <TouchableOpacity style={styles.backArrow} onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        {/* Step 1: Enter Pincode */}
        {!locationCard && !manualEntry && (
          <>
            <Text style={styles.title}>Enter your Pincode</Text>
            <TextInput
              placeholder="Pincode"
              style={styles.input}
              keyboardType="number-pad"
              value={pincode}
              onChangeText={setPincode}
            />
            <TouchableOpacity style={styles.button} onPress={checkPincode}>
              <Text style={styles.buttonText}>Check</Text>
            </TouchableOpacity>

            {notServiceable && (
              <View style={styles.alertBox}>
                <Text style={styles.alertText}>
                  ❌ Sorry, we are currently not available in your area.
                </Text>
                <TouchableOpacity
                  style={styles.homeButton}
                  onPress={() => router.replace({ pathname: "(tabs)" })}
                >
                  <Text style={styles.homeButtonText}>Go to Home</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Step 2: Address Options */}
        {locationCard && !manualEntry && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What’s your address?</Text>
            <Text style={styles.cardSubtitle}>
              Allow us to detect your current location, or add manually if you’re ordering elsewhere.
            </Text>

            <TouchableOpacity
              style={[styles.button, { marginBottom: 10 }]}
              onPress={() => setManualEntry(true)}
            >
              <Text style={styles.buttonText}>Add Manually</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleUseCurrentLocation}
            >
              <Text style={styles.buttonText}>
                {loading ? "Fetching..." : "Detect Location"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Manual Entry */}
        {manualEntry && (
          <>
            <TextInput
              placeholder="House Number"
              style={styles.input}
              value={houseNo}
              onChangeText={setHouseNo}
            />
            {errors.houseNo && <Text style={styles.errorText}>{errors.houseNo}</Text>}

            <TextInput
              placeholder="Landmark"
              style={styles.input}
              value={landmark}
              onChangeText={setLandmark}
            />
            {errors.landmark && <Text style={styles.errorText}>{errors.landmark}</Text>}

            <TextInput
              placeholder="City"
              style={styles.input}
              value={city}
              onChangeText={setCity}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

            {/* State Picker */}
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedState}
                onValueChange={(value) => setSelectedState(value)}
              >
                <Picker.Item label="Select State" value="" />
                {statesOfIndia.map((st) => (
                  <Picker.Item key={st} label={st} value={st} />
                ))}
              </Picker>
            </View>
            {errors.selectedState && <Text style={styles.errorText}>{errors.selectedState}</Text>}

            {/* Pincode (disabled, pre-filled) */}
            <TextInput
              placeholder="Pincode"
              style={[styles.input, { backgroundColor: "#e5e7eb" }]}
              value={pincode}
              editable={false}
            />
            {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}

            {/* If user picked location from map, show it */}
            {location ? (
              <Text style={{ marginVertical: 10, fontWeight: "600", color: "#333" }}>
                📍 Selected: {location}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  backArrow: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4ade80",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  alertBox: {
    backgroundColor: "#fce7f3",
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  alertText: {
    color: "#b91c1c",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  homeButton: {
    backgroundColor: "#4ade80",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  homeButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 6,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 13,
    color: "red",
    marginBottom: 8,
    marginLeft: 4,
  },
});

export default LocationScreen;
