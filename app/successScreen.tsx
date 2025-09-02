import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Success Icon */}
        <Image
          source={require("../assets/images/success_icon.png")} // update path based on your assets
          style={styles.icon}
        />

        {/* Title */}
        <Text style={styles.text}>Successfully Submitted</Text>

        {/* Subtitle */}
        <Text style={styles.subText}>Your request has been submitted.</Text>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("(tabs)")}
        >
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FDF4", // light green background
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    width: "90%",
    maxWidth: 350,
  },
  icon: {
    width: 70,
    height: 70,
    marginBottom: 20,
    resizeMode: "contain",
  },
  text: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000", // black instead of green
    marginBottom: 10,
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 25,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
