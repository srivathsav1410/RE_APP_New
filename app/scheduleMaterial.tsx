import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ Get params from MapPicker
  const { latitude, longitude, imageUri } = useLocalSearchParams();

  const allSubOptions = selectedMaterials.flatMap(
    (m) => subOptionsMap[m] || []
  );

  const handleSubmit = () => {
    if (uploadImage) {
      router.push({
        pathname: "/scheduleCamera",
        params: {
          imageUri: imageUri ? (imageUri as string) : "",
          latitude,
          longitude,
          materials: JSON.stringify([
            ...selectedMaterials.filter((m) => m !== "Others"),
            ...(customMaterial ? [customMaterial] : []),
          ]),
          subOptions: JSON.stringify(selectedSubOptions),
        },
      });
    } else {
      router.push("/successScreen");
    }
  };

  // Auto redirect after success
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
          <Text style={styles.successText}>✅ Submitted successfully!</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ✅ Back Button */}
        <TouchableOpacity
          onPress={() => router.push("/scheduleLocation")}
          style={styles.backArrow}
        >
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Please select material type</Text>

        {/* ✅ Show selected location */}
        {(latitude || longitude) && (
          <View style={styles.locationCard}>
            <Text style={styles.locationText}>
              📍 Location Selected:
            </Text>
            <Text style={styles.coords}>
              Lat: {latitude} | Lng: {longitude}
            </Text>
          </View>
        )}

        {imageUri && (
          <Image source={{ uri: imageUri as string }} style={styles.image} />
        )}

        {/* ✅ Materials */}
        <View style={styles.card}>
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
          <View style={[styles.card, { zIndex: 999, overflow: "visible" }]}>
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

        {/* ✅ Upload Image Checkbox */}
        <View
          style={[styles.card, { flexDirection: "row", alignItems: "center" }]}
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

        {/* ✅ Submit button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MaterialScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4", // ✅ light green background
  },
  successBanner: {
    backgroundColor: "#dcfce7",
    padding: 12,
    alignItems: "center",
  },
  successText: {
    color: "#166534",
    fontSize: 16,
    fontWeight: "600",
  },
  backArrow: {
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  content: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  locationCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  coords: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
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
    marginBottom: 12,
    color: "#222",
  },
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
  checkedBox: {
    backgroundColor: "#4ade80",
  },
  checkmark: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  optionLabel: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
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
  selectedStyle: {
    backgroundColor: "#bbf7d0",
    borderRadius: 6,
  },
  submitButton: {
    backgroundColor: "#4ade80",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  submitText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
});
