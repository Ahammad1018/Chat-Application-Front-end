import axios from 'axios';
import React, { ReactNode } from 'react';
import { getCsrfToken } from '../StoreData';

export const UserContext = React.createContext({});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {

    const changeUserStatus = async (status : string) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = getCsrfToken();

            const response = await axios.post(`${apiUrl}/user/change/status/${status}`,
              {},
              {
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : `Bearer ${jwt}`,
                    "X-XSRF-TOKEN" : csrf,
                },
                withCredentials: true
            });

            return response;
        } catch (error) {
            return error;
        }
    }

    const changeUserPassword = async (oldPassword: string, newPassword: string) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = getCsrfToken();

            const response = await axios.post(`${apiUrl}/user/change-password`,
              { oldPassword, newPassword },
              {
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : `Bearer ${jwt}`,
                    "X-XSRF-TOKEN" : csrf,
                },
                withCredentials: true
            });

            return response;
        } catch (error) {
            return error;
        }
    }

    const updateProfilePicture = async (formData: FormData) => {
      try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = getCsrfToken();

            const response = await axios.post(`${apiUrl}/user/update-profile-picture/cloudinary`,
              formData,
              {
                headers : {
                    "Content-Type": "multipart/form-data",
                    "Authorization" : `Bearer ${jwt}`,
                    "X-XSRF-TOKEN" : csrf,
                },
                withCredentials: true
            });

            return response;
        } catch (error) {
            return error;
        }
    }

    const inviteNewUser = async (inviteLink : string, email : string) => {
      try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = getCsrfToken();

            const response = await axios.post(`${apiUrl}/user/invite/new-user`,
              { email, inviteLink },
              {
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : `Bearer ${jwt}`,
                    "X-XSRF-TOKEN" : csrf,
                },
                withCredentials: true
            });

            return response;
        } catch (error) {
            return error;
        }
    }


    const manageUserBlockState = async (state : boolean, userName : string) => {
      try {
        const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
        const jwt = sessionStorage.getItem("AuthToken");
        const csrf = getCsrfToken();

        const response = await axios.post(`${apiUrl}/user/block-user/${state}/${userName}`,
          {},
          {
            headers : {
                "Content-Type": "application/json",
                "Authorization" : `Bearer ${jwt}`,
                "X-XSRF-TOKEN" : csrf,
            },
            withCredentials: true
        });

        return response;
      } catch (e) {
        return e;
      }
    }

  return (
    <UserContext.Provider value={{ changeUserStatus, changeUserPassword, updateProfilePicture, inviteNewUser, manageUserBlockState }}>
      {children}
    </UserContext.Provider>
  );
};