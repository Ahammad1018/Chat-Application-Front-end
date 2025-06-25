import axios from 'axios';
import React, { ReactNode } from 'react';

export const ConversationContext = React.createContext({});

interface ConversationProviderProps {
  children: ReactNode;
}

export const ConversationProvider = ({ children }: ConversationProviderProps) => {

    const getConversations = async (userName : string) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = sessionStorage.getItem("CSRFToken");

            const res = await axios.get(`${apiUrl}/conversation/get-conversations/${userName}`,{
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : `Bearer ${jwt}`,
                    "X-XSRF-TOKEN" : csrf,
                },
                withCredentials: true
            });

            return res;
        } catch (e) {
            return e;
        }
    }

    const uploadFile = async (file : File, type : string) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = sessionStorage.getItem("CSRFToken");

            const url = type == "many" ?
                `${apiUrl}/conversation/upload-many-files/cloudinary`
                :
                `${apiUrl}/conversation/upload-file/cloudinary`;

            const res = await axios.post(url, file, {
                headers : {
                    "Authorization" : `Bearer ${jwt}`,
                    "X-XSRF-TOKEN" : csrf,
                },
                withCredentials: true
            });

            return res;
        } catch (e) {
            return e;
        }
    }

    const removeFile = async (url : string) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = sessionStorage.getItem("CSRFToken");

            const res = await axios.post(`${apiUrl}/conversation/remove-file/cloudinary/${url}`, {}, {
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : `Bearer ${jwt}`,
                    "X-XSRF-TOKEN" : csrf,
                },
                withCredentials: true
            });

            return res;
        } catch (e) {
            return e;
        }
    }

    const deleteMessage = async (everyone : boolean, userName : string, id : string) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = sessionStorage.getItem("CSRFToken");

            const res = await axios.delete(`${apiUrl}/conversation/delete/message/${everyone}/${userName}/${id}`, {
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : `Bearer ${jwt}`,
                    "X-XSRF-TOKEN" : csrf,
                },
                withCredentials: true
            });

            return res;
        } catch (e) {
            return e;
        }
    }

    const deleteManyMessage = async (everyone : boolean, userName : string, ids : any[]) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = sessionStorage.getItem("CSRFToken");
            
            const res = await axios.delete(`${apiUrl}/conversation/delete/messages/${everyone}/${userName}`, {
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : `Bearer ${jwt}`,
                    "X-XSRF-TOKEN" : csrf,
                },
                withCredentials: true,
                data : ids
            });

            return res;
        } catch (e) {
            return e;
        }
    }

    const clearUserChat = async (userName : string) => {
        try {
             const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = sessionStorage.getItem("CSRFToken");
            
            const res = await axios.post(`${apiUrl}/conversation/clear-chat/${userName}`,{}, {
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : `Bearer ${jwt}`,
                    "X-XSRF-TOKEN" : csrf,
                },
                withCredentials: true,
            });

            return res;
        } catch (e) {
            return e;
        } 
    }

    return (
        <ConversationContext.Provider value={{ getConversations, uploadFile, removeFile, deleteMessage, deleteManyMessage, clearUserChat }}>
            {children}
        </ConversationContext.Provider>
    );
};