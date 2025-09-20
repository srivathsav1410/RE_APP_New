import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";
import { imageUpload, placeOrder } from "../apis/userRegister";
import { useUser } from "../context/UserContext";
import { BackHandler } from "react-native";


const materialOptions = [
  "Plastic",
  "Paper",
  "Metal",
  "Glass",
  "Organic waste",
  "Others",
];

const subOptionsMap: Record<string, string[]> = {
  Plastic: ["Bottles", "Containers", "Bags"],
  Paper: ["Newspapers", "Cardboards", "Magazines", "Books"],
  Metal: ["Cans", "Foil", "Scrap Metal"],
  Glass: ["Jars", "Glass Bottles", "Containers"],
  "Organic waste": ["Food Scraps", "Yard Waste"],
};

const MaterialScreen = () => {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [customMaterial, setCustomMaterial] = useState("");
  const [selectedSubOptions, setSelectedSubOptions] = useState<string[]>([]);
  const [uploadImage, setUploadImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState<any>(null);
  const { user, address } = useUser();
  const { latitude, longitude } = useLocalSearchParams();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const allSubOptions = selectedMaterials.flatMap(
    (m) => subOptionsMap[m] || []
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);

      const response = await imageUpload(result.assets[0].uri);
      console.log("Image upload response:", response);
      setImageUrl(response);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      const response = await imageUpload(result.assets[0].uri);
      setImageUrl(response);
      console.log("Image upload response:", response);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    let subItemCounter = 1;

    const itemsPayload = selectedMaterials.map((material, index) => {
      const itemId = index + 1;
      let name = material;

      if (material === "Others" && customMaterial) {
        name = customMaterial;
      }

      const subItems = selectedSubOptions
        .filter((sub) => (subOptionsMap[material] || []).includes(sub))
        .map((sub) => ({
          subItemId: subItemCounter++,
          itemId,
          name: sub,
        }));

      return {
        itemId,
        name,
        subItems,
      };
    });

    console.log("Items Payload:", JSON.stringify(itemsPayload, null, 2));
    console.log(address);
    console.log(imageUrl);

    let jsonData: any = {
      userId: user?.userId,
      address: address,
      items: itemsPayload,
      imageUrl: imageUrl,
    };

    try {
      const res = await placeOrder(jsonData);
      console.log("Order placed successfully:", res);
      setShowSuccess(true);

      // Trigger fade-in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      console.log(
        "Error placing order:",
        err.response?.data || err.message || err
      );
    }
  };

  useEffect(() => {
  const backAction = () => {
    router.push("/scheduleLocation");
    return true; // prevent app exit
  };

  const backHandler = BackHandler.addEventListener(
    "hardwareBackPress",
    backAction
  );

  return () => backHandler.remove(); // cleanup
}, []);


  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        // Trigger fade-out before hiding
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowSuccess(false);
          router.push("(tabs)");
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <View style={styles.container}>
      {/* ✅ Success Overlay */}
      {showSuccess && (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={70} color="#16a34a" />
            <Text style={styles.successTitle}>Order Successful!</Text>
            <Text style={styles.successMessage}>
              Thank you for your order. We’ll process it soon 🚀
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                router.push("(tabs)");
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.push("/scheduleLocation")}
          style={styles.backArrow}
        >
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Please select material type</Text>

        {address && (
          <View style={styles.locationCard}>
            <Text style={styles.locationText}>📍 Location Selected:</Text>
            <Text style={styles.coords}>
              {address.street}, {address.city}, {address.state} -{" "}
              {address.pincode}
            </Text>
          </View>
        )}

        {/* ✅ Materials */}
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>Select Materials</Text>
          {materialOptions.map((item) => {
            const isSelected = selectedMaterials.includes(item);
            return (
              <View key={item} style={styles.optionRow}>
                <TouchableOpacity
                  style={[styles.checkbox, isSelected && styles.checkedBox]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedMaterials((prev) =>
                        prev.filter((m) => m !== item)
                      );
                      if (item === "Others") setCustomMaterial("");
                    } else {
                      setSelectedMaterials((prev) => [...prev, item]);
                    }
                  }}
                >
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <Text style={styles.optionLabel}>{item}</Text>

                {item === "Others" && isSelected && (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter material"
                    value={customMaterial}
                    onChangeText={setCustomMaterial}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* ✅ Sub-options */}
        {selectedMaterials.length > 0 && (
          <View
            style={[styles.locationCard, { zIndex: 999, overflow: "visible" }]}
          >
            <Text style={styles.cardTitle}>Select Sub-options</Text>
            <MultiSelect
              style={styles.dropdown}
              placeholderStyle={{ color: "#999" }}
              selectedTextStyle={{ color: "#000" }}
              inputSearchStyle={{ color: "#000" }}
              data={allSubOptions.map((o) => ({ label: o, value: o }))}
              labelField="label"
              valueField="value"
              placeholder="Select sub-options"
              search
              value={selectedSubOptions}
              onChange={(items) => setSelectedSubOptions(items)}
              selectedStyle={styles.selectedStyle}
              alwaysRenderSelectedItem
              maxHeight={200}
              activeColor="#bbf7d0"
              dropdownPosition="top"
            />
          </View>
        )}

        {/* ✅ Upload Image Section */}
        {uploadImage && (
          <View style={styles.locationCard}>
            <Text style={styles.cardTitle}>Upload Waste Image</Text>

            {selectedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.previewImage}
                />
                <TouchableOpacity style={styles.deleteBtn} onPress={removeImage}>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{ flexDirection: "row", justifyContent: "space-around" }}
              >
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickImage}
                >
                  <Ionicons name="image-outline" size={22} color="#000" />
                  <Text style={styles.uploadText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera-outline" size={22} color="#000" />
                  <Text style={styles.uploadText}>Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View
          style={[
            styles.locationCard,
            { flexDirection: "row", alignItems: "center" },
          ]}
        >
          <Checkbox
            value={uploadImage}
            onValueChange={setUploadImage}
            color={uploadImage ? "#4ade80" : undefined}
          />
          <Text style={{ marginLeft: 8, fontSize: 16, color: "#000" }}>
            Upload a picture of the waste?
          </Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MaterialScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  backArrow: { marginBottom: 10, alignSelf: "flex-start" },
  content: { paddingTop: 60, paddingBottom: 60, paddingHorizontal: 20 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  locationCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#4ade80",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 6,
  },
  coords: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
    lineHeight: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#222" },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    flexWrap: "wrap",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 6,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: { backgroundColor: "#4ade80" },
  checkmark: { color: "#000", fontSize: 16, fontWeight: "bold" },
  optionLabel: { fontSize: 16, color: "#000", fontWeight: "500" },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
    color: "#000",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
  },
  selectedStyle: { backgroundColor: "#bbf7d0", borderRadius: 6 },
  imagePreviewContainer: {
    position: "relative",
    alignItems: "center",
    marginTop: 10,
  },
  previewImage: { width: 200, height: 200, borderRadius: 10 },
  deleteBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 6,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#4ade80",
    borderRadius: 8,
    marginTop: 10,
  },
  uploadText: { marginLeft: 8, fontSize: 16, fontWeight: "600", color: "#000" },
  submitButton: {
    backgroundColor: "#4ade80",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  submitText: { fontSize: 18, fontWeight: "700", color: "#000" },

  // ✅ Success Overlay Styles
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  successCard: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: "80%",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
    color: "#166534",
  },
  successMessage: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginTop: 8,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#4ade80",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: { color: "#000", fontWeight: "600", fontSize: 16 },
});
