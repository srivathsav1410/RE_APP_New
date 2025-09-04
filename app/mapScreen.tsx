import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import MapView, { Marker, MapPressEvent, PROVIDER_GOOGLE } from "react-native-maps";

import { useUser} from "../context/UserContext";


export default function MapPicker() {
  const router = useRouter();
  const [region, setRegion] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const { setAddress } = useUser();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(initialRegion);

      // Use a custom marker at user location
      setMarker({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setLoading(false);
    })();
  }, []);

  const handleMapPress = (event: MapPressEvent) => {
    setMarker(event.nativeEvent.coordinate);
  };

const handleConfirm = async () => {
  if (!marker) return;

  try {
    // Get address from coordinates
    const [address] = await Location.reverseGeocodeAsync({
      latitude: marker.latitude,
      longitude: marker.longitude,
    });
console.log("Reverse geocoded address:", address);
    const formattedAddress = address
      ? `${address.name || ""}, ${address.street || ""}, ${address.city || ""}, ${address.region || ""}, ${address.country || ""}`
      : "Address not found";
setAddress({
      street: address.street || "",
      city: address.city || "",
      state: address.region || "",
      pincode: address.postalCode || "",
    });
    // Navigate with latitude, longitude, and address
    router.push({
      pathname: "/scheduleMaterial",
      params: {
        address: formattedAddress,
      },
    });
  } catch (error) {
    console.error("Error fetching address: ", error);
    alert("Unable to fetch address. Please try again.");
  }
};

  if (loading || !region) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Fetching your location...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation={false} // hide default blue dot
      >
        {marker && (
          <Marker
            coordinate={marker}
            draggable
            pinColor="#4CAF50" // green pin to differentiate
            onDragEnd={(e) => setMarker(e.nativeEvent.coordinate)}
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm Location</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  confirmButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  confirmText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
