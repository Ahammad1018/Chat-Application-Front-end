import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import ChatPage from "./ChatPage";
import Profiles from "./Profiles";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { CloseRounded } from "@mui/icons-material";
import React from "react";
import { ConversationContext } from "../API/Conversation";
import { connectWebSocket, disconnectWebSocket } from "../API/WebSocket";
import { UserContext } from "../API/Users";
import { Client } from '@stomp/stompjs';
import { ConnectionContext } from "../API/Connection";
import { ActiveTab } from "../ActiveTab";

const Dashboard = () => {

    const theme = useTheme();
    const isTabActive = ActiveTab();
    const { getConversations } = React.useContext<any>(ConversationContext);
    const { changeUserStatus } = React.useContext<any>(UserContext);
    const { getConnections } = React.useContext<any>(ConnectionContext);
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const userDataStr = sessionStorage.getItem("UserData");
    const [userDetails, setUserDetails] = React.useState(userDataStr ? JSON.parse(userDataStr) : null);
    const stompClientRef = React.useRef<Client | null>(null);
    const [userDataState, setUserDataState] = React.useState<{
      selectedUser : any,
      conversationData : any[],
      conversationsFound : boolean,
      usersData : any[],
      searchedData : string,
      connectionsData : any[],
      onSearch : boolean,
      fetchSearch : boolean,
    }>({
      selectedUser : null,
      conversationData : [],
      conversationsFound : false,
      usersData : [],
      searchedData : "",
      connectionsData : [],
      onSearch : false,
      fetchSearch : false,
    });

    const handleShowSnackbar = React.useCallback((message : any) => {
      enqueueSnackbar(message, { 
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      action: (key : any) => (
          <IconButton
              onClick={() => closeSnackbar(key)}
          >
              <CloseRounded sx={{color : "grey"}} />
          </IconButton>
      ),
      });
    }, [enqueueSnackbar, closeSnackbar]);

    const getUserConversations = async (userName : string) => {
      const res = await getConversations(userName);
      if (res.status == 200 || res.status == 204) {
        const dataLengthStr = sessionStorage.getItem("MessagesData_Length");
        const dataLength = dataLengthStr ? JSON.parse(dataLengthStr) : 0;
        setUserDataState((prev) => ({
          ...prev,
          conversationData : res.status == 200 ? res.data : [],
          conversationsFound : res.status == 204,
        }));

        if (res.status == 200) {
          let unreadMsgIndex = -1;

          const unreadMsg = res.data.find((data: any, index: number) => {
            const isUnread = data.receiver === userDetails.userName && data.status !== "Read";
            if (isUnread) unreadMsgIndex = index;
            return isUnread;
          });

          if (unreadMsg){
            const targetMsgId = unreadMsgIndex > 0 ? res.data[unreadMsgIndex - 1].id : unreadMsg.id;
            sessionStorage.setItem("First_Unread_Msg_ID", JSON.stringify(targetMsgId));
          };

          if (res.data.length > 0 && (res.data.length - dataLength) > 0 && res.data[res.data.length - 1].receiver == userDetails.userName) {
            let totalDiff = res.data.length - dataLength;
            const prevDiff = sessionStorage.getItem("Messages_Data_Difference");
            totalDiff += prevDiff ? JSON.parse(prevDiff) : 0;
            sessionStorage.setItem("Messages_Data_Difference", JSON.stringify(totalDiff));
          } else {
            sessionStorage.removeItem("Messages_Data_Difference");
          }
        }

      } else {
        handleShowSnackbar("Unable to retrieve messages at the moment. Please try again later.");
      }
    };

    const fetchConnections = async () => {
        const res = await getConnections();
        if (res.status === 200 || res.status == 204) {
          const connection = res.status === 200 && userDataState.selectedUser && res.data ? res.data.find((data : any) => data.userName == userDataState.selectedUser.userName) : null;
          const isDeleted = connection ? (connection.userName1 == userDetails.userName && connection.connectionDeletedByUser1) || (connection.userName2 == userDetails.userName && connection.connectionDeletedByUser2) : false;

          setUserDataState(prev => ({
              ...prev,
              connectionsData : res.status === 200 ? res.data : [],
              usersData : res.status === 200 ? res.data : [],
              selectedUser : prev.selectedUser == "None" ? null : isDeleted && connection ? connection : prev.selectedUser,
          }));
        }
    };

    React.useEffect(() => {
      const changeStatus = async () => {
        await changeUserStatus(isTabActive ? "online" : "offline");
      };

      const changeChatOpenedStatus = async () => {
        // await 
      }

      if (stompClientRef.current){
          changeStatus();
          if (userDataState.selectedUser) {
            changeChatOpenedStatus();
          }
      }

    }, [isTabActive]);

    React.useEffect(() => {
      if (userDataState.selectedUser){
        const isDeleted = (userDataState.selectedUser.userName1 == userDetails.userName && userDataState.selectedUser.connectionDeletedByUser1) || (userDataState.selectedUser.userName2 == userDetails.userName && userDataState.selectedUser.connectionDeletedByUser2);
        if (!isDeleted){
          fetchConnections();
          getUserConversations(userDataState.selectedUser.userName);
        }
      }
    },[userDataState.selectedUser]);

    const handleMessageRecieved = (response : any) => {
      const userName = response[0].userName;
      const connection = response[0].connection;
      const conversation = response[0].conversation;
      const statusCode = response[0].statusCode;
      // const responseType = response[0].responseType;
      console.log("Message Received: ", response);
      connection.userName = userName;
      console.log(response);
      if (statusCode == 200 || statusCode == 201) {
        if (conversation == null){
          setUserDataState(prev => ({
            ...prev,
            selectedUser : connection
          }));
        }
        getUserConversations(connection.userName);
        fetchConnections();
      } else if (statusCode == 400 || !(stompClientRef.current && stompClientRef.current.connected)) {
        setUserDataState(prev => {
          const newConversations = [...prev.conversationData]; // copy the array
          const lastIndex = newConversations.length - 1;

          if (lastIndex >= 0) {
            // copy the last conversation object and update status
            newConversations[lastIndex] = {
              ...newConversations[lastIndex],
              status: "Failed"
            };
          }

          return {
            ...prev,
            conversationData: newConversations,
            conversationsFound: true
          };
        });

      }
    }

    React.useEffect(() => {
      connectWebSocket(
        userDetails.userName,
        handleMessageRecieved,
        stompClientRef,
      );

      fetchConnections();

      return () => {
        disconnectWebSocket(stompClientRef); // Cleanup and disconnect when component unmounts
      };
    }, []);


  return (
    <Box className="h-full w-full flex flex-row justify-center items-center">
      {((isSmallScreen && !userDataState.selectedUser) || (!isSmallScreen)) &&
        <Box
          sx={{
              width: isSmallScreen ? "100%" : "25%",
              height: "100%",
              backgroundColor: "#212121",
          }}
        >
            
          <Profiles 
            userDetails={userDetails}
            handleShowSnackbar={handleShowSnackbar}
            userDataState={userDataState}
            setUserDetails={setUserDetails}
            setUserDataState={setUserDataState}
            selectedUser={userDataState.selectedUser}
            changeUserStatus={changeUserStatus}
            stompClientRef={stompClientRef}
            isSmallScreen={isSmallScreen}
          />
        </Box>
      }

      {/* Box 2: Hidden on small screens */}
      {(!isSmallScreen || userDataState.selectedUser) && (
        <Box 
            width={!isSmallScreen ? "75%" : "100%"}
            sx={{
                height: "100%",
                backgroundColor: "linear-gradient(to right, rgba(192,212,219,255), rgba(202,217,212,255))",
            }}>
            
            {userDataState.selectedUser && 
              <ChatPage
                selecteduser={userDataState.selectedUser}
                conversationData={userDataState.conversationData}
                userDetails={userDetails}
                handleShowSnackbar={handleShowSnackbar}
                stompClientRef={stompClientRef}
                setUserDataState={setUserDataState}
                userDataState={userDataState}
                isSmallScreen={isSmallScreen}
                fetchConnections={fetchConnections}
              />
            }

        </Box>
      )}
    </Box>
  );
}

export default Dashboard;