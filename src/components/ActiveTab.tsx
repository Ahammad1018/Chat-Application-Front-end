import { useEffect, useState, useRef, useContext } from 'react';
import { ConnectionContext } from './API/Connection';

export const ActiveTab = () => {
  const [isTabActive, setIsTabActive] = useState<boolean>(true); // Initially active
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { closeChat, chatOpened } = useContext<any>(ConnectionContext);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const selecteduser = sessionStorage.getItem("Selected_User");
      if (document.hidden) {
        if (selecteduser){
          closeChat(selecteduser);
        }
        // Start 5-minute timer when user leaves tab
        timeoutRef.current = setTimeout(() => {
          setIsTabActive(false); // Mark as inactive after 5 min
        }, 5 * 60 * 1000); // 5 minutes in ms
      } else {
        // User came back
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current); // Cancel timer
          timeoutRef.current = null;
          chatOpened(selecteduser, "None", "1");
        }
        setIsTabActive(true); // Set active immediately
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return isTabActive;
};
