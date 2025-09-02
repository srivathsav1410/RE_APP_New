import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Pencil } from 'lucide-react-native';

export default function ProfileScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('Harshi');
  const [editMode, setEditMode] = useState(false);

  const openImagePicker = async () => {
    Alert.alert('Update Profile Photo', 'Choose an option', [
      {
        text: 'Open Camera',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true });
          if (!result.canceled) {
            setImage(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Upload from Gallery',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true });
          if (!result.canceled) {
            setImage(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={openImagePicker}>
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <View style={styles.initialCircle}>
                <Text style={styles.initialText}>{name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.nameRow}>
            {editMode ? (
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.nameInput}
                onSubmitEditing={() => setEditMode(false)}
                autoFocus
              />
            ) : (
              <>
                <Text style={styles.userName}>{name}</Text>
                <TouchableOpacity onPress={() => setEditMode(true)} style={styles.penIcon}>
                  <Pencil size={16} color="#666" />
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.memberSince}>Member since Jan 2024</Text>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemText}>Help & Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4', paddingTop: 30 }, // ✅ light green + padding
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  initialCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  initialText: {
    fontSize: 40,
    color: '#555',
    fontWeight: 'bold',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  penIcon: {
    marginLeft: 6,
    padding: 4,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 4,
    width: 160,
  },
  memberSince: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
});
