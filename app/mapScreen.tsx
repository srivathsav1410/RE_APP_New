import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import MapView, { Marker, MapPressEvent, PROVIDER_GOOGLE } from "react-native-maps";

import { useUser } from "../context/UserContext";

export default function MapPicker() {
  const router = useRouter();
  const { pincode } = useLocalSearchParams();
  console.log("Pincode from params:", pincode);

  const [region, setRegion] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matchError, setMatchError] = useState<string | null>(null);

  const { setAddress } = useUser();
  const mapRef = useRef<MapView | null>(null);

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
      setMarker({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLoading(false);
    })();
  }, []);

  const handleMapPress = (event: MapPressEvent) => {
    const newMarker = event.nativeEvent.coordinate;
    setMarker(newMarker);
    setMatchError(null);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: newMarker.latitude,
          longitude: newMarker.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const handleConfirm = async () => {
    if (!marker) return;
    try {
      const [address] = await Location.reverseGeocodeAsync(marker);
      console.log("Reverse geocoded address:", address);

      if (!address) {
        setMatchError("Unable to fetch address. Please try again.");
        return;
      }
      if (address.country !== "India") {
        setMatchError("Please choose a valid Indian location.");
        return;
      }
      if (!address.street) {
        setMatchError("Please choose a valid street location.");
        return;
      }
      setMatchError(null);

      const formattedAddress = `${address.name || ""}, ${address.street || ""}, ${address.city || ""}, ${address.region || ""}, ${address.country || ""}`;
      setAddress({
        street: address.street || "",
        city: address.city || "",
        state: address.region || "",
        pincode: address.postalCode || "",
      });

      router.push({
        pathname: "/scheduleMaterial",
        params: { address: formattedAddress },
      });
    } catch (error) {
      console.error("Error fetching address: ", error);
      setMatchError("Unable to fetch address. Please try again.");
    }
  };

  const recenterToCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setMarker({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
      }
      setMatchError(null);
    } catch (error) {
      console.error("Error fetching current location:", error);
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
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {marker && (
          <Marker
            key={`${marker.latitude}-${marker.longitude}`}
            coordinate={marker}
            draggable
            onDragEnd={(e) => {
              setMarker(e.nativeEvent.coordinate);
              setMatchError(null);
            }}
          />
        )}
      </MapView>

      {/* Current Location Button */}
      <TouchableOpacity style={styles.currentLocationButton} onPress={recenterToCurrentLocation}>
        <Text style={styles.currentLocationText}>📍</Text>
      </TouchableOpacity>

      {matchError && <Text style={styles.errorText}>{matchError}</Text>}

      <TouchableOpacity
        style={[styles.confirmButton, matchError ? { backgroundColor: "gray" } : {}]}
        onPress={handleConfirm}
        disabled={!!matchError}
      >
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
  loadingText: { marginTop: 10, fontSize: 16, color: "#333" },
  confirmButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
  },
  confirmText: { color: "white", fontWeight: "bold", fontSize: 16, letterSpacing: 0.5 },
  errorText: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "red",
    color: "red",
    fontSize: 14,
    textAlign: "center",
    maxWidth: "90%",
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 110, // above confirm button
    right: 20,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  currentLocationText: { fontSize: 20 },
});
