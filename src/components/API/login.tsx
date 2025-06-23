import axios from 'axios';
import React, { ReactNode } from 'react';
import { StoreData } from '../StoreData';

export const LoginContext = React.createContext({});

interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider = ({ children }: LoginProviderProps) => {

    const userLogin = async (email : string, password : string) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const response = await axios.post(`${apiUrl}/login/user-login`, 
                {
                    email: email,
                    password: password,
                },
                { withCredentials: true }
            );
            sessionStorage.setItem("CSRFToken", response.data.csrfToken);
            sessionStorage.setItem("WebSocketKey", response.data.key);
            StoreData(response.data.jwt, response.data.userData);
            return response;

        } catch (error) {
            return error;
        }
    }

    const sendEmail = async (email : string, username: string | null = null) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const url = username != null ? `${apiUrl}/login/send-otp/new-${username}` : `${apiUrl}/login/send-otp`;
            const response = await axios.post(url,
                {
                    email: email,
                },
                {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            
            return response;

        } catch (error) {
            return error;
        }
    }

    const changePassword = async (email : string, password : string) => {
        const token = sessionStorage.getItem("resetPasswordToken");
        try {
          const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
          const response = await axios.put(`${apiUrl}/login/reset-password`,
              {
                  email: email,
                  authCode: password,
              },
              {
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              }
          });

          return response;

        } catch (error) {
            return error;
        }
    }

    const validateOTP = async (email : string, otp : string) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const response = await axios.post(`${apiUrl}/login/validate-otp`,
                {
                    email: email,
                    authCode: otp,
                },
                {
                headers: {
                    "Content-Type": "application/json",
                }
            });

            return response;

        } catch (error) {
            return error;
        }
    }

    const createNewUser = async (data : any) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const response = await axios.post(`${apiUrl}/login/create-new-user`, data, {
                headers: {
                    "Content-Type": "multipart/form-data", // Ensure proper content type for form data
                },
            });

            return response;

        } catch (error) {
            return error;
        }
    }

  return (
	<LoginContext.Provider value={{ userLogin, sendEmail, changePassword, validateOTP, createNewUser }}>
	  {children}
	</LoginContext.Provider>
  );
};