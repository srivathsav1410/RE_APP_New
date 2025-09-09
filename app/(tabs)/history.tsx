import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrderHistory } from "../../apis/userRegister";
import { useUser } from '../../context/UserContext';

export default function HistoryScreen() {
  const router = useRouter();

  // State
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [size] = useState(7); // items per page
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
const { user } = useUser();

  const userId = user?.userId;

  const fetchOrders = useCallback(
    async (pageNumber: number, isRefresh = false) => {
      // Prevent multiple simultaneous requests
      if (loading && !isRefresh) return;

      setLoading(true);
      try {
        const data = await getOrderHistory(userId, pageNumber, size);
        if (data && data.length > 0) {
          setOrders((prev) =>
            isRefresh ? data : [...prev, ...data] 
          );
          
          if (data.length < size) {
            setHasMore(false);
          }
        } else {
          setHasMore(false); 
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
        if (isRefresh) setRefreshing(false);
      }
    },
    [size, userId] // Removed 'loading' from dependencies to prevent infinite loops
  );
console.log("Orders state:", orders);
 
  useEffect(() => {
    fetchOrders(1);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore && !initialLoad) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrders(nextPage);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setOrders([]); // Clear existing data immediately for better UX
    fetchOrders(1, true);
  };

  // Render card
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/pickupDetails",   params: {
    orderAt: item.orderAt,
    status: item.status,
    pickupAddress: JSON.stringify(item.pickupAddress), // serialize object
    items: JSON.stringify(item.items), // serialize array
    imageUrl: item.imageUrl,
  }, })
      }
    >
      {/* Left Side: Image */}
      <Image 
        source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1581579188871-45ea61f2bb2c' }} 
        style={styles.image}
        // Add fallback for broken images
      />

      {/* Right Side: Info */}
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <Text style={styles.date}>{item.date}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "Completed" ? "#22c55e20" : "#f9731620",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: item.status === "Completed" ? "#16a34a" : "#ea580c",
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.address} numberOfLines={1}>
          📍 {item.pickupAddress.street}, {item.pickupAddress.city}
        </Text>
        <Text style={styles.materials}>
  ♻️ {item.items?.map((i: any) => {
    const subs = i.subItems?.map((s: any) => s.name).join(", ");
    return subs ? `${i.name} (${subs})` : i.name;
  }).join(", ") || "No materials listed"}
</Text>

      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={{ 
          padding: 16,
          // Add minimum height to show empty state properly
          flexGrow: orders.length === 0 ? 1 : 0
        }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3} // Reduced from 0.5 for better UX
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          loading && !refreshing && !initialLoad ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#16a34a" />
              <Text style={{ marginTop: 8, color: "#777", fontSize: 12 }}>
                Loading more...
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && !initialLoad ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ textAlign: "center", marginTop: 40, color: "#777", fontSize: 16 }}>
                No order history found
              </Text>
              <Text style={{ textAlign: "center", marginTop: 8, color: "#999", fontSize: 14 }}>
                Your completed orders will appear here
              </Text>
            </View>
          ) : initialLoad ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#16a34a" />
              <Text style={{ marginTop: 16, color: "#777" }}>Loading history...</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f3f4f6', // Background color while loading
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  date: { fontSize: 16, fontWeight: "600", color: "#111" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  address: { fontSize: 14, color: "#374151", marginBottom: 2 },
  materials: { fontSize: 13, color: "#6b7280", fontStyle: "italic" },
});