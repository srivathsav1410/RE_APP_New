import { Ionicons } from "@expo/vector-icons"; // ✅ import for back arrow
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ScheduleCameraScreen() {
  const [image, setImage] = useState<string | null>(null);

  const router = useRouter();
  const { materials, subOptions } = useLocalSearchParams();

  const handleBack = () => {
    router.replace("/scheduleMaterial");
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      handleSubmit(uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      handleSubmit(uri);
    }
  };

  const handleSubmit = (uri: string) => {
    console.log("Submitting with params:", {
      materials,
      subOptions,
      imageUri: uri,
    });

    // ✅ Redirect to success screen after 2 seconds
    setTimeout(() => {
      router.replace("/successScreen"); 
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      {/* Center Content */}
      <View style={styles.card}>
        <Text style={styles.title}>Please upload the image of the waste</Text>

        <TouchableOpacity style={styles.button} onPress={openCamera}>
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={pickFromGallery}>
          <Text style={styles.buttonText}>Pick from Gallery</Text>
        </TouchableOpacity>

        {image && <Image source={{ uri: image }} style={styles.preview} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
    marginTop: 80, // ⬅️ keeps card lower from back arrow
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4ade80",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 10,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  preview: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
});
