import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as FileSystem from "expo-file-system";

export const SaveUser = async (payload:any) => {
  const accessToken = await  AsyncStorage.getItem("accessToken");
const response = await axios.post(
      'https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/api/User/save-user',
        payload,
        {
          headers: {
                    Authorization: `Bearer ${accessToken}`, 
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    }
export const FindUser = async (payload: any, accessToken: string) => {
  console.log("Finding user with payload:", payload);
  const response = await axios.post(
    `https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/api/User?number=${payload}`,
    {}, // body (empty since you're only passing query params)
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, 
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
};
export const VerifyOtp = async (payload:any) => {

  console.log(payload);
const response = await axios.post(
        'https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/api/Verfication/verify-otp',
        payload,{
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data;
}

export const GetUserDetails = async (token: string) => {  
 const response = await axios.get('https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/api/user/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  }

  
export const getAccessTokenRefreshToken = async (payload:any) => {
  console.log("Saving user with payload:", payload);
const response = await axios.post(
      'https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/api/Verfication/refresh-token',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    }
export const imageUpload = async (fileUri: string) => {
  try {
    const uploadTask = FileSystem.createUploadTask(
      "https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/OrderRequest/UploadImage",
      fileUri,
      {
        uploadType: FileSystem.FileSystemUploadType.MULTIPART, // must be MULTIPART
        httpMethod: "POST",
        fieldName: "file", // key matching IFormFile parameter
        headers: {
          Accept: "application/json",
        },
      },
      (event) => {
        const progress = event.totalBytesExpectedToSend
          ? event.totalBytesSent / event.totalBytesExpectedToSend
          : 0;
        console.log(`Upload progress: ${(progress * 100).toFixed(2)}%`);
      }
    );

    const response:any = await uploadTask.uploadAsync();

    // Parse JSON response from backend
    const responseData = JSON.parse(response.body || "{}");
    console.log("Upload successful:", responseData);

    return responseData.imageUrl; // contains imageUrl if backend returns it
  } catch (err: any) {
    console.log("Upload failed:", err.message || err);
    return null;
  }
};
export const placeOrder = async (payload:any) => {

  console.log(payload);
const response = await axios.post(
        'https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/OrderRequest/create-order',
        payload,{
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data;
};
export const getOrderHistory = async (id:any,pagenumber:any,size:any) => {  
 const response = await axios.get(`https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/OrderRequest/orders?id=${id}&pagenumber=${pagenumber}&size=${size}`, {
      headers: {
        "Content-Type": "application/json"
      },
    });
    return response.data.data;
  }


export const upadateName = async (payload:any) => {  
 const response = await axios.put("https://reappbackend-c4cuaygbgehpdvfm.centralindia-01.azurewebsites.net/api/User/UpdateUserName",payload, {
      headers: {
        "Content-Type": "application/json"
      },
    });
    return response.data;
  }