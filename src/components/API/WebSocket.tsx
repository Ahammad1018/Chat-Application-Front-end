import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

const getKey = () => {
  const key = sessionStorage.getItem("WebSocketKey");
  return key;
}

export const connectWebSocket = (
    username: string,
    handleMessageRecieved: (message: any) => void,
    stompClientRef : any
  ): any => {
    const sockerURL = `http://localhost:8080/chat-app/ws-chat?sender=${username}&key=${getKey()}`;
    const socket = new SockJS(sockerURL);
    const stompClient = new Client({
      webSocketFactory: () => socket as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.info('✅ WebSocket connected');

        // Optionally send an initial connection message to the server
        const joinMessage = { type: 'join', sender: username };
        stompClient.publish({
          destination: '/app/save-conversations',
          body: JSON.stringify(joinMessage),
        });

        // Subscribe to private messages for the current user
        stompClient.subscribe(`/user/${username}/queue/messages`, (message: IMessage) => {
          const response = JSON.parse(message.body) as IMessage;
          handleMessageRecieved(response);
        });
      },
        onStompError: (frame) => {
          console.warn('❌ STOMP error:', frame);
        },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return stompClient;
  };

  // Send message to the backend /save-conversations endpoint
export const sendMessage = (messageObj: any, stompClientRef : any): boolean => {
  console.log(JSON.stringify(messageObj).length);
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: '/app/save-conversations',  // Spring's @MessageMapping
        body: JSON.stringify(messageObj),
      });
      return true;
    } else {
      console.warn('⚠️ WebSocket is not connected');
      return false;
    }
  };

  // Disconnect WebSocket
export const disconnectWebSocket = (stompClientRef : any): void => {
  if (stompClientRef.current) {
    stompClientRef.current.deactivate();
    stompClientRef.current = null;
  }
};