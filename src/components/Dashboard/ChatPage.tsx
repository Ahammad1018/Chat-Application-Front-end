import { useEffect, useRef, useState } from "react";
import ChatPageNavBar from "./ChatPageNavBar";
import MessageInputBar from "./MessageInputBar";
import MessageData from "./MessageData";
import { Box, Typography } from "@mui/material";

const ChatPage = ({ selecteduser, conversationData, sendMessage, userDetails, handleShowSnackbar, stompClientRef, setUserDataState, userDataState, isSmallScreen, fetchConnections } : 
            { selecteduser : any, conversationData : any, sendMessage : any, userDetails : any, handleShowSnackbar : any, stompClientRef : any, setUserDataState : any, userDataState : any, isSmallScreen : any, fetchConnections : any }) => {

    const [messagesData, setMessagesData] = useState<any[]>([]);
    const [isReply, setIsReply] = useState(false);
    const [replyData, setReplyData] = useState(null);
    const [selectedMsg, setSelectedMsg] = useState<any>(new Set());
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedMsgsState, setSelectedMsgsState] = useState({
        msgLength : false,
        clearMsgs : false,
        forwardMsgs : false
    });
    const [messageSearchDataState, setMessageSearchDataState] = useState({
        messageData : "",
        messageDate : ""
    });

    useEffect(() => {
        setMessagesData(conversationData);
    }, [conversationData]);

    return (
        <Box
            sx={{
                width: "100%",
                height: "98%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
            }}>

            <ChatPageNavBar 
                messagesData={messagesData} 
                setMessagesData={setMessagesData}
                selecteduser={selecteduser}
                sendMessage={sendMessage}
                conversationData={conversationData}
                setMessageSearchDataState={setMessageSearchDataState}
                handleShowSnackbar={handleShowSnackbar}
                isSmallScreen={isSmallScreen}
                setUserDataState={setUserDataState}
                fetchConnections={fetchConnections}
            />

            {(conversationData.length > 0 && 
                conversationData.filter((data : any) => !(
                    (userDetails.userName == data.sender && data.messageDeletedByUser1) 
                    || 
                    (userDetails.userName == data.receiver && data.messageDeletedByUser2)
                )).length > 0
            ) ?
                <MessageData 
                    conversationData={conversationData}
                    messagesData={messagesData}
                    setIsReply={setIsReply}
                    replyData={replyData} 
                    setReplyData={setReplyData}
                    userDetails={userDetails}
                    handleShowSnackbar={handleShowSnackbar}
                    setUserDataState={setUserDataState}
                    userDataState={userDataState}
                    selecteduser={selecteduser}
                    messageSearchDataState={messageSearchDataState}
                    selectedMsgsState={selectedMsgsState}
                    setSelectedMsgsState={setSelectedMsgsState}
                    selectedMsg={selectedMsg}
                    setSelectedMsg={setSelectedMsg}
                    stompClientRef={stompClientRef}
                    deleteDialog={deleteDialog}
                    setDeleteDialog={setDeleteDialog}
                />
                :
                <Box
                    onContextMenu={(e) => e.preventDefault()}
                    sx={{
                        display : "flex",
                        flexDirection : "column",
                        alignItems : "center",
                        justifyContent : "center"
                    }}
                >
                    <img
                        src="https://res.cloudinary.com/dnabniyug/image/upload/v1748243539/azvgcyxysbpfea1wfecg.gif"
                        alt="conversation-image"
                        draggable={false}
                        style={{
                            mixBlendMode : "multiply",
                            objectFit : "contain",
                            width : "300px",
                            userSelect : "none"
                        }}
                    />
                    <Typography
                        variant="h6"
                        fontWeight={600}
                        color="textDisabled"
                        sx={{
                            textAlign : "center",
                            userSelect : "none"
                        }}
                    >
                        No messages here yet...
                        <br/>
                        <Typography
                            sx={{
                                fontSize : "18px"
                            }}
                        >
                            Send a message and start connecting with {selecteduser.userName} now!
                        </Typography>
                    </Typography>
                </Box>
            }

            <MessageInputBar 
                messagesData={messagesData} 
                setMessagesData={setMessagesData} 
                isReply={isReply} 
                replyData={replyData} 
                setIsReply={setIsReply} 
                setReplyData={setReplyData}
                selecteduser={selecteduser}
                userDetails={userDetails}
                handleShowSnackbar={handleShowSnackbar}
                stompClientRef={stompClientRef}
                setUserDataState={setUserDataState}
                conversationData={conversationData}
                selectedMsgsState={selectedMsgsState}
                setSelectedMsgsState={setSelectedMsgsState}
                selectedMsg={selectedMsg}
                setDeleteDialog={setDeleteDialog}
            />

        </Box>
    );
}

export default ChatPage;