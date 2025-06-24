import axios from 'axios';
import React, { ReactNode } from 'react';

export const ConnectionContext = React.createContext({});

interface ConnectionProviderProps {
  children: ReactNode;
}

export const ConnectionProvider = ({ children }: ConnectionProviderProps) => {

    function getCsrfToken() {
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        return csrfToken;
    }

    const getConnections = async () => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = getCsrfToken();

            console.log(apiUrl);
            console.log(jwt);
            console.log(csrf);

            const res = await axios.get(`${apiUrl}/connection/get-connections`,{
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

    const getSearchedusers = async (searched : any) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = getCsrfToken();

            const res = await axios.get(`${apiUrl}/connection/get-searched-users/${searched}`,{
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

    const chatOpened = async (userName : string, prevUserName : string, unReadMsgCount : String) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = getCsrfToken();

            const res = await axios.post(`${apiUrl}/connection/change/chat-opened-status/${userName}`, 
                {
                 prevUserName : prevUserName,
                 unReadMsgCount : unReadMsgCount
            }, {
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

    const closeChat = async (userName : string) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = getCsrfToken();

            const res = await axios.post(`${apiUrl}/connection/close-chat/${userName}`, {}, {
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

    const deleteUserConnection = async (userName : string, status : boolean) => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
            const jwt = sessionStorage.getItem("AuthToken");
            const csrf = getCsrfToken();

            const res = await axios.post(`${apiUrl}/connection/delete-user-connection/${userName}/block=${status}`, {}, {
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

    return (
        <ConnectionContext.Provider value={{ getConnections, getSearchedusers, chatOpened, deleteUserConnection,closeChat }}>
            {children}
        </ConnectionContext.Provider>
    );
};