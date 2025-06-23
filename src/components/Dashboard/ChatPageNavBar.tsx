import React, { useContext, useEffect, useState } from "react";
import { AccountCircleRounded, AlternateEmailRounded, ArrowBackRounded, CalendarToday, CloseRounded, DeleteRounded, HeadsetRounded, InsertDriveFileRounded, MailOutlineRounded, MicRounded, MoreVertRounded, NoAccountsRounded, PersonRounded, RemoveCircleOutlineRounded, SearchRounded, StarBorder } from "@mui/icons-material";
import { AppBar, Avatar, Box, Button, ButtonBase, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, IconButton, ImageList, ImageListItem, ImageListItemBar, InputAdornment, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Tab, Tabs, TextField, Toolbar, Tooltip, Typography } from "@mui/material";
import { formatSmartDate } from "./MessageData";
import { UserContext } from "../API/Users";
import { ConversationContext } from "../API/Conversation";
import { ConnectionContext } from "../API/Connection";

const ChatPageNavBar = (
        { messagesData, setMessagesData, selecteduser, conversationData, setMessageSearchDataState, handleShowSnackbar, isSmallScreen, setUserDataState, fetchConnections } :
        { messagesData : any , setMessagesData : any , selecteduser : any, conversationData : any, setMessageSearchDataState : any, handleShowSnackbar : any, isSmallScreen : any, setUserDataState : any, fetchConnections : any }
    ) => {

    const { manageUserBlockState } = useContext<any>(UserContext);
    const { clearUserChat } = useContext<any>(ConversationContext);
    const { deleteUserConnection } = useContext<any>(ConnectionContext);
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const dateInputRef = React.useRef<HTMLInputElement | null>(null);
    const [tabValue, setTabValue] = useState(-1);
    const [openContactInfo, setOpenContactInfo] = React.useState(false);
    const menuOpen = Boolean(menuAnchorEl);
    const sharedMediaBox = React.useRef<HTMLDivElement | null>(null);
    const [messageSearchState, setMessageSearchState] = useState({
        onSearch : false,
        searchData : "",
        searched : false,
    });
    const [manageUserState, setManageUserState] = useState({
        dialog : false,
        action : "",
        button : false,
        button2 : false
    });

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleManuClose = (itemName: string) => {
        if (itemName === "View Contact") {
            setOpenContactInfo(true)
        } else if (itemName && itemName.length > 0) {
            setManageUserState({
                dialog : true,
                action : itemName,
                button : false,
                button2 : false
            });
        }
        setMenuAnchorEl(null);
    };

    useEffect(() => {
        setMessageSearchDataState((prev : any) => ({
            ...prev,
            messageData : messageSearchState.searchData
        }));
        const handleSearchData = () => {
            const searchedData = conversationData.filter((data : any) => data.messageType == "text" && data.message.toLowerCase().includes(messageSearchState.searchData.toLowerCase()));
            setMessagesData(searchedData);
        }

        if (messageSearchState.searchData.length > 0){
            handleSearchData();
        }
    }, [messageSearchState.searched]);

    const menuItems = [
        { icon: <PersonRounded sx={{ fontSize : "30px" }} />, label: "View Contact" },
        { icon: <RemoveCircleOutlineRounded sx={{ fontSize : "30px" }} />, label: "Clear Chat" },
        ((selecteduser.userName1 == selecteduser.userName ? selecteduser.blockedByUser2 : selecteduser.blockedByUser1) ?
            { icon : <AccountCircleRounded sx={{ fontSize : "30px" }} />, label : "Unblock User"}
            :
            { icon: <NoAccountsRounded sx={{ fontSize : "30px" }} />, label: "Block User" }
        ),
        { icon: <DeleteRounded sx={{ fontSize : "30px" }} color="error" />, label: "Delete Chat" },
    ];

    // const extractTime = (dateStr : any) => {
    //     const date = new Date(dateStr);

    //     const formatted = date.toLocaleString('en-US', {
    //         year: 'numeric',
    //         month: 'short',
    //         day: 'numeric',
    //         hour: 'numeric',
    //         minute: '2-digit',
    //         hour12: true
    //     });

    //     return formatted;
    // }

    const handleScrollToBox = () => {
        sharedMediaBox.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start', // align the top of the box with the top of the scroll container
        });
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        console.info(event.isTrusted);
        setTabValue(newValue);
        handleScrollToBox();
    };

    const handleCopy = (type : any, text : any) => {
        navigator.clipboard.writeText(text)
        .then(() => handleShowSnackbar(`${type} Copied`))
        .catch(e => {
            handleShowSnackbar(`Failed to copy ${type}`);
            console.log(e);
        });
    };

    const openDatePicker = () => {
        dateInputRef.current?.showPicker?.();
        dateInputRef.current?.click();
    };

    const extractLastSeen = (dateStr : any) => {
        const now = new Date();
        const inputDate = new Date(dateStr);
        const diffInMs = now.getTime() - inputDate.getTime();
        const diffInMinutes = diffInMs / (1000 * 60);

        // If less than 60 minutes ago
        if (diffInMinutes < 60) {
            return "recently";
        }

        const date = formatSmartDate(dateStr);
        if (date == "Today" || date == "Yesterday") {
            return date + " at " + new Date(dateStr).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    hour12: true
                                                                });
        }
        return " at " + date;
    }

    const manageBlockState = async () => {
        setManageUserState(prev => ({
            ...prev,
            button : true
        }));
        const isBlocked = selecteduser.userName1 == selecteduser.userName ? selecteduser.blockedByUser2 : selecteduser.blockedByUser1;

        const res = await manageUserBlockState(!isBlocked, selecteduser.userName);
        if (res.status == 201) {
            handleShowSnackbar(`${!isBlocked ? "🚫" : "✅"} ${selecteduser.userName} ${!isBlocked ? "" : "Un"}blocked successfully!`);
            if (!isBlocked)handleShowSnackbar("No further messages will come through from this user.");
            
            const updatedUser = { ...selecteduser };
            if (selecteduser.userName === updatedUser.userName1) {
                updatedUser.blockedByUser2 = !isBlocked;
            } else {
                updatedUser.blockedByUser1 = !isBlocked;
            }

            if (selecteduser.userName === updatedUser.userName2 && selecteduser.connectionDeletedByUser1) {
                updatedUser.connectionDeletedByUser1 = false;
            } else if (selecteduser.userName === updatedUser.userName1 && selecteduser.connectionDeletedByUser2) {
                updatedUser.connectionDeletedByUser2 = false;
            }
            
            setUserDataState((prev: any) => ({
                ...prev,
                selectedUser: updatedUser
            }));

        } else if (res.status == 204) {
            handleShowSnackbar("You can only block users you're connected with. Start a chat first!");
        } else {
            handleShowSnackbar("Oops! Something went wrong. Please try again later.");
        }
        setManageUserState({
            dialog : false,
            action : "",
            button : false,
            button2 : false
        });
    };

    const manageClearChat = async () => {

        setManageUserState(prev => ({
            ...prev,
            button : true
        }));
        
        const res = await clearUserChat(selecteduser.userName);
        if (res.status == 201) {
            handleShowSnackbar("Done! Your conversations has been cleared.");
        } else {
            handleShowSnackbar("Oops! Something went wrong. Please try again later.");
        }

        setManageUserState({
            dialog : false,
            action : "",
            button : false,
            button2 : false
        });
    }

    const manageDeleteConnection = async (isBlocked : boolean) => {

        setManageUserState(prev => ({
            ...prev,
            ...(isBlocked ? { button2: true } : { button: true })
        }));

        const res = await deleteUserConnection(selecteduser.userName, isBlocked);
        if (res.status == 201) {
            handleShowSnackbar(isBlocked ? 
                "Chat removed and user blocked. No further messages will come through from this user."
                :
                "Done! The chat has been removed."
            );
            fetchConnections();
            setUserDataState((prev : any) => ({
                ...prev,
                selectedUser : "None"
            }));
        } else {
            handleShowSnackbar("Oops! Something went wrong. Please try again later.");
        }

        setManageUserState({
            dialog : false,
            action : "",
            button : false,
            button2 : false
        });
    }

    // React.useEffect(() => {
    //     if ("Notification" in window) {
    //         Notification.requestPermission().then((permission) => {
    //         console.log("Notification permission:", permission);
    //         });
    //     }
    // }, []);

    // const showNotification = () => {
    //     if (Notification.permission === "granted") {
    //         new Notification("Hello from React!", {
    //             body: "This is a test notification.",
    //             icon: "/icon.png",
    //         });
    //     }
    // };


    return (
        <Box
            sx={{
                width: "100%",
                height: "10%",
            }}>
            <Card
                sx={{
                    height: "60px",
                    padding: isSmallScreen ? "5px 20px 5px 5px" : "5px 20px",
                    backgroundColor: "#212121",
                    borderRadius: "0px",
                }}>
                <Box
                    sx={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        alignItems : "center",
                        justifyContent: "space-between",
                    }}>
                    {isSmallScreen && 
                    <IconButton
                        sx={{
                            marginRight : "5px",
                            ":hover" : {
                                background : "#303030"
                            } 
                        }}
                        onClick={() => 
                            setUserDataState((prev : any) => ({
                                ...prev,
                                selectedUser : null
                            }))
                        }
                    >
                        <ArrowBackRounded
                            sx={{
                                color : "white",
                                fontSize : "30px"
                            }}
                        />
                    </IconButton>}
                    <Avatar
                        src={selecteduser.profilePicture}
                        onClick={() => setOpenContactInfo(true)}
                        sx={{
                            cursor : "pointer"
                        }}
                    />

                    <Box 
                        onClick={fetchConnections}
                        sx={{
                            width : "88%",
                            height : "100%",
                            display : "flex",
                            flexDirection : "row",
                            alignItems : "center",
                            justifyContent : "space-between",
                        }}>

                    {messageSearchState.onSearch ? (
                        <Box
                            sx={{
                                width : "100%",
                                height : "100%",
                                display : "flex",
                                alignItems : "center",
                                justifyContent : "center"
                            }}>
                            <TextField 
                                variant="outlined"
                                placeholder="Search"
                                value={messageSearchState.searchData}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setMessageSearchState((prev: any) => ({
                                            ...prev,
                                            searched : !prev.searched,
                                        }));
                                    }
                                }}
                                onChange={(e) => setMessageSearchState((prev: any) => ({
                                    ...prev,
                                    searchData: e.target.value
                                }))}
                                sx={{
                                    backgroundColor : "#303030",
                                    borderRadius : "50px",
                                    width : "95%",
                                    input : {
                                        color : "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            border: "none",
                                            color : "white",
                                        },
                                    },
                                }}

                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchRounded
                                                sx={{
                                                    color : "white",
                                                    fontSize : "30px",
                                                    marginRight : "10px",
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <input 
                                                ref={dateInputRef}
                                                value={""}
                                                type="date"
                                                style={{
                                                    position: 'absolute',
                                                    opacity: 0,
                                                    width: 0,
                                                    height: 0,
                                                    pointerEvents: 'none',
                                                }}
                                                onChange={(e) => {
                                                    setMessageSearchDataState((prev : any) => ({
                                                        ...prev,
                                                        messageDate : e.target.value
                                                    }))
                                                }}
                                            />
                                            <IconButton
                                                onClick={openDatePicker}
                                                sx={{
                                                    marginRight : "10px",
                                                }}
                                            >
                                                <CalendarToday
                                                    sx={{
                                                        color : "white",
                                                        fontSize : "20px"
                                                    }}
                                                />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    setMessageSearchState((prev : any) => ({
                                                        ...prev,
                                                        onSearch : false,
                                                        searchData : ""
                                                    })),
                                                    setMessagesData(conversationData)
                                                }}
                                                sx={{
                                                    color : "white",
                                                    fontSize : "30px",
                                                }}>
                                                <CloseRounded/>
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>)

                        :
                        
                        (<><Box 
                            onClick={() => setOpenContactInfo(true)}
                            sx={{
                                padding : "0px 10px",
                                cursor : "pointer",
                                userSelect : "none"
                            }}>
                                <Typography 
                                    color="white"
                                    sx={{
                                        fontWeight : "600",
                                        fontSize : "18px",
                                    }}>
                                        {selecteduser.userName}
                                </Typography>
                                <Typography 
                                    color="white"
                                    sx={{
                                        fontSize : "14px",
                                    }}>
                                    {!((selecteduser.userName1 == selecteduser.userName && selecteduser.blockedByUser1) || (selecteduser.userName2 == selecteduser.userName && selecteduser.blockedByUser2)) 
                                        ? (selecteduser.loginStatus == "online" ? selecteduser.loginStatus : `last seen ${extractLastSeen(selecteduser.lastSeen)}`) 
                                        : ""
                                    }
                                </Typography>
                        </Box>

                        <IconButton 
                            onClick={() => {
                                setMessageSearchState((prev: any) => ({
                                    ...prev,
                                    onSearch : true,
                                }));
                            }}
                            sx={{
                                '&hover': {
                                    backgroundColor : "#6b6b6b",
                                },
                            }}>
                            <SearchRounded
                                sx={{
                                    color : "white",
                                    fontSize : "30px",
                                }}
                            />
                        </IconButton>
                        </>)}
                    </Box>
                    
                    <IconButton
                        onClick={handleMenuClick}>
                        <MoreVertRounded
                            sx={{
                                color : "white",
                                fontSize : "30px",
                            }}    
                        />
                    </IconButton>

                    <Menu
                        id="demo-positioned-menu"
                        aria-labelledby="demo-positioned-button"
                        anchorEl={menuAnchorEl}
                        open={menuOpen}
                        onClose={handleManuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        sx={{
                            "& .MuiPaper-root": {
                                color: "white",
                                width: "200px",
                                borderRadius : "20px",
                                backdropFilter: 'blur(8px)',  // Adjust the blur radius here
                                backgroundColor: 'rgba(28, 28, 28, 0.90)'
                            },
                        }}
                    >
                        {menuItems
                        .map(({icon, label}) => (
                            <>
                            <MenuItem 
                                onClick={() => handleManuClose(label)}
                                disabled={
                                    (label == "Delete Chat" || label == "Clear Chat") &&
                                    ((selecteduser.userName2 == selecteduser.userName && selecteduser.connectionDeletedByUser1)
                                    ||
                                    (selecteduser.userName1 == selecteduser.userName && selecteduser.connectionDeletedByUser2))
                                }
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    height : label == "Delete Chat" ? "30px" : "50px",
                                }}>
                                    <ListItemIcon 
                                        sx={{
                                            color: "white"
                                        }}>
                                        {icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        sx={{
                                            color: label == "Delete Chat" ? "#d32f2f" : "white",
                                        }}
                                    >
                                        {label}
                                    </ListItemText>
                            </MenuItem>
                            {(label == "Block User" || label == "Unblock User") && <Divider sx={{ backgroundColor : "grey" }} />}
                            </>
                        ))}
                    </Menu>

                </Box>
            </Card>
            
            <Drawer 
                open={openContactInfo}
                onClose={() => setOpenContactInfo(false)}
                anchor="right"
                PaperProps={{
                    sx : {
                        '&::-webkit-scrollbar': {
                            width: "0px",
                        },
                        maxWidth : 360
                    }
                }}
            >
                <Box
                    sx={{
                        background : "#0f0f0f",
                        width : "100%",
                        height : "100%",
                    }}
                >
                    <AppBar 
                        position="static"
                        sx={{
                            bgcolor : "#222222",
                            height : "60px",
                            borderBottom : "solid 1px black"
                        }}
                    >
                        <Toolbar
                            sx={{ 
                                display : "flex",
                                alignItems : "center",
                                justifyContent : "start",
                            }}
                        >
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={() => setOpenContactInfo(false)}
                                sx={{
                                    marginRight : "10px",
                                    ":hover" : {
                                        bgcolor : "#333333"
                                    }
                                }}
                            >
                                
                                <ArrowBackRounded />
                            </IconButton>
                            <Typography 
                                variant="h6"
                            >
                                User Info                                
                            </Typography>
                        </Toolbar>
                    </AppBar>

                    <Box
                        onContextMenu={(e) => e.preventDefault()}
                        sx={{
                            width : "100%",
                            height : "45%",
                            background : "#222222",
                            display : "flex",
                            alignItems : "center",
                            justifyContent : "center",
                            position : "relative"
                        }}
                    >
                        <Avatar
                            src={selecteduser.profilePicture}
                            style={{
                                borderRadius : "50%",
                                width : "75%",
                                height :"75%"
                            }}
                        />
                    </Box>

                    <List>
                    {[0, 1].map((id) => {
                        return(
                            <>
                            <ButtonBase
                                    sx={{
                                        width : "100%"
                                    }}
                                    onClick={() => {
                                        if (id == 0){
                                            handleCopy("Username", `@${selecteduser.userName}`);
                                        } else {
                                            handleCopy("Email", selecteduser.email);
                                        }
                                    }}
                                >
                                <ListItemIcon
                                    sx={{
                                        bgcolor : "#222222",
                                        height : "60px",
                                        display : "flex",
                                        alignItems : "center",
                                        justifyContent : "center"
                                    }}
                                >
                                    {id == 0 ? 
                                    <AlternateEmailRounded
                                        sx={{
                                            color : "white"
                                        }}
                                    />
                                    :
                                    <MailOutlineRounded
                                        sx={{
                                            color : "white"
                                        }}
                                    />
                                }
                                </ListItemIcon>
                                <ListItem
                                    sx={{
                                        bgcolor : "#222222",
                                        width : "100%",
                                        height : "60px",
                                        color : "white",
                                        display : "flex",
                                        flexDirection : "column",
                                        alignItems : "start",
                                        justifyContent : "center"
                                    }}
                                >
                                    <Typography
                                    >
                                        {id == 0 ? 
                                            "@" + selecteduser.userName
                                            :
                                            selecteduser.email
                                        }
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color : "grey",
                                            fontSize : "15px",
                                        }}
                                    >
                                        {id == 0 ? "Username" : "Email"}
                                    </Typography>
                                </ListItem>
                            </ButtonBase>
                            <Divider/>
                            </>
                        )})}
                    </List>
                    
                    <List
                        sx={{
                            background : "#222222",
                            overflow : "auto",
                        }}
                    >
                        <Box 
                            ref={sharedMediaBox}
                            sx={{
                                borderBottom: 1, 
                                borderColor: 'divider',
                                overflow : "auto",
                            }}
                        >
                            <Tabs 
                                value={tabValue}
                                onChange={handleChange}
                                sx={{
                                    color : "darkgrey",
                                    borderBottom : "solid 1px black"
                                }}
                                textColor="inherit"
                                TabIndicatorProps={{
                                    style: {
                                        backgroundColor: "white",
                                    },
                                }}
                            >
                                {["Media", "Files", "Music", "Voice"].map((name, id) => (
                                    <Tab 
                                        label={name}
                                        key={id} 
                                        sx={{ 
                                            fontWeight : tabValue == id ? "bold" : "",
                                            color : tabValue == id ? "white" : "",
                                        }}
                                    />
                                ))}
                            </Tabs>
                        </Box>
                        <Box
                            sx={{
                                width: "100%",
                                height: "93vh",
                                overflowY: "auto",
                                scrollbarWidth: "none",
                            }}
                        >
                            <ImageList 
                                onContextMenu={(e) => e.preventDefault()}
                                variant="quilted"
                                cols={2}
                                rowHeight={200}
                                sx={{ 
                                    width: "100%", 
                                    height: "1000px",
                                    scrollbarWidth: "none",
                                    placeContent: "start",
                                }}>
                                    {!messagesData || (messagesData && messagesData.length == 0) || !messagesData.some((msg: any) => 
                                        (tabValue == 0 && (msg.messageType.startsWith("image") || msg.messageType.startsWith("video"))) || 
                                        (tabValue == 3 && msg.messageType.startsWith("audio") && msg.fileName.includes("recording")) || 
                                        (tabValue == 2 && msg.messageType.startsWith("audio") && !msg.fileName.includes("recording")) || 
                                        (tabValue == 1 && msg.messageType != "text" && !msg.messageType.startsWith("image") && !msg.messageType.startsWith("video") && !msg.messageType.startsWith("audio"))
                                    ) ? (
                                        <Box
                                            position="absolute"
                                            top="20%"
                                            width="100%"
                                        >
                                            <Typography 
                                                variant="body2"
                                                sx={{
                                                    color : "white",
                                                    textAlign : "center",
                                                    fontSize : "16px",
                                                    fontFamily : "inherit",
                                                }}
                                            >
                                                No {tabValue == 0 ? "Media" : tabValue == 1 ? "Files" : tabValue == 2 ? "Music" : "Voice Messages"} found.
                                            </Typography>
                                        </Box>
                                ) : (
                                [...messagesData].reverse().map((message : any, index : any) => {

                                    if (
                                        (tabValue == 0 && (message.messageType.startsWith("image") || message.messageType.startsWith("video"))) || 
                                        (tabValue == 3 && message.messageType.startsWith("audio") && message.fileName.includes("recording")) || 
                                        (tabValue == 2 && message.messageType.startsWith("audio") && !message.fileName.includes("recording")) || 
                                        (tabValue == 1 && message.messageType != "text" && !message.messageType.startsWith("image") && !message.messageType.startsWith("video") && !message.messageType.startsWith("audio"))
                                    ) {
                                        return (
                                            <ImageListItem key={index}
                                                sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    position: "relative",
                                                }}
                                            >
                                                {tabValue == 0 ? 
                                                    (message.messageType.startsWith("image") ?
                                                        <img
                                                            srcSet={`${message.message}?w=248&fit=crop&auto=format&dpr=2 2x`}
                                                            src={`${message.message}?w=248&fit=crop&auto=format`}
                                                            alt={message.fileName}
                                                            loading="lazy"
                                                        /> :
                                                        <video
                                                    src={message.message}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        borderRadius: "10px",
                                                    }}
                                                >
                                                    This browser doesn't support this video.
                                                </video>
                                            )
                                            :
                                        tabValue == 1 ? 
                                            <InsertDriveFileRounded
                                                sx={{
                                                    color : "white",
                                                    fontSize : "80px",
                                                }}
                                            />
                                        :
                                        tabValue == 2 ? 
                                            <HeadsetRounded
                                                sx={{
                                                    color : "white",
                                                    fontSize : "80px",
                                                }}
                                                />
                                                :
                                            <MicRounded
                                                sx={{
                                                    color : "white",
                                                    fontSize : "80px",
                                                }}
                                            />
                                        }
                                        <ImageListItemBar
                                            sx={{
                                                background:
                                                'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
                                                'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                                            }}
                                            title={formatSmartDate(message.createdAt)}
                                            position="top"
                                            actionIcon={
                                                <IconButton
                                                sx={{ color: 'white' }}
                                                >
                                                    <StarBorder />
                                                </IconButton>
                                            }
                                            actionPosition="left"
                                            />
                                        <Tooltip title={message.fileName} placement="bottom">
                                        <ImageListItemBar
                                            title={message.fileName}
                                            subtitle={
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                    width="100%"
                                                >
                                                <Typography 
                                                    variant="body2"
                                                    color="white"
                                                    fontWeight="bold"
                                                    width="70%"
                                                    whiteSpace="nowrap"
                                                    overflow="hidden"
                                                    textOverflow="ellipsis"
                                                >
                                                    {message.sender === selecteduser.userName ? message.sender : "You"}
                                                </Typography>
                                                <Typography 
                                                    fontSize={12}
                                                    color="white"
                                                >
                                                    {message.fileSize}
                                                </Typography>
                                                </Box>
                                            }

                                            position="bottom"
                                        />
                                        </Tooltip>
                                        </ImageListItem>)}
                            }))}
                            </ImageList>
                        </Box>
                    </List>
                    
                </Box>
            </Drawer>

            <Dialog 
                open={manageUserState.dialog}
            >
                {manageUserState.action.length > 0 &&
                <DialogTitle
                    variant="h5"
                    sx={{
                        background : "#212121",
                        color : "white"
                    }}
                >
                    {manageUserState.action.startsWith("Clear") ?
                        "Clear Chat"
                    :
                    manageUserState.action.startsWith("Block") || manageUserState.action.startsWith("Unblock") ?
                        "Block User"
                    :
                        "Delete Chat"
                    }
                </DialogTitle>}
                {manageUserState.action.length > 0 &&
                <DialogContent
                    sx={{
                        background : "#212121",
                    }}
                >
                    <DialogContentText
                        sx={{
                            color : "white"
                        }}
                    >
                        <span
                            style={{ fontSize : "18px" }}
                        >
                            Are you sure you want to&nbsp;
                            {manageUserState.action.startsWith("Clear") ?
                                "clear the chat"
                            :
                            manageUserState.action.startsWith("Block") || manageUserState.action.startsWith("Unblock") ?
                                "block the user"
                            :
                                "delete the chat"
                            }
                            ?
                        </span>
                        <br/>
                        {!(manageUserState.action.startsWith("Block") || manageUserState.action.startsWith("Unblock")) &&
                            <strong><br/>This action is final. Deleted chats can’t be retrieved,<br/>So please confirm!</strong>
                        }
                    </DialogContentText>
                </DialogContent>}
                {manageUserState.action.length > 0 &&
                <DialogActions
                    sx={{
                        background : "#212121",
                        display : "flex",
                        flexDirection : manageUserState.action.startsWith("Delete") ? "column-reverse" : "row",
                        alignItems : manageUserState.action.startsWith("Delete") ? "end" : "center",
                    }}
                >
                    <Button
                        sx={{
                            color : "white",
                            ":hover" : {
                                background : "#424242"
                            }
                        }}
                        onClick={() => {
                            setManageUserState({
                                dialog : false,
                                action : "",
                                button : false,
                                button2 : false
                            });
                        }}
                    >
                        Cancel
                    </Button>
                    {manageUserState.action.startsWith("Clear") ?
                        <Button
                            color="error"
                            onClick={manageClearChat}
                            sx={{
                                color : manageUserState.button ? "grey" : "",
                                pointerEvents : manageUserState.button ? "none" : ""
                            }}
                        >
                            {manageUserState.action}
                            {manageUserState.button &&
                                <CircularProgress
                                    size={25}
                                    color="error"
                                    sx={{
                                        position : "absolute"
                                    }}
                                />
                            }
                        </Button>
                    :
                    manageUserState.action.startsWith("Block") || manageUserState.action.startsWith("Unblock") ?
                        <Button
                            color="error"
                            onClick={manageBlockState}
                            sx={{
                                color : manageUserState.button ? "grey" : "",
                                pointerEvents : manageUserState.button ? "none" : ""
                            }}
                        >
                            {manageUserState.action}
                            {manageUserState.button &&
                                <CircularProgress
                                    size={25}
                                    color="error"
                                    sx={{
                                        position : "absolute"
                                    }}
                                />
                            }
                        </Button>
                    :
                        <>
                            <Button
                                color="error"
                                onClick={() => manageDeleteConnection(false)}
                                sx={{
                                    color : manageUserState.button ? "grey" : "",
                                    pointerEvents : manageUserState.button ? "none" : ""
                                }}
                            >
                                {manageUserState.action}
                                {manageUserState.button &&
                                    <CircularProgress
                                        size={25}
                                        color="error"
                                        sx={{
                                            position : "absolute"
                                        }}
                                    />
                                }
                            </Button>
                            <Button
                                color="error"
                                onClick={() => manageDeleteConnection(true)}
                                sx={{
                                    color : manageUserState.button2 ? "grey" : "",
                                    pointerEvents : manageUserState.button2 ? "none" : ""
                                }}
                                disabled={(selecteduser.userName1 == selecteduser.userName && selecteduser.blockedByUser2) || (selecteduser.userName2 == selecteduser.userName && selecteduser.blockedByUser1)}
                            >
                                Block and Delete Chat
                                {manageUserState.button2 &&
                                    <CircularProgress
                                        size={25}
                                        color="error"
                                        sx={{
                                            position : "absolute"
                                        }}
                                    />
                                }
                            </Button>
                        </>
                    }
                </DialogActions>}
            </Dialog>
        </Box>
    )
};

export default ChatPageNavBar;