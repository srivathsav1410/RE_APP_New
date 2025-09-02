import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mockData = [
  {
    id: "1",
    date: "2025-08-10",
    status: "Completed",
    address: "Hyderabad, Telangana",
    materials: ["Plastic", "Metal"],
    photo: "https://via.placeholder.com/150",
  },
  {
    id: "2",
    date: "2025-08-12",
    status: "Pending",
    address: "Secunderabad, Telangana",
    materials: ["Paper"],
    photo: "https://via.placeholder.com/150",
  },
];

export default function HistoryScreen() {
  const router = useRouter();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/pickupDetails", params: { ...item } })
      }
    >
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.address} numberOfLines={1}>
        {item.address}
      </Text>
      <Text style={styles.materials}>
        Materials: {item.materials.join(", ")}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mockData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  date: { fontSize: 16, fontWeight: "bold" },
  status: { fontSize: 14, color: "#555", marginVertical: 2 },
  address: { fontSize: 14, color: "#777", marginBottom: 4 },
  materials: { fontSize: 14, fontStyle: "italic" },
});
