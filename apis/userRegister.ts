import axios from 'axios';

export const SaveUser = async (payload:any) => {
const response = await axios.post(
        'https://recycleappservices.azurewebsites.net/api/User',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    }
export const FindUser = async (payload:any) => {
const response = await axios.post(
        'https://recycleappservices.azurewebsites.net/api/User?number=' + payload,
      );
      return response.data;
    }