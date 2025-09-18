import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Pencil, ChevronRight, Check } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { upadateName } from '@/apis/userRegister';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();
  console.log("User from context:", user);  

  const [name, setName] = useState(user?.userName || 'User Name');
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempName, setTempName] = useState(name); // Temporary name for editing

  // Update local state when user context changes
  useEffect(() => {
    if (user?.userName) {
      setName(user.userName);
      setTempName(user.userName);
    }
  }, [user?.userName]);

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("accessToken");
              await AsyncStorage.removeItem("refreshToken");
              router.replace("/loginscreen");
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    if (tempName.trim() === name) {
      setEditMode(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await upadateName({
        phoneNumber: user?.phoneNumber,
        userName: tempName.trim()
      });
      console.log("Response from upadateName:", response);
      if (response) {
        setUser(response.data);
        setName(tempName.trim());
        setEditMode(false);
        Alert.alert("Success", "Name updated successfully");
      } else {
        throw new Error("Failed to update name");
      }
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert("Error", "Failed to update name. Please try again.");
      setTempName(name); // Reset temp name on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setTempName(name); // Reset to original name
    setEditMode(false);
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.initialCircle}>
            <Text style={styles.initialText}>
              {getInitials(name)}
            </Text>
          </View>

          <View style={styles.nameRow}>
            {editMode ? (
              <>
                <TextInput
                  value={tempName}
                  onChangeText={setTempName}
                  style={styles.nameInput}
                  autoFocus
                  placeholder="Enter your name"
                  maxLength={50}
                  onSubmitEditing={handleSaveName}
                  editable={!isUpdating}
                />
                <View style={styles.editButtons}>
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#16a34a" style={styles.iconButton} />
                  ) : (
                    <>
                      <TouchableOpacity 
                        onPress={handleSaveName} 
                        style={styles.iconButton}
                        disabled={isUpdating}
                      >
                        <Check size={20} color="#16a34a" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={handleCancelEdit} 
                        style={styles.iconButton}
                        disabled={isUpdating}
                      >
                        <Text style={styles.cancelText}>✕</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.userName} numberOfLines={2}>
                  {name}
                </Text>
                <TouchableOpacity 
                  onPress={() => setEditMode(true)} 
                  style={styles.iconButton}
                >
                  <Pencil size={16} color="#4B5563" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity 
            style={styles.item}
            onPress={() => {
              // Navigate to notifications screen
              // router.push('/notifications');
            }}
          >
            <Text style={styles.itemText}>Notifications</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.item}
            onPress={() => {
              // Navigate to help & support screen
              // router.push('/help-support');
            }}
          >
            <Text style={styles.itemText}>Help & Support</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.item, { borderBottomWidth: 0 }]} 
            onPress={handleLogout}
          >
            <Text style={[styles.itemText, styles.logoutText]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E6F4EA', 
    paddingTop: 30 
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  initialCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  initialText: {
    fontSize: 44,
    color: '#065F46',
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    maxWidth: '90%',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    maxWidth: 200,
  },
  iconButton: {
    padding: 4,
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '700',
    borderBottomWidth: 2,
    borderColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 150,
    maxWidth: 250,
    color: '#111827',
    textAlign: 'center',
  },
  editButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cancelText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  memberSince: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#111827',
  },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#374151',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});