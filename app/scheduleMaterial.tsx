import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import { router, useLocalSearchParams } from "expo-router";
import { use, useEffect, useState } from "react";
import {
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
import { imageUpload,placeOrder } from "../apis/userRegister";
import { useUser } from "../context/UserContext";

const materialOptions = [
  "Plastic",
  "Paper",
  "Metal",
  "E-waste",
  "Glass",
  "Organic waste",
  "Others",
];

const subOptionsMap: Record<string, string[]> = {
  Plastic: ["Bottles", "Containers", "Bags"],
  Paper: ["Newspapers", "Cardboards", "Magazines", "Books"],
  Metal: ["Cans", "Foil", "Scrap Metal"],
  "E-waste": ["Electronics", "Batteries", "Cables"],
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
  const { user,address } = useUser();

  const { latitude, longitude } = useLocalSearchParams();

  const allSubOptions = selectedMaterials.flatMap(
    (m) => subOptionsMap[m] || []
  );

  const pickImage = async () => {
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'], 
  allowsEditing: true,
  aspect: [4, 4],
  quality: 0.7,
});

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
  

  const response = await imageUpload(result?.assets[0]?.uri);
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

    if (!result.canceled){
      setSelectedImage(result.assets[0].uri);
        const response=  await imageUpload(result.assets[0].uri);
setImageUrl(response);
  console.log("Image upload response:", response);
    }
  };

  const removeImage = () => {

    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    // const items=selectedMaterials.map()
  let subItemCounter = 1; // global counter for unique subItemIds

const itemsPayload = selectedMaterials.map((material, index) => {
  const itemId = index + 1; // assign an incremental ID
  let name = material;

  if (material === "Others" && customMaterial) {
    name = customMaterial;
  }

  const subItems = selectedSubOptions
    .filter((sub) => (subOptionsMap[material] || []).includes(sub))
    .map((sub) => ({
      subItemId: subItemCounter++, // globally unique
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
console.log(address)
console.log(imageUrl)

    let jsonData:any={
userId:user?.userId,
address:address,
items:itemsPayload,
imageUrl:imageUrl
    }

 try {
  const res = await placeOrder(jsonData);
  console.log("Order placed successfully:", res);
  setShowSuccess(true);
} catch (err: any) {
  console.log("Error placing order:", err.response?.data || err.message || err);
}
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        router.push("(tabs)");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <View style={styles.container}>
   {showSuccess && (
  <View style={styles.successBanner}>
    <Ionicons name="checkmark-circle" size={40} color="#16a34a" />
    <Text style={styles.successTitle}>Order Successful!</Text>
    <Text style={styles.successMessage}>
      Thank you for your order. We’ll process it soon 🚀
    </Text>
  </View>
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

        {(address) && (
          <View style={styles.locationCard}>
            <Text style={styles.locationText}>📍 Location Selected:</Text>
            <Text style={styles.coords}>
              {address.street}, {address.city}, {address.state} - {address.pincode}
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
          <View style={[styles.locationCard, { zIndex: 999, overflow: "visible" }]}>
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
              <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                  <Ionicons name="image-outline" size={22} color="#000" />
                  <Text style={styles.uploadText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                  <Ionicons name="camera-outline" size={22} color="#000" />
                  <Text style={styles.uploadText}>Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View
          style={[styles.locationCard, { flexDirection: "row", alignItems: "center" }]}
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
  successText: { color: "#166534", fontSize: 16, fontWeight: "600" },
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
  borderColor: "#4ade80", // light green border to highlight
},
locationText: { 
  fontSize: 16, 
  fontWeight: "700", // bold
  color: "#166534",  // dark green for title
  marginBottom: 6,
},
coords: { 
  fontSize: 15, 
  fontWeight: "600", // semi-bold
  color: "#111",     // darker text
  textAlign: "center",
  lineHeight: 20,
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
  successBanner: {
  backgroundColor: "#dcfce7",
  padding: 20,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  margin: 16,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 3,
},
successTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#166534",
  marginTop: 10,
},
successMessage: {
  fontSize: 14,
  color: "#065f46",
  marginTop: 6,
  textAlign: "center",
},

});
