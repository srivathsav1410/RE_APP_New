import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PickupDetailsScreen() {
  const { orderAt, status, pickupAddress, items, imageUrl } = useLocalSearchParams();
  const [imageError, setImageError] = useState(false);
console.log("PickupDetails params:", { orderAt, status, pickupAddress, items });
  const statusColor = status === "Completed" ? "#16a34a" : "#ea580c";
  const parsedAddress =
  typeof pickupAddress === "string" ? JSON.parse(pickupAddress) : pickupAddress;

const parsedItems =
  typeof items === "string" ? JSON.parse(items) : items || [];
  console.log(orderAt)  ;
  console.log(imageUrl)

  // const parsedAddress = pickupAddress ? JSON.parse(pickupAddress as string) : "";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Image with fallback */}
        <Image
          source={{
            uri: imageError
              ? "https://images.unsplash.com/photo-1581579188871-45ea61f2bb2c"
              : (imageUrl as string),
          }}
          style={styles.image}
          onError={() => setImageError(true)}
        />

        <Text style={styles.title}>Pickup Details</Text>

        {/* Date */}
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={20} color="#16a34a" />
          <Text style={styles.label}>Date</Text>
        </View>
<Text style={styles.value}>
  {orderAt
    ? new Date(orderAt as string).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "No date"}
</Text>


        {/* Status */}
        <View style={styles.row}>
          <Ionicons name="checkmark-circle-outline" size={20} color={statusColor} />
          <Text style={styles.label}>Status</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>
        </View>

        {/* Address */}
        <View style={styles.row}>
          <Ionicons name="location-outline" size={20} color="#2563eb" />
          <Text style={styles.label}>Address</Text>
        </View>
       <Text style={styles.value}>{parsedAddress.street} {parsedAddress.city}</Text> 

        {/* Materials */}
        <View style={styles.row}>
          <Ionicons name="leaf-outline" size={20} color="#059669" />
          <Text style={styles.label}>Materials</Text>
        </View>
        <Text style={styles.value}>
          {parsedItems?.map((i: any) => {
            const subs = i.subItems?.map((s: any) => s.name).join(", ");
            return subs ? `${i.name} (${subs})` : i.name;
          }).join(", ") || "No materials listed"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    color: "#111",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
    color: "#111",
  },
  value: {
    fontSize: 15,
    color: "#555",
    marginTop: 4,
    marginLeft: 26, // aligns with icons
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
    marginLeft: 26,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
