import React, { useRef } from "react";
import { Avatar, Box, Button, ButtonBase, Card, CardActions, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Link, ListItemIcon, Menu, MenuItem, TextField, Typography } from "@mui/material";
import { AccessTimeRounded, ArrowDownwardRounded, ArrowForwardRounded, CheckCircleOutlineRounded, CheckCircleRounded, CloseRounded, ContentCopyRounded, DeleteRounded, DoneAllRounded, DoneRounded, DownloadRounded, ErrorOutlineRounded, HeadphonesRounded, InsertDriveFileRounded, MicRounded, OfflinePinRounded, PhotoRounded, ReplyRounded, VideocamRounded } from "@mui/icons-material";
import emojiRegex from 'emoji-regex';
import { highlightPart } from "../HighlightPart";
import { ConversationContext } from "../API/Conversation";
import { sendMessage } from "../API/WebSocket";
import { getLocalISODateTime } from "./MessageInputBar";

export const extractTime = (isoString : string) => {
    const date = new Date(isoString);

    const timeString = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
    });

    return timeString;
}

export const formatSmartDate = (dateString: string) => {
    const inputDate = new Date(dateString);
    const now = new Date();

    const isSameDay = inputDate.toDateString() === now.toDateString();
    if (isSameDay) {
        return 'Today';
    }

    // Check if inputDate is yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = inputDate.toDateString() === yesterday.toDateString();
    if (isYesterday) {
        return 'Yesterday';
    }

    // Check if it's within the current week
    const inputDay = inputDate.getDay(); // 0 = Sunday, 1 = Monday...
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    if (inputDate >= startOfWeek && inputDate <= endOfWeek) {
        return dayNames[inputDay];
    }

    // Format for other dates
    const isSameYear = inputDate.getFullYear() === now.getFullYear();

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const fullOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

    return isSameYear
        ? inputDate.toLocaleDateString(undefined, options)
        : inputDate.toLocaleDateString(undefined, fullOptions);
};

const MessageData = (
        { conversationData, messagesData, setIsReply, setReplyData, userDetails, handleShowSnackbar, setUserDataState, selecteduser, userDataState, messageSearchDataState, selectedMsgsState, setSelectedMsgsState, selectedMsg, setSelectedMsg, stompClientRef, deleteDialog, setDeleteDialog } : 
        { conversationData : any, messagesData : any[], setIsReply : any, replyData : any, setReplyData : any, userDetails : any, handleShowSnackbar : any, setUserDataState : any, selecteduser : any, userDataState : any, messageSearchDataState : any, selectedMsgsState : any, setSelectedMsgsState : any, selectedMsg : any, setSelectedMsg : any, stompClientRef : any, deleteDialog : any, setDeleteDialog : any }
    ) => {

    const userName = userDetails.userName;
    const { deleteMessage, deleteManyMessage } = React.useContext<any>(ConversationContext);
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const [clickedMessage, setClickedMessage] = React.useState<any>(null);
    const [highlightScrollColor, setHighlightScrollColor] = React.useState<any>(null);
    const [dateBubble, setDateBubble] = React.useState<boolean>(false);
    const [visibleDate, setVisibleDate] = React.useState<string | null>(null);
    const [msgsContainReceiver, setMsgsContainReceiver] = React.useState<boolean>(false);
    const [arrowState, setArrowState] = React.useState<{
        showDownArrow : boolean,
        dataDiff : boolean,
        dataDiffCount : any
    }>({
        showDownArrow : false,
        dataDiff : false,
        dataDiffCount : 0
    });
    const [forwardState, setForwardState] = React.useState<{
        openDialog : boolean,
        forwardId : Set<Number>,
        forwardData : any[],
        button : false,
    }>({
        openDialog : false,
        forwardId : new Set<Number>(),
        forwardData : [],
        button : false
    });

    const [deleteBtnState, setDeleteBtnState] = React.useState<{
        deleteBtn : boolean,
        deleteEveryoneBtn : boolean,
    }>({
        deleteBtn : false,
        deleteEveryoneBtn : false,
    });

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const cardRef = useRef(null);
    const repliedMessageRefs = useRef<any>({});
    const scrollTimeoutRef = useRef<any>(null);
    const messageDateRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const urlRegex = /(https?:\/\/[^\s]+)/;
    const phoneRegex = /(\+91[\s-]?|0)?[6-9]\d{9}\b/;
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

    const combinedRegex = new RegExp(
        `${urlRegex.source}|${phoneRegex.source}|${emailRegex.source}`,
        "g"
    );

    React.useEffect(() => {
        const box = scrollRef.current;
        if (conversationData){
            sessionStorage.setItem("MessagesData_Length", JSON.stringify(conversationData.length));
        }
        const dataDiffStr = sessionStorage.getItem("Messages_Data_Difference");
        const dataDiff = dataDiffStr ? JSON.parse(dataDiffStr) : null;
        if (arrowState.showDownArrow && dataDiff) {
            setArrowState(prev => ({
                ...prev,
                dataDiff : true,
                dataDiffCount : dataDiff
            }));
            return;
        }

        setTimeout(() => {
            const id = sessionStorage.getItem("First_Unread_Msg_ID");
            const firstUnreadMsgId = id ? JSON.parse(id) : null;
            if (box && firstUnreadMsgId) {
                const unreadElement = box.querySelector(`[data-msg-index="${firstUnreadMsgId}"]`);
                if (unreadElement) {
                    unreadElement.scrollIntoView({ behavior: "instant", block: "start" });
                }
            } else {
                if (box) {
                    box.scrollTop = box.scrollHeight;
                }
            }
        }, 500);
    }, [conversationData, selecteduser]);
    
    React.useEffect(() => {
        if (selectedMsg.size == 0) {
            setSelectedMsgsState((prev : any) => ({
                ...prev,
                msgLength : false
            }));
        } else if (selectedMsgsState.msgLength == false) {
            setSelectedMsgsState((prev : any) => ({
                ...prev,
                msgLength : true
            }));
        }
        setSelectedMsgsState((prev : any) => ({
            ...prev,
            clearMsgs : false
        }))
    }, [selectedMsg]);

    React.useEffect(() => {
        if (selectedMsgsState.clearMsgs){
            setSelectedMsg(new Set());
        }
    }, [selectedMsgsState.clearMsgs]);

    React.useEffect(() => {
        setForwardState(prev => ({
            ...prev,
            openDialog : selectedMsgsState.forwardMsgs
        }));
    }, [selectedMsgsState.forwardMsgs]);

    const isOnlyEmojis = (text: string): boolean => {
        const regex = emojiRegex();
        const trimmed = text.trim();
        const matched = [...trimmed.matchAll(regex)];
      
        // Join all matched emojis and compare with original trimmed string
        const joinedEmojis = matched.map((m) => m[0]).join('');
        return trimmed.length > 0 && joinedEmojis === trimmed;
    };

    const menuItems = [
        clickedMessage && clickedMessage.status != "Failed" && {name : "Reply", Icon : <ReplyRounded />},
        clickedMessage && clickedMessage.status != "Failed" && {name : "Forward", Icon : <ReplyRounded sx={{ transform : "scaleX(-1)" }} />},
        clickedMessage && clickedMessage.status == "Failed" &&  {name : "Resend", Icon : <ArrowForwardRounded />},
        clickedMessage && clickedMessage.messageType == "text" ? 
            {name : "Copy Text", Icon : <ContentCopyRounded />} : 
            {name : "Download", Icon : <DownloadRounded />},
        {name : "Select", Icon : <CheckCircleOutlineRounded />},    
        {name : "Delete", Icon : <DeleteRounded color="error" />},
    ];

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, msg: any) => {
        setClickedMessage(msg);
        setMenuAnchorEl(event.currentTarget);
    };

    const downloadFile = async () => {
        const response = await fetch(clickedMessage.message, { mode: 'cors' });
        const blob = await response.blob();

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = clickedMessage.fileName || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    };

    const handleCopy = () => {
        try {
            navigator.clipboard.writeText(clickedMessage.message)
                .then(() => handleShowSnackbar("Text Copied"))
                .catch((err) => {
                    handleShowSnackbar("Failed to copy Text");
                    console.error("Clipboard error:", err);
                });
        } catch (err) {
            console.error("Clipboard write failed:", err);
        }
    };

    const handleMenuClose = (itemName : string) => {
        if (itemName == "Delete") {
            setDeleteDialog(true);
        } else if (itemName == "Reply") {
            setIsReply(true);
            setReplyData(clickedMessage);
        } else if (itemName == "Copy Text") {
            handleCopy()
        } else if (itemName == "Download") {
            downloadFile();
        } else if (itemName == "Forward") {
            setForwardState(prev => ({
                ...prev,
                openDialog : true,
                forwardData : [clickedMessage]
            }));
        } else if (itemName == "Select") {
            const set = new Set(selectedMsg);
            set.add(clickedMessage.id);
            setSelectedMsg(set);
        }
        setMenuAnchorEl(null);
    };

    const scrollToDate = (smartDate : string) => {
        const el = document.querySelector(`[data-date='${smartDate}']`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            handleShowSnackbar("No messages found for selected date.");
        }
    };

    React.useEffect(() => {
        if (messageSearchDataState.messageDate.length > 0){
            scrollToDate(messageSearchDataState.messageDate);
        }
    },[messageSearchDataState.messageDate]);

    const topVisibleElement = () => {
        const scrollBox = document.querySelector('#yourScrollBoxId');
        if (!scrollBox) return;

        for (const card of scrollBox.querySelectorAll('.message-card')) {
            const rect = card.getBoundingClientRect();
            const boxRect = scrollBox.getBoundingClientRect();
            
            if (rect.top >= boxRect.top && rect.bottom > boxRect.top) {
                setVisibleDate(card.getAttribute('data-date') || null);
                break;
            }
        }
    };
    
    // Check scroll position
    const handleScroll = () => {
        topVisibleElement();
        const el = scrollRef.current;
        if (el) {
            const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1;
            
            setArrowState(prev => ({
                ...prev,
                showDownArrow : !isAtBottom
            }))

            if (isAtBottom && sessionStorage.getItem("First_Unread_Msg_ID")) {
                setTimeout(() => {
                    sessionStorage.removeItem("First_Unread_Msg_ID");
                }, 5000);
            }

            if (isAtBottom && sessionStorage.getItem("Messages_Data_Difference")){
                sessionStorage.removeItem("Messages_Data_Difference");
                setArrowState(prev => ({
                    ...prev,
                    dataDiff : false,
                    dataDiffCount : 0
                }));
            }
        }
        setDateBubble(true);
            if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Set new timeout to hide the bubble after 2 seconds
        scrollTimeoutRef.current = setTimeout(() => {
            setDateBubble(false);
        }, 2000);
    };

    const handleForwardDialogClose = () => {
        setForwardState({
            openDialog : false,
            forwardId : new Set<Number>(),
            forwardData : [],
            button : false
        });
        setSelectedMsgsState((prev : any) => ({
            ...prev,
            forwardMsgs : false
        }));
        setSelectedMsg(new Set());
    };

    const handleDeleteSelectedMsgs = async (everyone : boolean) => {
        setDeleteBtnState(prev => ({
            ...prev,
            ...(everyone
                ? { deleteEveryoneBtn: true }
                : { deleteBtn: true })
        }));

        const receiver = selecteduser.userName;
        const res = (selectedMsg.size > 0) ? 
            await deleteManyMessage(everyone, receiver, [...selectedMsg]) : 
            await deleteMessage(everyone, receiver, clickedMessage.id);

        if (res.status != 200) {
           handleShowSnackbar("Oops! Something went wrong. Please try again later.");
        };

        setDeleteBtnState(prev => ({
            ...prev,
            ...(everyone
                ? { deleteEveryoneBtn: false }
                : { deleteBtn: false })
        }));

        if (res.status == 200) {
            setDeleteDialog(false);
            if (selectedMsg.size > 0){
                setSelectedMsg(new Set());
            }
        };
    };

    const handleForwardMessages = () => {
        setForwardState((prev : any) => ({
            ...prev,
            button : true
        }));

        const selectedOrder = Array.from(selectedMsg);

        let selectedMsgsData = selectedMsg.size > 0 ?
            messagesData.filter((message : any) => selectedMsg.has(message.id))
            .sort((a, b) => selectedOrder.indexOf(a.id) - selectedOrder.indexOf(b.id))
            :
            forwardState.forwardData;

        forwardState.forwardId.forEach((id : any) => {
            const receiverConnection = userDataState.connectionsData.find((data : any) => data.userId1 == id || data.userId2 == id);
            let updatedMessages = selectedMsgsData.map(
                ({  id,
                    createdAt,
                    sender, senderId,
                    receiver, receiverId, 
                    messageDeletedByUser1, messageDeletedByUser2,
                    replied, repliedBy, repliedMessageId,
                    status,
                    ...rest 
                }) => ({
                    ...rest,
                    createdAt : getLocalISODateTime(),
                    sender: userDetails.userName,
                    senderId: userDetails.id,
                    receiver: receiverConnection.userName,
                    receiverId: receiverConnection.userId1 == id ? receiverConnection.userId1 : receiverConnection.userId2,
                    messageDeletedByUser1: false,
                    messageDeletedByUser2: false,
                    replied: false,
                    repliedBy: null,
                    repliedMessageId: null,
                    status: "Sending",
            })).reverse();

            console.log(updatedMessages);

            setUserDataState((prev : any) => ({
                ...prev,
                conversationData : [...prev.conversationData, ...updatedMessages],
                conversationsFound : true,
            }));

            const box = scrollRef.current;
            if (box) {
                box.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            
            sendMessage(updatedMessages, stompClientRef);
        });

        handleForwardDialogClose();
    };

    React.useEffect(() => {
        if (selectedMsg.size > 0) {
            const hasReceiver = messagesData.some((msg : any) => selectedMsg.has(msg.id) && msg.receiver == userDetails.userName);
            setMsgsContainReceiver(!hasReceiver);
        }
    }, [deleteDialog]);

    return (
        <Box
            ref={scrollRef}
            onScroll={handleScroll}
            id="yourScrollBoxId"
            sx={{
                width: "89%",
                height: "100%",
                overflow: "auto",
                padding: "0 5%",
                scrollbarWidth: "thin",
                scrollbarColor: "#6b6b6b rgba(202,217,212,255)",
                marginTop : "1%",
                position : "relative",
            }}>

            <Box
                sx={{
                    width : "auto",
                    height : "30px",
                    position : "fixed",
                    top : "10%",
                    left : "62.2%",
                    transform: "translateX(-50%)",
                    background : "rgba(0, 0, 0, 0.5)",
                    zIndex : 1000,
                    borderRadius : "20px",
                    display : "flex",
                    alignItems : "center",
                    backdropFilter : "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    opacity : dateBubble ? "1" : "0",
                    transition: "opacity 0.5s ease, visibility 0.5s ease",
                }}
            >
                <Typography
                    sx={{
                        color : "white",
                        fontSize : "13px",
                        padding : "5px 10px",
                        textAlign : "center",
                    }}
                >
                    {visibleDate}
                </Typography>
            </Box>

            <IconButton
                onClick={() => {
                    const el = scrollRef.current;
                    if (el) {
                        el.scrollTo({
                            top: el.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                }}
                sx={{
                    position : "fixed",
                    right : "1.2%",
                    bottom : "12%",
                    background : "#eef0f4",
                    opacity: arrowState.showDownArrow ? 1 : 0,
                    transition: "opacity 0.5s ease, visibility 0.5s ease",
                }}
            >
                <ArrowDownwardRounded
                    sx={{
                        fontSize : "35px"
                    }}
                />
                {arrowState.dataDiff &&
                <Typography
                    sx={{
                        position : "absolute",
                        left : "0",
                        bottom : "-10px",
                        border : "solid 1px grey",
                        borderRadius : "50%",
                        fontSize : "12px",
                        height : "23px",
                        width : "23px",
                        display : "flex",
                        alignItems : "center",
                        justifyContent : "center",
                        background : "grey",
                        color : "white"
                    }}          
                >
                    {arrowState.dataDiffCount < 100 ? arrowState.dataDiffCount : "99+"}
                </Typography>}
            </IconButton>

            {messagesData.length > 0 && messagesData.map((data: any, index : number) => {

                if ((userDetails.userName == data.sender && data.messageDeletedByUser1) || data.messageDeletedByUser2){
                    return null;
                };

                const parts = [];
                let lastIndex = 0;

                const matches = [...data.message.matchAll(combinedRegex)];

                matches.forEach((match, i) => {
                    const matchText = match[0];
                    const index = match.index;

                    if (index > lastIndex) {
                        parts.push(data.message.slice(lastIndex, index));
                    }

                    let href = "";
                    if (urlRegex.test(matchText)) {
                        href = matchText;
                    } else if (emailRegex.test(matchText)) {
                        href = `mailto:${matchText}`;
                    } else if (phoneRegex.test(matchText)) {
                        href = `tel:${matchText.replace(/\s+/g, "")}`;
                    }

                    parts.push(
                        <Link
                            sx={{
                                display : "inline-block",
                                overflow : "hidden",
                                textOverflow : "ellipsis",
                                whiteSpace : "nowrap",
                                width : '100%'
                            }}
                            key={`match-${i}`}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {matchText}
                        </Link>
                    );

                    lastIndex = index + matchText.length;
                });

                if (lastIndex < data.message.length) {
                    parts.push(data.message.slice(lastIndex));
                }

                const isEmoji = isOnlyEmojis(data.message);

                const isFile = !(
                    data.messageType === "text" ||
                    data.messageType.startsWith("image") ||
                    data.messageType.startsWith("audio") ||
                    data.messageType.startsWith("video")
                );

                const isUnreadMsgFoundStr = sessionStorage.getItem("First_Unread_Msg_ID");
                const isUnreadMsgFound = isUnreadMsgFoundStr ? JSON.parse(isUnreadMsgFoundStr) : null;

                return (
                    <React.Fragment key={index}>
                    <Box
                        data-date={data.createdAt.split("T")[0]}
                    >
                        {(isUnreadMsgFound && isUnreadMsgFound == data.id) || index == 0 || messagesData[index - 1].createdAt.split("T")[0] != data.createdAt.split("T")[0] ? 
                            <Box
                                sx={{
                                    width : "100%",
                                    height : "30px",
                                    display : "flex",
                                    alignItems : "center",
                                    justifyContent : "center",
                                    marginTop : "20px",
                                    marginBottom : "10px",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize : "13px",
                                        color : "white", 
                                        background : "rgba(0, 0, 0, 0.5)",
                                        borderRadius : "15px",
                                        padding : "5px 10px",
                                    }}
                                >
                                    {(isUnreadMsgFound && isUnreadMsgFound == data.id) ?
                                        "Unread Messages"
                                        :
                                        formatSmartDate(data.createdAt)
                                    }
                                </Typography>
                            </Box>
                        : null}
                    </Box>
                    <Box
                        className="message-card"
                        key={data.id}
                        data-msg-index={data.id}
                        data-date={formatSmartDate(data.createdAt)}
                        ref={(el) => {
                            (messageDateRefs.current[data.id] = el as HTMLDivElement | null)
                        }}
                        sx={{
                            width: "100%",
                            height: "auto",
                            display: "flex",
                            alignItems: "start",
                            background: (highlightScrollColor != null && highlightScrollColor == data.id) ? "rgba(0, 0, 0, 0.2)" : "transparent",
                            transition: "background-color 0.3s ease",
                            justifyContent: data.sender === userName ? "flex-end" : "flex-start",
                            marginTop : `${(index == 0 || messagesData[index - 1].sender == messagesData[index].sender) ? 0 : 30}px`,
                            marginBottom : "1px",
                            borderRadius: "10px",
                            zIndex: 1,
                            position: "relative",
                            cursor : selectedMsg.size > 0 ? "pointer" : ""
                        }}
                        onClick={() => {
                            if (selectedMsg.size > 0 && selectedMsg.size <= 20) {
                                setSelectedMsg((prev : any) => {
                                    const newSet = new Set(prev);
                                    newSet.has(data.id) ? newSet.delete(data.id) : newSet.add(data.id);
                                    return newSet;
                                });
                            } else if (selectedMsg.size > 20) {
                                handleShowSnackbar("Pick as many as 20 messages at once. No need to rush!");
                            }
                        }}
                        >
                        {selectedMsg.size > 0 && selectedMsg.has(data.id) &&
                            <Box
                                sx={{
                                    position : "absolute",
                                    top : 0,
                                    left : 0,
                                    width : "100%",
                                    height : "100%",
                                    borderRadius : "10px",
                                    background : "rgba(0, 0, 0, 0.2)",
                                    display : "flex",
                                    alignItems : "center",
                                    justifyContent : "start"
                                }}
                            >
                                <OfflinePinRounded
                                    color="action"
                                    sx={{
                                        position : "absolute",
                                        left : "10px",
                                    }}
                                />
                            </Box>
                        }
                        <Box 
                            sx={{
                                width: "45px",
                            }}>
                            {data.sender != userName && (index == 0 || messagesData[index - 1].sender === userName) ? <Avatar src={selecteduser.profilePicture} /> : null}
                        </Box>
                        <Card
                            ref={(el) => {
                                if (el) {
                                    messagesEndRef.current = el;
                                    repliedMessageRefs.current[data.id] = el;
                                }
                            }}
                            sx={{
                                width: 'auto',
                                maxWidth: '55%',
                                minHeight: '50px',
                                height: 'auto',
                                margin: '3px 0',
                                position: 'relative',
                                borderRadius: data.replied ? '5px 5px 16px 16px' : '16px',
                                backgroundColor: (isEmoji && data.message.length <= 2) ? "transparent" : (data.messageType.startsWith("image") && !data.replied) ? "transparent" : "#f1f3f4",
                                boxShadow: (isEmoji && data.message.length <= 2) ? "none" : data.messageType == "text" ? "" : "none",
                                transition : "background-color 0.3s ease",
                                zIndex : 10,
                            }}>
                                {data.replied && (() => {
                                    const repliedData = messagesData.find(item => item.id == data.repliedMessageId);

                                    if (!repliedData)return null;

                                    return (
                                    <Box
                                        key={data.id}
                                        ref={(el) => {
                                            if (el) {
                                                repliedMessageRefs.current[data.id] = el;
                                            }
                                        }}
                                        sx={{
                                            height : "auto",
                                            width : data.messageType.startsWith("image") && data.replied ? "250px" : "100%",
                                            background : "#f1f3f4",
                                            padding : "3px 0 3px 3px",
                                        }}
                                    >
                                        <ButtonBase
                                            onClick={async () => {
                                                const target = repliedMessageRefs.current[data.repliedMessageId];
                                                if (target) {
                                                    await target.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'center',
                                                    });
                                                    setHighlightScrollColor(data.repliedMessageId);

                                                    setTimeout(() => {
                                                        setHighlightScrollColor(null);
                                                    }, 2000);
                                                } else {
                                                    console.warn("Replied message ref not found");
                                                }
                                            }}
                                            sx={{
                                                width : "97%",
                                                height : "100%",
                                                borderRadius : "3px",
                                                border : "solid 1px #5a5a5a",
                                                borderLeft : "solid 5px #5a5a5a",
                                                display : "flex",
                                                alignItems : "center",
                                                justifyContent : "space-around",
                                            }}
                                        >
                                            {repliedData.messageType.startsWith("image") ?
                                                <PhotoRounded
                                                    color="action"
                                                    sx={{
                                                        marginRight : "5px"
                                                    }}
                                                />
                                                :
                                            repliedData.messageType == "file" ?
                                                <InsertDriveFileRounded
                                                    color="action"
                                                    sx={{
                                                        marginRight : "5px",
                                                        fontSize : "35px"
                                                    }}
                                                />
                                                :
                                            repliedData.messageType.startsWith("audio") ?
                                                <HeadphonesRounded
                                                    color="action"
                                                    sx={{
                                                        marginRight : "5px",
                                                        fontSize : "35px"
                                                    }}
                                                />
                                                :
                                            repliedData.messageType.startsWith("video") ?
                                                <VideocamRounded
                                                    color="action"
                                                    sx={{
                                                        marginRight : "5px",
                                                        fontSize : "35px"
                                                    }}
                                                />
                                                :
                                                <Box sx={{ marginRight : "5px" }}></Box>
                                            }

                                            <Typography
                                                sx={{
                                                    fontWeight : "bold",
                                                    fontSize : "15px",
                                                    width : "100%",
                                                    overflow : "hidden",
                                                    whiteSpace : "nowrap",
                                                    textOverflow : "ellipsis",
                                                    textAlign : "start"
                                                }}
                                            >
                                                <span>
                                                    {data.repliedBy == userName ? "You" : data.repliedBydata}
                                                </span>
                                                <br/>
                                                <span
                                                    style={{
                                                        fontWeight : "normal",
                                                        fontSize : "13px"
                                                    }}
                                                >
                                                    {repliedData.messageType == "text" ? repliedData.message : repliedData.fileName}
                                                </span>
                                            </Typography>
                                        </ButtonBase>
                                    </Box>
                                    );
                                })()}

                            <CardContent
                                ref={cardRef}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    if (selectedMsg.size == 0){
                                        handleMenuClick(e, data);
                                    }
                                }}
                                sx={{
                                    display : "flex",
                                    alignItems : "center",
                                    padding : data.messageType.startsWith("image") ? "0" : (isFile || data.messageType.startsWith("audio")) ? "10px 10px 0 5px" : (isEmoji && data.message.length <= 2) ? "0" : "",
                                    background: (isFile || data.messageType.startsWith("audio")) ? "#f1f3f4" : "",
                                    borderRadius : (isFile || data.messageType.startsWith("audio")) && data.replied ? "0 0 16px 16px" : "16px",
                                    transition : "background-color 0.3s ease",
                                    zIndex : 10
                                }}>
                                {data.messageType == "text" ? 
                                    <Typography
                                            sx={{
                                                fontFamily : "Poppins, sans-serif",
                                                width : "100%",  
                                                fontSize : isEmoji && data.message.length <= 2 ? "80px" : isEmoji ? "25px" :  "16px",
                                            }}
                                            >
                                        {messageSearchDataState.messageData.length > 0 ? highlightPart(parts.toLocaleString(), messageSearchDataState.messageData) : parts}
                                    </Typography>
                                    :
                                data.messageType.startsWith("image") ? 
                                    <img 
                                        src={data.message}
                                        alt="image"
                                        width="250px"
                                        style={{
                                            borderRadius : "16px"
                                        }}
                                    />
                                    :
                                data.messageType.startsWith("video") ? 
                                <Box
                                    sx={{
                                        display : "flex",
                                        flexDirection : "column",
                                        alignItems : "start",
                                        justifyContent : "center"
                                    }}
                                >
                                    <video 
                                        width="330" 
                                        height="180" 
                                        controls
                                        controlsList="nodownload"
                                        src={data.message}
                                        style={{
                                            borderRadius : "15px",
                                            objectFit : "fill",
                                            marginBottom : "5px"
                                        }}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                    <Typography
                                        sx={{
                                            marginLeft : "5px"
                                        }}
                                    >
                                        {data.fileName.length > 30 ? 
                                            data.fileName.slice(0, 30) + "..."
                                            :
                                            data.fileName
                                        }
                                    </Typography>
                                    <Typography
                                        sx={{
                                            marginLeft : "5px",
                                            fontSize : "13px"
                                        }}
                                    >
                                        {data.fileSize}
                                    </Typography>
                                </Box>
                                    :
                                    <Box
                                        sx={{
                                            width : "auto",
                                            height : "100%",
                                            display : "flex",
                                            alignItems : "center",
                                            justifyContent : "center",
                                            borderRadius : "10px",
                                        }}
                                    >
                                        {data.messageType.startsWith("audio") && data.fileName.includes("recording") ?
                                            <MicRounded
                                                color="action"
                                                sx={{ 
                                                    fontSize : "50px",
                                                }} 
                                            />
                                            :
                                            data.messageType.startsWith("audio") ?
                                            <HeadphonesRounded
                                                color="action" 
                                                sx={{ 
                                                    fontSize : "50px",
                                                }} 
                                            />
                                            :
                                            <InsertDriveFileRounded 
                                                color="action"
                                                sx={{ 
                                                    fontSize : "50px",
                                                }} 
                                            />
                                        }
                                        <Typography>
                                            {data.messageType.startsWith("audio") &&
                                                <>
                                                <audio
                                                    controls
                                                    src={data.message}
                                                    controlsList="nodownload noplaybackrate"
                                                    style={{ 
                                                        height : "30px",
                                                    }}
                                                >
                                                    Your browser does not support the audio element.
                                                </audio>
                                                <br/>
                                                </>
                                            }
                                            <span
                                                style={{
                                                    marginLeft : isFile ? "" : "20px"
                                                }}
                                            >
                                            {
                                                data.fileName && data.fileName.length > 30 ?
                                                data.fileName.slice(0, 30) + "..."
                                                :
                                                data.fileName
                                            }
                                            </span>
                                            <br/>
                                            <span
                                                style={{ 
                                                    fontSize : "13px",
                                                    marginLeft : isFile ? "" : "20px"
                                                }}
                                            >{data.fileSize}</span>
                                        </Typography>
                                    </Box>
                                }
                            </CardContent>

                            <CardActions
                                sx={{
                                    height : "5px",
                                }}
                            >
                                <Typography
                                    sx={{
                                        width : "100%",
                                        fontSize: "12px",
                                        color: "#6b6b6b",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    {extractTime(data.createdAt)}
                                    {data.sender == userName ?
                                        data.status == "Sending" ? 
                                        <AccessTimeRounded
                                            color="inherit"
                                            sx={{
                                                fontSize: "18px",
                                                marginLeft : "5px",
                                            }} 
                                        />
                                            :
                                        data.status == "Failed" ?
                                        <ErrorOutlineRounded
                                            color="error"
                                            sx={{
                                                fontSize: "18px",
                                                marginLeft : "5px",
                                            }} 
                                        />
                                            :
                                        data.status == "Sent" ?
                                        <DoneRounded
                                            color="inherit"
                                            sx={{
                                                fontSize: "18px",
                                                marginLeft : "5px",
                                            }} 
                                        />
                                            :
                                        <DoneAllRounded
                                            color={data.status == "Delivered" ? "inherit" : "primary"}
                                            sx={{
                                                fontSize: "18px",
                                                margin : "0 5px",
                                            }} 
                                        />
                                    : null}
                                </Typography>
                            </CardActions>

                        </Card>
                        <Box 
                            sx={{
                                width: "45px",
                                marginLeft: "5px",
                            }}>
                            {data.sender === userName && (index == 0 || messagesData[index - 1].sender != userName) ? <Avatar src={userDetails.profilePicture} /> : null}
                        </Box>
                    </Box>
            </React.Fragment>)})}

            <Menu
                onContextMenu={(e) => {
                    e.preventDefault();
                    handleMenuClose("");
                }}
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={() => handleMenuClose("")}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    "& .MuiPaper-root": {
                        backgroundColor: "#212121",
                        color: "white",
                        width: "180px",
                        boxShadow : "none",
                        margin : "1% 0 0 1%",
                        position : "relative",
                        overflow : "visible"
                    },
                }}
            >
                {clickedMessage && menuItems.map((item) => (
                    item &&
                    <MenuItem
                        onClick={() => handleMenuClose(item.name)}
                        sx={{
                            display : "flex",
                            alignItems : "center",
                            justifyContent : "start"
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                color : "white"
                            }}>
                            {item.Icon}
                        </ListItemIcon>
                        {item.name}
                    </MenuItem>
                ))}
            </Menu>

            {/* Delete Dialog */}
            <Dialog
                open={deleteDialog}
            >
                <DialogTitle
                    sx={{
                        background : "#212121",
                        color : "white"
                    }}
                    >Delete Message</DialogTitle>
                <DialogContent
                    sx={{
                        background : "#212121",
                    }}>
                    <DialogContentText>
                        <Typography color="white">
                            Are you sure you want to delete this message ?
                        </Typography>
                    </DialogContentText>
                    <DialogActions
                        sx={{
                            display : "flex",
                            flexDirection : (clickedMessage && clickedMessage.sender == userDetails.userName) || msgsContainReceiver ? "column" : "row",
                            alignItems : "end",
                            justifyContent : (clickedMessage && clickedMessage.sender == userDetails.userName) || msgsContainReceiver ? "center" : "end",
                            marginTop : "20px",
                        }}
                    >
                        {((clickedMessage && clickedMessage.sender == userDetails.userName) || msgsContainReceiver) && (
                            <Button
                                color="error"
                                onClick={() => handleDeleteSelectedMsgs(true)}
                                sx={{
                                    color : deleteBtnState.deleteEveryoneBtn ? "grey" : "",
                                    pointerEvents : deleteBtnState.deleteEveryoneBtn ? "none" : ""
                                }}
                            >
                                Delete For Everyone
                                <CircularProgress
                                    size={25}
                                    color="error"
                                    sx={{
                                        position : "absolute",
                                        opacity : deleteBtnState.deleteEveryoneBtn ? "1" : "0"
                                    }}
                                />
                            </Button>
                        )}
                        <Button 
                            color="error"
                            onClick={() => handleDeleteSelectedMsgs(false)}
                            sx={{
                                color : deleteBtnState.deleteBtn ? "grey" : "",
                                pointerEvents : deleteBtnState.deleteBtn ? "none" : ""
                            }}
                        >
                            Delete
                            <CircularProgress
                                size={25}
                                color="error"
                                sx={{
                                    position : "absolute",
                                    opacity : deleteBtnState.deleteBtn ? "1" : "0"
                                }}
                            />
                        </Button>
                        <Button 
                            color="inherit"
                            onClick={() => setDeleteDialog(false)} 
                            sx={{
                                color : "lightgrey",
                                ":hover" : {
                                    background : "#484744"
                                }
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>

            {/* Forward Dialog */}
            <Dialog
                open={forwardState.openDialog}
                onClose={handleForwardDialogClose}
            >
                <DialogTitle
                    sx={{
                        background : "#212121",
                        color : "white",
                        display : "flex",
                        alignItems : "center",
                        justifyContent : "space-between"
                    }}
                >
                    <TextField
                            placeholder="Forward to..."
                            variant="standard"
                            sx={{
                                width : "85%",
                                height : "50px",
                                '& .MuiInput-underline:before': {
                                    borderBottom: 'solid 1px grey',
                                },
                                '& .MuiInput-underline:after': {
                                    borderBottom: 'solid 1px grey',
                                }
                            }}
                            InputProps={{
                                sx : {
                                    height : 40,
                                    color : "white",
                                    fontSize : "18px",
                                }
                            }}
                        />
                        <IconButton
                            onClick={handleForwardDialogClose}
                        >
                            <CloseRounded
                                sx={{ 
                                    fontSize : "30px",
                                    color : "white"
                                }}
                            />
                        </IconButton>
                </DialogTitle>

                <DialogContent
                    sx={{
                        background : "#212121",
                        width : "50vh",
                        overflow : "auto",
                        maxHeight : "50vh",
                        scrollbarWidth : "thin",
                        scrollbarColor : "#484744 transparent"
                    }}
                >
                {userDataState.connectionsData && userDataState.connectionsData.length > 0 ?
                 userDataState.connectionsData.map((data : any) => {
                    const id = data.userName == userDataState.userName1 ? data.userId2 : data.userId1;
                    return(
                        <ButtonBase
                            onClick={() => {
                                if (forwardState.forwardId.has(id)){
                                    forwardState.forwardId.delete(id)
                                    setForwardState(prev => ({
                                        ...prev,
                                        forwardId : forwardState.forwardId
                                    }));
                                } else {
                                    setForwardState(prev => ({
                                        ...prev,
                                        forwardId : new Set([...prev.forwardId, id])
                                    }));
                                }
                            }}
                            sx={{
                                display : "flex",
                                alignItems : "center",
                                justifyContent : "start",
                                height : "50px",
                                margin : "8px 0",
                                borderRadius : "10px",
                                background : forwardState.forwardId.has(id) ? "#484744" : "",
                                position : "relative",
                                width : "100%"
                            }}
                        >
                            <Avatar
                                src={data.profilePicture}
                                sx={{
                                    width : "45px",
                                    height : "45px",
                                    marginRight : "15px"
                                }}
                            />
                            <Typography
                                sx={{
                                    width : "70%",
                                    color : "white",
                                    textAlign : "start",
                                }}
                            >
                                {data.userName}
                            </Typography>
                            {forwardState.forwardId.has(id) &&
                            <CheckCircleRounded
                                sx={{
                                    position : "absolute",
                                    right : "5%",
                                    color : "white"
                                }}
                            />}
                        </ButtonBase>
                    )
                }) : 
                    <Box
                        sx={{
                            width : "100%",
                            height : "30vh",
                            display : "flex",
                            alignItems : "center",
                            justifyContent : "center"
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color : "grey"
                            }}
                        >
                            No Connections found!
                        </Typography>
                    </Box>
                }
                </DialogContent>

                <DialogActions
                    sx={{
                        background : "#212121",
                        height : "60px",
                        display : "flex",
                        justifyContent : "center"
                    }}
                >
                    <Button
                        disabled={forwardState.forwardId.size == 0 || forwardState.button}
                        sx={{
                            width : "90%",
                            marginRight : "10px",
                            color : "black",
                            background : forwardState.forwardId.size == 0 ? "grey" : "white",
                            height : "50px",
                            borderRadius : "10px",
                            position : "relative"
                        }}
                        onClick={handleForwardMessages}
                    >
                        Forward
                        <ArrowForwardRounded
                            sx={{
                                position : "absolute",
                                right : "5%"
                            }}
                        />
                        <CircularProgress
                            size={30}
                            sx={{
                                position : "absolute",
                                color : "white",
                                opacity : forwardState.button ? "1" : "0"
                            }}
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MessageData;