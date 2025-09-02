import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function PickupDetailsScreen() {
  const { date, status, address, materials, photo } = useLocalSearchParams();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {photo ? (
          <Image source={{ uri: photo as string }} style={styles.image} />
        ) : null}

        <Text style={styles.title}>Pickup Details</Text>

        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{date}</Text>

        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{status}</Text>

        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{address}</Text>

        <Text style={styles.label}>Materials:</Text>
        <Text style={styles.value}>{(materials as string) || ""}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F0FDF4", // soft green bg
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // Android shadow
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: "#555",
    marginBottom: 6,
  },
});
