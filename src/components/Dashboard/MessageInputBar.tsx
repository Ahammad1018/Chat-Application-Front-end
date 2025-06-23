import * as React from "react";
import { AttachFileRounded, CloseRounded, DeleteOutlineRounded, DeleteRounded, DoNotDisturbRounded, EmojiEmotionsOutlined, HeadsetRounded, InsertDriveFileRounded, MicRounded, PlayArrowRounded, PlayDisabledRounded, RadioButtonCheckedRounded, ReplyRounded, SendRounded, SentimentSatisfiedRounded, StopRounded, UploadFileRounded, VideocamRounded } from "@mui/icons-material";
import { Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Popover, TextField, Tooltip, Typography } from "@mui/material";
import EmojiPicker from "emoji-picker-react";
import { sendMessage } from "../API/WebSocket";
import { ConversationContext } from "../API/Conversation";

export const getLocalISODateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // offset in ms
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, -1);
    return localISOTime;
};

const MessageInputBar = (
        { messagesData, setMessagesData, isReply, replyData, setIsReply, setReplyData, selecteduser, userDetails, handleShowSnackbar, stompClientRef, setUserDataState, conversationData, selectedMsgsState, setSelectedMsgsState, selectedMsg, setDeleteDialog } :
        { messagesData : any , setMessagesData : any , isReply : any , replyData : any , setIsReply : any , setReplyData : any, selecteduser : any, userDetails : any, handleShowSnackbar : any, stompClientRef : any, setUserDataState : any, conversationData : any, selectedMsgsState : any, setSelectedMsgsState : any, selectedMsg : any, setDeleteDialog : any }
    ) => {

    const { uploadFile } = React.useContext<any>(ConversationContext);
    const [emojiAnchorEl, setEmojiAnchorEl] = React.useState<any>(null);
    const [messageState, setMessageState] = React.useState<{
        message : String,
        messageLength : any,
        messageType : String,
        fileAnchorEl : any,
        files : File[],
        filesCaption : String,
        filesSendButton : boolean
    }>({
        message : "",
        messageLength : 0,
        messageType : "text",
        fileAnchorEl : null,
        files : [],
        filesCaption : "",
        filesSendButton : false
    });

    const mediaRecorderRef = React.useRef<any>(null);
    const audioChunksRef = React.useRef<any>([]);
    const streamRef = React.useRef<any>(null);
    const textFieldRef = React.useRef<any>(null);
    const [recordingState, setRecordingState] = React.useState<{
        isRecording : boolean,
        timer : number,
        playRecording : boolean
    }>({
        isRecording : false,
        timer : 0,
        playRecording : false
    });

    React.useEffect(() => {
        if (recordingState.isRecording){
            const interval = setInterval(() => {
            setRecordingState(prev => ({
                ...prev,
                timer : prev.timer + 1
            }));
            }, 1000); // run every 1 second

            return () => clearInterval(interval);
        }
    }, [recordingState.isRecording]);

    const formatTime = (totalSeconds : number) => {
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (e : any) => {
            audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setMessageState(prev => ({
            ...prev,
            files : [...prev.files, new File([audioBlob], "recording.webm", { type: audioBlob.type })]
        }));
        audioChunksRef.current = []; // reset chunks
        };

        mediaRecorderRef.current.start();
        
        setRecordingState((prev) => ({
            ...prev,
            isRecording : true,
        }));
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecordingState((prev) => ({
                ...prev,
                isRecording : false,
                timer : 0
            }));
            setMessageState(prev => ({
                ...prev,
                filesDialog : true
            }));
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track : any) => track.stop());
            streamRef.current = null;
        }
    };

    const handleEmojiClick = (emojiData: any) => {
        if (messageState.files.length > 0){
            setMessageState(prev => ({
                ...prev,
                filesCaption : prev.filesCaption + emojiData.emoji
            }));
        } else {
            setMessageState(prev => ({
                ...prev,
                message : prev.message + emojiData.emoji
            }));
        }
    };
  
    const toggleEmojiPicker = (event: React.MouseEvent<HTMLElement>) => {
        setEmojiAnchorEl(emojiAnchorEl ? null : event.currentTarget);
    };

    const toggleFilePicker = (event: React.MouseEvent<HTMLElement>) => {
        setMessageState(prev => ({
            ...prev,
            fileAnchorEl : prev.fileAnchorEl ? null : event.currentTarget
        }));
    };
  
    const emojiOpen = Boolean(emojiAnchorEl);
    const fileOpen = Boolean(messageState.fileAnchorEl);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleInput = () => {
        const el = textFieldRef.current?.querySelector('textarea');
        if (el) {
            const lineHeight = parseInt(getComputedStyle(el).lineHeight);
            const lines = Math.round(el.scrollHeight / lineHeight);
            setMessageState(prev => ({
                ...prev,
                messageLength : lines
            }));
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

        if (messageState.files.length < 5){
            const selectedFiles = event.target.files;
            
            if (selectedFiles != null){
                let filesArray = Array.from(selectedFiles);
                const maxSizeInBytes = 10 * 1024 * 1024;
                const isExceedSize = filesArray.some(file => file.size > maxSizeInBytes);
                if (isExceedSize){
                    filesArray = filesArray.filter(file => file.size <= maxSizeInBytes);
                    handleShowSnackbar("Some of your files were over 10MB and have been removed automatically to keep things smooth. 😊");
                }
                const isExceedLength = messageState.files.length + filesArray.length > 5;
                if (isExceedLength){
                    filesArray = filesArray.slice(0, 5);
                    handleShowSnackbar("Files limit reached and Excess files have been removed automatically to keep things smooth. 😊");
                }
                setMessageState(prev => ({
                    ...prev,
                    files : [...prev.files, ...filesArray],
                }))
            }
        } else {
            handleShowSnackbar("Looks like you’ve reached the 5-file limit! 😊 Just remove one to add another.");
        }
        setMessageState(prev => ({
            ...prev,
            fileAnchorEl : null,
            filesDialog : true
        }));
    };

    const sendFileToUpload = async (file : any) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadFile(formData, "single");
        if (res.status == 201) {
            return res.data;
        } else {
            return "Failed";
        }
    };

    // Send a message
    const handleSendMessage = async () => {
        if ((selecteduser.userName == selecteduser.userName1 && selecteduser.blockedByUser2) || (selecteduser.userName == selecteduser.userName2 && selecteduser.blockedByUser1)) {
            handleShowSnackbar("Oops! You’ve blocked this user. Unblock to keep the conversation going!");
            return;
        } else if (messageState.message.length == 0 && messageState.files.length == 0){
            handleShowSnackbar("Enter a message to send!");
            return;
        }
        
        const data = {
            sender: userDetails.userName,
            senderId: userDetails.id,
            receiver: selecteduser.userName,
            receiverId: (selecteduser.userName == selecteduser.userName1 ? selecteduser.userId1 : selecteduser.userId2) || selecteduser.id,
            message: messageState.message,
            messageType: messageState.messageType,
            status: "Sending",
            createdAt: getLocalISODateTime(),
            file : null as File | null,
            fileName : "" as string | null,
            fileSize : "" as string | null,
            replied : false,
            repliedBy : null,
            repliedMessageId : null,
        };

        if (!(stompClientRef.current && stompClientRef.current.connected)) {
           handleShowSnackbar("Oops! Something went wrong. Please try again later.");
           return;
        }

        if (messageState.files.length > 1 || (messageState.files.length == 1 && messageState.filesCaption.length > 0)) {
            const files = messageState.files;
            const caption = messageState.filesCaption;

            handleCloseMessageState();

            const formData = new FormData();
            const messagesData: any[] = [];

            files.forEach((file, id) => {
                const newData = { ...data };

                formData.append("files", file);

                newData.message = URL.createObjectURL(file);
                newData.messageType = file.type;
                newData.fileName = file.name;
                newData.fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

                if (isReply && id == 0) {
                    newData.replied = true;
                    newData.repliedBy = userDetails.userName;
                    newData.repliedMessageId = replyData.id;
                }
                newData.file = file;
                messagesData.push(newData);
            });

            if (caption.length > 0){
                const captionData = { ...data };
                captionData.message = caption;
                captionData.messageType = "text";
                messagesData.push(captionData);
            }

            setUserDataState((prev : any) => ({
                ...prev,
                conversationData : [...prev.conversationData, ...messagesData],
                conversationsFound : true,
            }));

            const res = await uploadFile(formData, "many");
            if (res.status == 201) {
                const urls = res.data;
                messagesData.forEach((msgData, id) => {
                    if (msgData.messageType != "text"){
                        msgData.message = urls[id];
                    }
                });
                sendMessage(messagesData, stompClientRef);
            } else {
                messagesData.forEach(msgData => {
                    setUserDataState((prev: any) => {
                        const updatedConversationData = prev.conversationData.map((data: any) => {
                            if (data.fileName === msgData.fileName && data.fileSize === msgData.fileSize && !data.id) {
                                return { ...data, status: "Failed" }; // Change only this item
                            }
                            return data; // Keep others unchanged
                        });

                        return {
                            ...prev,
                            conversationData: updatedConversationData,
                            conversationsFound: true,
                        };
                    });
                });
            }

        } else {

            const file = messageState.files[0];
            const isFile = messageState.files.length > 0;

            if (isFile) {
                data.message = URL.createObjectURL(file);
                data.messageType = file.type;
                data.fileName = file.name;
                data.fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
            }

            if (isReply) {
                data.replied = true;
                data.repliedBy = userDetails.userName;
                data.repliedMessageId = replyData.id;
            }

            handleCloseMessageState();

            setUserDataState((prev : any) => ({
                ...prev,
                conversationData : [...prev.conversationData, data],
                conversationsFound : true,
            }));

            let status = true;
            if (isFile) {
                const res = await sendFileToUpload(file);
                if (res != false && res != "Failed") {
                    data.message = res;
                } else {
                    status = false;
                    setUserDataState((prev: any) => {
                        const updatedConversationData = prev.conversationData.map((item : any) => {
                            if (item.fileName === data.fileName && item.fileSize === data.fileSize && !item.id) {
                                return { ...item, status: "Failed" }; // Change only this item
                            }
                            return item; // Keep others unchanged
                        });

                        return {
                            ...prev,
                            conversationData: updatedConversationData,
                            conversationsFound: true,
                        };
                    });
                }
            }

            if (!isFile || (isFile && status)){
                sendMessage([data], stompClientRef);
            }
        }
    };

    const handleCloseMessageState = () => {
        setMessageState({
            message : "",
            messageLength : 0,
            messageType : "text",
            fileAnchorEl : null,
            files : [],
            filesCaption : "",
            filesSendButton : false
        });
                
        setReplyData(null);
        setIsReply(false);
    };


    return (
         <Box
            sx={{
                height: `${
                        (10 + 
                        (messageState.message.length > 0 && messageState.messageLength > 2 ? 
                            ((messageState.messageLength > 10 ? 10 : messageState.messageLength) * 2.5) 
                            : 
                            0))
                        }%`,
                width: "99%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "start",
                marginTop : "5px",
            }}>
            
            <Box 
                sx={{
                    width: "80%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position : "relative",
            }}>

                <Popover
                    open={emojiOpen}
                    anchorEl={emojiAnchorEl}
                    onClose={() => setEmojiAnchorEl(null)}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Popover>
                
                <Popover
                    open={fileOpen}
                    anchorEl={messageState.fileAnchorEl}
                    onClose={() => {
                        setMessageState(prev => ({
                            ...prev,
                            fileAnchorEl : null
                        }))
                    }}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    sx={{
                        '& .MuiPopover-paper': {
                            backgroundColor: '#f5f5f5',
                            borderRadius: '10px',
                            padding: '10px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            width: '150px',
                            height: '50px',
                        },
                    }}
                    >
                    <Box 
                        sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <ButtonBase
                            onClick={handleClick}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "start",
                                width: "100%",
                                height: "100%",
                                fontSize: "15px",
                            }}>
                            <UploadFileRounded
                                sx={{
                                    marginRight : "13px"
                                }}
                            /> 
                            Upload File
                        </ButtonBase>
                    </Box>
                </Popover>

                <TextField
                    variant="outlined"
                    placeholder={((selecteduser.userName == selecteduser.userName1 && selecteduser.blockedByUser2) || (selecteduser.userName == selecteduser.userName2 && selecteduser.blockedByUser1)) ? "You’ve blocked this User, so messaging is disabled. Unblock them to start chatting again." : selectedMsgsState.msgLength ? "" : "Message"}
                    disabled={selectedMsgsState.msgLength}
                    value={messageState.message}
                    ref={textFieldRef}
                    onInput={handleInput}
                    onChange={(e) => {
                        setMessageState(prev => ({
                            ...prev,
                            message : e.target.value
                        })
                    )}}
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key == "Enter"){
                            handleSendMessage();
                        }
                    }}
                    multiline
                    minRows={1}
                    maxRows={10}
                    sx={{
                        width: "91%",
                        borderRadius: "20px",
                        pointerEvents : ((selecteduser.userName == selecteduser.userName1 && selecteduser.blockedByUser2) || (selecteduser.userName == selecteduser.userName2 && selecteduser.blockedByUser1)) ? "none" : "",
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                        },
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#f5f5f5', // optional: to show it's still there
                            borderRadius: '20px',
                            fontStyle : ((selecteduser.userName == selecteduser.userName1 && selecteduser.blockedByUser2) || (selecteduser.userName == selecteduser.userName2 && selecteduser.blockedByUser1)) ? "oblique" : ""
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                          !((selecteduser.userName == selecteduser.userName1 && selecteduser.blockedByUser2) || (selecteduser.userName == selecteduser.userName2 && selecteduser.blockedByUser1)) && 
                            <InputAdornment position="start">
                            {selectedMsgsState.msgLength ?
                                <>
                                    <IconButton
                                        onClick={() => setSelectedMsgsState((prev : any) => ({
                                            ...prev,
                                            clearMsgs : true
                                        }))}
                                    >
                                        <CloseRounded
                                            sx={{
                                                fontSize : "30px"
                                            }}
                                        />
                                    </IconButton>
                                    <Typography
                                        fontSize={18}
                                    >
                                        Selected Messages {selectedMsg.size}
                                    </Typography>
                                </>
                                :
                                <IconButton onClick={(e) => toggleEmojiPicker(e)}>
                                    <SentimentSatisfiedRounded />
                                </IconButton>
                            }
                          </InputAdornment>
                        ),
                        endAdornment: (
                        !((selecteduser.userName == selecteduser.userName1 && selecteduser.blockedByUser2) || (selecteduser.userName == selecteduser.userName2 && selecteduser.blockedByUser1)) && 
                          <InputAdornment position="end">

                            {selectedMsgsState.msgLength ? 
                                <IconButton
                                    onClick={() => {
                                        setSelectedMsgsState((prev : any) => ({
                                            ...prev,
                                            forwardMsgs : true
                                        }))
                                    }}
                                >
                                    <ReplyRounded
                                        sx={{
                                            fontSize : "30px",
                                            transform : "scaleX(-1)"
                                        }}
                                    />
                                </IconButton>
                                :
                            !recordingState.isRecording ?
                                <IconButton onClick={(e) => {toggleFilePicker(e)}}>
                                    <AttachFileRounded />
                                </IconButton>
                                :
                                
                                <Typography
                                    sx={{
                                        display : "flex",
                                        alignItems : "center"
                                    }}
                                >
                                    <RadioButtonCheckedRounded
                                        color="error"
                                        sx={{
                                            fontSize : "16px",
                                            marginRight : "5px",
                                            opacity: recordingState.isRecording && recordingState.timer % 2 == 0 ? 1 : 0.3,
                                            transition: "opacity 1s",
                                        }}
                                    />
                                    {formatTime(recordingState.timer)}
                                </Typography>
                            }
                          </InputAdornment>
                        ),
                }}/>

                <Box
                    sx={{
                        width : "65px",
                        background : "white",
                        height : "65px",
                        borderRadius : "50%",
                        display : "flex",
                        alignItems : "center",
                        justifyContent : "center"
                    }}
                >
                {((selecteduser.userName == selecteduser.userName1 && selecteduser.blockedByUser2) || (selecteduser.userName == selecteduser.userName2 && selecteduser.blockedByUser1)) ?
                    <DoNotDisturbRounded
                        sx={{
                            fontSize : "30px",
                            color : "grey"
                        }}
                    />
                    :
                    <IconButton
                        sx={{
                            width : "100%",
                            height : "100%"
                        }}
                    >
                        {selectedMsgsState.msgLength ? 
                            <DeleteRounded
                                onClick={() => setDeleteDialog(true)}
                                sx={{
                                    fontSize : "30px",
                                    color : "red"
                                }}
                            />
                            :
                        recordingState.isRecording ?
                            <StopRounded
                                sx={{
                                    fontSize : "30px",
                                    color : "red"
                                }}
                                onClick={stopRecording}
                            />
                            :
                        messageState.message.length > 0 ?
                            <SendRounded
                                sx={{
                                    fontSize : "30px",
                                    marginLeft : "5px",
                                }}
                                onClick={handleSendMessage}
                            />
                            :
                          <MicRounded
                                sx={{
                                    fontSize : "30px",
                                }}
                                onClick={startRecording}
                            />
                        }
                    </IconButton>
                }
                </Box>
                
                {isReply && <Box 
                    sx={{
                        position : "absolute",
                        height : "80%",
                        width : "91%",
                        display : "flex",
                        alignItems : "center",
                        justifyContent : "space-around",
                        top : "-56%",
                        background : "#f5f5f5",
                        borderRadius : "10px 10px 0 0",
                        visibility : isReply ? "visible" : "hidden",
                        zIndex : "100",
                        border : "solid 1px lightgrey",
                        borderBottom : "none",
                    }}
                >
                    <ReplyRounded 
                        color="action"
                        sx={{
                            fontSize : "30px",
                            margin : "0 5px"
                        }}
                    />
                    <Box
                        sx={{
                            width : "85%",
                            height : "85%",
                            background : "#afafaf",
                            borderRadius : "5px",
                            display : "flex",
                            alignItems : "center",
                            justifyContent : "start",
                            border : "solid 1px #afafaf",
                            borderLeft : "5px solid #5a5a5a",
                            overflow : "hidden"
                        }}
                    >
                        {replyData.messageType.startsWith("image") ?
                            <img src={replyData.message} alt="image" height="100%" /> 
                                :
                        replyData.messageType == "file" ?
                            <InsertDriveFileRounded 
                                color="action" 
                                sx={{ 
                                    fontSize : "30px" 
                                }} 
                            />
                            :
                        replyData.messageType.startsWith("audio") ?
                            <HeadsetRounded
                                color="action" 
                                sx={{ 
                                    fontSize : "30px" 
                                }}
                            />
                            :
                        replyData.messageType.startsWith("video") ?
                            <VideocamRounded
                                color="action" 
                                sx={{ 
                                    fontSize : "30px" 
                                }}
                            />
                            :
                            null
                        }
                        <Typography 
                            color="textSecondary"
                            sx={{
                                maxWidth : "95%",
                                marginLeft : "10px",
                                lineHeight : "1.3",
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <strong>
                                {replyData.sender == userDetails.userName ? "You" : replyData.sender}
                            </strong>
                            <br/>
                            <span style={{ fontSize : "14px" }}>
                                {replyData.messageType.startsWith("image") ? 
                                    "Photo" : 
                                replyData.messageType == "text" ? 
                                    replyData.message
                                    :
                                    replyData.fileName
                                }
                            </span>
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={()=>{
                            setIsReply(false),
                            setReplyData(null)
                        }}
                    >
                        <CloseRounded
                            color="action"
                            sx={{
                                fontSize : "30px"
                            }}
                        />
                    </IconButton>
                </Box>}
            </Box>

            <Dialog
                open={messageState.files.length > 0}
            >
                <DialogTitle
                    sx={{
                        background : "#212121",
                        color : "white",
                        display : "flex",
                        alignItems : "center",
                        justifyContent : "start"
                    }}
                >
                    <IconButton
                        onClick={() => {
                            handleCloseMessageState();
                            setRecordingState({
                                isRecording : false,
                                timer : 0,
                                playRecording : false
                            });
                        }}
                    >
                        <CloseRounded
                            sx={{
                                color : "white",
                                fontSize : "30px",
                                marginRight : "10px"
                            }}
                        />
                    </IconButton>
                    Send {messageState.files.length} Files
                </DialogTitle>
                    <DialogContent
                        sx={{
                            display : "flex",
                            flexDirection : "column",
                            alignItems : "center",
                            justifyContent : "space-around",
                            width : "30rem",
                            background : "#212121"
                        }}
                    >
                        {messageState.files.map((file, id) => {
                            return(
                            <Box
                                key={id}
                                sx={{
                                    position : "relative",
                                    display : "flex",
                                    alignItems : "center",
                                    justifyContent : "start",
                                    borderRadius : "10px",
                                    margin : "10px 0",
                                    width : "99%"
                                }}
                            >
                                {
                                    <Box
                                        sx={{
                                            width : "15%",
                                            display : "flex",
                                            alignItems : "center",
                                            justifyContent : "center",
                                            marginRight : "10px"
                                        }}
                                    >
                                        {file.type.startsWith("image") ?
                                            <img
                                                className="rounded-[10px]"
                                                src={URL.createObjectURL(file)}
                                                width="60px"
                                                height="60px"
                                            />
                                            :
                                        file.type.startsWith("audio") ?
                                            <HeadsetRounded
                                                fontSize="large"
                                                sx={{
                                                    color : "white"
                                                }}
                                            />
                                            :
                                        file.type.startsWith("video") ? 
                                            <video 
                                                width="60" 
                                                height="60"
                                                autoPlay
                                                autoFocus
                                                muted
                                                style={{
                                                    borderRadius : "10px",
                                                    objectFit : "fill",
                                                }}
                                            >
                                                <source src={URL.createObjectURL(file)} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                            :
                                        <InsertDriveFileRounded
                                            fontSize="large"
                                            sx={{
                                                color : "white"
                                            }}
                                        />
                                        }
                                    </Box>
                                }

                            <Box
                                sx={{
                                    width : "73%",
                                    display : "flex",
                                    flexDirection : "column",
                                    alignItems : "start",
                                    justifyContent : "space-around",
                                    color : "white"
                                }}
                            >
                                <Typography
                                    sx={{
                                        width : "100%",
                                        overflow : "hidden",
                                        textOverflow : "ellipsis",
                                        whiteSpace : "nowrap",
                                        display : "flex",
                                        alignItems : "center",
                                        justifyContent : "start"
                                    }}
                                >
                                    <audio
                                        autoPlay={file.type.startsWith("audio") && file.name.endsWith(".webm") && recordingState.playRecording}
                                        style={{ display: "none" }}
                                        src={URL.createObjectURL(file)}
                                        onEnded={() => 
                                            setRecordingState(prev => ({
                                                ...prev,
                                                playRecording : !prev.playRecording
                                            }))
                                        }
                                    >
                                        Your browser does not support the audio element.
                                    </audio>
                                    {file.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize : "13px",
                                        color : "grey"
                                    }}
                                >
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </Typography>
                            </Box>
                                {file.type.startsWith("audio") && file.name.endsWith(".webm") &&
                                <Tooltip title={recordingState.playRecording ? "Stop playing" : "Play Recording"} arrow>
                                <IconButton
                                    onClick={() => {
                                        setRecordingState(prev => ({
                                            ...prev,
                                            playRecording : !prev.playRecording
                                        }));
                                    }}
                                >
                                    {!recordingState.playRecording ? 
                                        <PlayArrowRounded
                                            sx={{
                                                color : "white",
                                                fontSize : "25px"
                                            }}
                                        />
                                    :
                                        <PlayDisabledRounded
                                            sx={{
                                                color : "white",
                                                fontSize : "25px"
                                            }}
                                        />
                                    }
                                </IconButton>
                                </Tooltip>}
                                <IconButton
                                    sx={{
                                        marginLeft : "3%"
                                    }}
                                    onClick={() => {
                                        setMessageState(prev => ({
                                            ...prev,
                                            files : prev.files.filter(subFile => subFile != file),
                                        }));
                                        setRecordingState({
                                            isRecording : false,
                                            timer : 0,
                                            playRecording : false
                                        });
                                    }}
                                >
                                    <DeleteOutlineRounded
                                        sx={{
                                            color : "white",
                                            fontSize : "25px"
                                        }}
                                    />
                                </IconButton>
                            </Box>
                        )})}
                    </DialogContent>
                    <DialogActions
                        sx={{
                            background : "#212121",
                            borderTop : "solid 1.5px rgb(61, 61, 61)"
                        }}
                    >
                        <TextField
                            placeholder="Add a caption..."
                            variant="standard"
                            value={messageState.filesCaption}
                            onChange={(e) => {
                                setMessageState(prev => ({
                                    ...prev,
                                    filesCaption : e.target.value
                                }));
                                setRecordingState({
                                    isRecording : false,
                                    timer : 0,
                                    playRecording : false
                                });
                            }}
                            sx={{
                                width : "75%",
                                height : "50px",
                                
                                '& .MuiInput-underline:before': {
                                    borderBottom: 'none',
                                },
                                '& .MuiInput-underline:after': {
                                    borderBottom: 'none',
                                },
                                '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                                    borderBottom: 'none',
                                },
                            }}
                            InputProps={{
                                startAdornment : (
                                    <InputAdornment position="start">
                                        <IconButton
                                            onClick={(e) => toggleEmojiPicker(e)}
                                        >
                                            <EmojiEmotionsOutlined
                                                sx={{
                                                    color : "grey"
                                                }}
                                            />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx : {
                                    height : 50,
                                    color : "white",
                                    fontSize : "18px",
                                }
                            }}
                        />
                        <Button
                            variant="outlined"
                            sx={{
                                width : "25%",
                                height : "50px",
                                color : "black",
                                background : "white",
                                fontSize : "15px",
                            }}
                            onClick={() => {
                                setMessageState(prev => ({
                                    ...prev,
                                    filesSendButton : true
                                }));
                                handleSendMessage();
                                setRecordingState({
                                    isRecording : false,
                                    timer : 0,
                                    playRecording : false
                                });
                            }}
                        >
                            Send
                        </Button>
                    </DialogActions>
            </Dialog>
            
         </Box>
    )
}

export default MessageInputBar;