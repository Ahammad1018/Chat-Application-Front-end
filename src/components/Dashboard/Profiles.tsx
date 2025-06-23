import React from "react";
import { AddPhotoAlternateOutlined, AlternateEmailRounded, ArrowBackRounded, ArrowForwardRounded, CloseRounded, HeadsetRounded, HttpsOutlined, ImageRounded, InsertDriveFileRounded, LockRounded, LogoutRounded, MailOutlineRounded, MicRounded, SearchRounded, VideocamRounded, VisibilityOffRounded, VisibilityRounded } from "@mui/icons-material";
import { AppBar, Avatar, Box, Button, ButtonBase, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, IconButton, InputAdornment, List, ListItem, ListItemIcon, TextField, Toolbar, Tooltip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ConnectionContext } from "../API/Connection";
import { highlightPart } from "../HighlightPart";
import { extractTime, formatSmartDate } from "./MessageData";
import { UserContext } from "../API/Users";
import { defaultImage, ImageData } from "../ExternalData";
import { disconnectWebSocket } from "../API/WebSocket";
import { isValidEmail } from "../Login/LoginPage";

const Profiles = ({ userDetails, setUserDetails, handleShowSnackbar, userDataState, setUserDataState, selectedUser, changeUserStatus, stompClientRef, isSmallScreen } : 
    { userDetails : any, setUserDetails : any,  handleShowSnackbar : any, userDataState : any, setUserDataState : any, selectedUser : any, changeUserStatus : any, stompClientRef : any, isSmallScreen : any }) => {

    const { getSearchedusers, chatOpened } = React.useContext<any>(ConnectionContext);
    const { changeUserPassword, updateProfilePicture, inviteNewUser } = React.useContext<any>(UserContext);
    const navigate = useNavigate();
    const [openProfileDrawer, setOpenProfileDrawer] = React.useState<boolean>(false);
    const profileImgRef = React.useRef<HTMLInputElement>(null);
    const [logoutState, setLogoutState] = React.useState<any>({
        logout : false,
        button : false,
    });
    const [profileImagUploadingState, setProfileImageUploadingState] = React.useState<any>({
        profileImagUploading : false,
        profileImage : null,
    });
    const [selectingUserState, setSelectingUserState] = React.useState<{
        selectingUser : boolean,
        selectedUser : any
    }>({
        selectingUser : false,
        selectedUser : null
    });
    const [changePasswordState, setChangePasswordState] = React.useState<{
        dialog : boolean;
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
        passwordVisibility : number;
        currentPasswordError : boolean;
        passwordError : boolean; 
        button : boolean;
    }>({
        dialog : false,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        passwordVisibility : -1,
        currentPasswordError : false,
        passwordError : false,
        button : false,
    });
    const [inviteState, setInviteState] = React.useState<any>({
        invite : null,
        button : false
    });


    const handleCopy = (type : any, text : any) => {
        navigator.clipboard.writeText(text)
        .then(() => handleShowSnackbar(`${type} Copied`))
        .catch(e => {
            handleShowSnackbar(`Failed to copy ${type}`);
            console.info(e);
        });
    };

    const fetchSearchedUsers = async (newUsers : boolean) => {

        setUserDataState((prev : any) => ({
            ...prev,
            fetchSearch : true
        }));

        if (newUsers) {

            if (isValidEmail(userDataState.searchedData.replace("@", "")) && userDataState.searchedData.replace("@", "") == userDetails.email){
                handleShowSnackbar("Hey! You’re already here 😄 — searching your own email isn’t needed.");
                setUserDataState((prev : any) => ({
                    ...prev,
                    fetchSearch : false,
                    searchedData : "",
                }));
                return;
            }

            const res = await getSearchedusers(userDataState.searchedData.replace("@", ""));
            if (res.status == 200){
                setUserDataState((prev : any) => ({
                    ...prev,
                    usersData : res.data
                }));
            } else if (res.status == 204) {
                if (isValidEmail(userDataState.searchedData.replace("@", ""))){
                    const data = {
                        userName : userDataState.searchedData.replace("@", ""),
                        status : "newUser",
                        profilePicture : defaultImage,
                        lastSeen : null
                    };
                    setUserDataState((prev : any) => ({
                        ...prev,
                        usersData : [data]
                    }));
                } else {
                    handleShowSnackbar("No user found!");
                    setUserDataState((prev : any) => ({
                        ...prev,
                        usersData : []
                    }));
                }
            } else if (res.status == 401) {
                sessionStorage.clear();
                navigate("/login");
                handleShowSnackbar("Your session has expired or an error occurred. Please log in again.");
            } else {
                handleShowSnackbar("Failed to fetch user. Please try again.");
                setUserDataState((prev : any) => ({
                    ...prev,
                    usersData : []
                }));
            }
        } else {
            setUserDataState((prev : any) => ({
                ...prev,
                usersData : prev.connectionsData.filter((data : any) =>
                                data.userName.startsWith(prev.searchedData)
                            )
            }));
        }

        setUserDataState((prev : any) => ({
            ...prev,
            fetchSearch : false
        }));
    }

    const selectUser = async (data : any) => {
        sessionStorage.setItem("Selected_User", data.userName);
        setSelectingUserState(prev => ({
            ...prev,
            selectingUser : true,
            selectedUser : data
        }));

        let prevUserName = "None";
        if (userDataState.selectedUser) {
            prevUserName = userDataState.selectedUser.userName;
        }

        const res = await chatOpened(data.userName, prevUserName, data.unReadMsgsOfUser1 || "0");
        if (res.status == 200 || res.status == 204) {
            setUserDataState((prev : any) => ({
                ...prev,
                selectedUser : data
            }));
        } else {
            handleShowSnackbar("Oops! Something went wrong. Please try again later.")
        }
        setSelectingUserState(prev => ({
            ...prev,
            selectingUser : false
        }));
    }

    const handleChangePassword = async () => {
        
        if (changePasswordState.currentPassword.length < 1) {
            handleShowSnackbar("Uh-oh! Please enter your current password.");
            setChangePasswordState(prev => ({
                ...prev,
                currentPasswordError : true
            }));
            return;
        }

        if (changePasswordState.newPassword.length < 1 || changePasswordState.confirmPassword.length < 1) {
            handleShowSnackbar("Uh-oh! Please enter your new password and confirm password.");
            setChangePasswordState(prev => ({
                ...prev,
                passwordError : true
            }));
            return;
        }

        if (changePasswordState.newPassword.length < 8 || changePasswordState.confirmPassword.length < 8) {
            handleShowSnackbar("Hmm, that password is too short. Try adding a few more characters.");
            setChangePasswordState(prev => ({
                ...prev,
                passwordError : true
            }));
            return;
        }

        if (changePasswordState.newPassword.length != changePasswordState.confirmPassword.length || changePasswordState.newPassword != changePasswordState.confirmPassword) {
            handleShowSnackbar("Uh-oh! The new password and confirm password do not match.");
            setChangePasswordState(prev => ({
                ...prev,
                passwordError : true
            }));
            return;
        }

        if (changePasswordState.currentPassword == changePasswordState.newPassword) {
            handleShowSnackbar("Uh-oh! The new password cannot be the same as the current password.");
            setChangePasswordState(prev => ({
                ...prev,
                currentPasswordError : true,
                passwordError : true,
            }));
            return;
        }
        setChangePasswordState(prev => ({
            ...prev,
            button : true,
        }));
        const res = await changeUserPassword(changePasswordState.currentPassword, changePasswordState.newPassword);
        if (res && res.status == 201) {
            handleShowSnackbar("You're good to go! Your password was updated.");
            handleChangePasswordDialogClose();
        } else if (res && res.status == 401) {
            handleShowSnackbar("Uh-oh! That current password doesn't look right.");
        } else {
            handleShowSnackbar("Oops!, something didn’t go as planned. Please try again.");
        }
        setChangePasswordState(prev => ({
            ...prev,
            button : false,
        }));
    }

    const handleChangePasswordDialogClose = () => {
        setChangePasswordState({
            dialog : false,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            passwordVisibility : -1,
            currentPasswordError : false,
            passwordError : false,
            button : false,
        });
    }

    const handleClickProfileImage = () => {
        if (profileImgRef.current) {
            profileImgRef.current.click();
        }
    }

    const handleProfileImgChange = async (e : React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith("image/")) {
                handleShowSnackbar("Hmm, that file doesn’t seem to be an image. Give it another shot with a proper one.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                handleShowSnackbar("Oops! The image you selected is too large. Try one under 5MB.");
                return;
            }

            setProfileImageUploadingState((prev : any) => ({
                ...prev,
                profileImage : file
            }));
            profileImgRef.current!.value = "";
        }
    }

    const handleChangeImage = async () => {
        setProfileImageUploadingState((prev : any) => ({
            ...prev,
            profileImagUploading : true
        }));

        const isDefaultImage = ImageData.some(image => image.src === userDetails.profilePicture);

        const formData = new FormData();
        formData.append("profilePicture", profileImagUploadingState.profileImage);
        formData.append("oldUrl", isDefaultImage ? "default" : userDetails.profilePicture);
        formData.append("fileType", "image");

        setProfileImageUploadingState((prev : any) => ({
            ...prev,
            profileImage : null
        }));

        const res = await updateProfilePicture(formData);
        if (res && res.status === 201) {
            const userDataStr = sessionStorage.getItem("UserData");
            const user = userDataStr ? JSON.parse(userDataStr) : null;
            if (user) {
                user.profilePicture = res.data;
                sessionStorage.setItem("UserData", JSON.stringify(user));
                setUserDetails(user);
            }
            handleShowSnackbar("You’ve successfully updated your profile picture.");
        } else {
            handleShowSnackbar("Oops! Something went wrong. Please try again later.");
        }
        setProfileImageUploadingState((prev : any) => ({
            ...prev,
            profileImagUploading : false
        }));
        profileImgRef.current!.value = "";
    }

    const handleLogout = async () => {
        setLogoutState((prev : any) => ({
            ...prev,
            button : true
        }));
        disconnectWebSocket(stompClientRef);
        await changeUserStatus("offline");
        sessionStorage.clear();
        navigate("/login");
        handleShowSnackbar("You have been logged out successfully.");
        setLogoutState({
            logout : false,
            button : false
        });
    }

    const handleInvite = async () => {
        setInviteState((prev : any) => ({
            ...prev,
            button : true,
        }))
        const inviteLink = window.location.origin + "/login";
        const res = await inviteNewUser(inviteLink, inviteState.invite);
        if (res && res.status == 200) {
            handleShowSnackbar("Your invite has been Sent Successfully! 🎉");
            setTimeout(() => {
                handleShowSnackbar("The recipient will receive an email shortly with a special link to join ChatApp and connect with you.");
            }, 1000);

            setTimeout(() => {
                handleShowSnackbar("Thanks for helping grow our community! We’re excited to welcome them on board!");
            }, 2000);
        } else {
            handleShowSnackbar("Oops! Something Went Wrong. It looks like there was an issue sending the invitation.😕");
            setTimeout(() => {
                handleShowSnackbar("Please check the email address and try again.");
            }, 500);
        }
        setInviteState({
            invite : null,
            button : false,
        });
        setUserDataState((prev : any) => ({
            ...prev,
            searchedData : "",
            usersData : prev.connectionsData,
            onSearch : false
        }))
    };

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                overflow : "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#6b6b6b #212121",
            }}>
            
            <Box
                sx={{
                    width: "99.5%",
                    height: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    position : "sticky",
                    top : "0",
                    background : "#212121",
                    zIndex : "1"
                }}>
                <IconButton
                    onClick={() => setOpenProfileDrawer(true)}
                    sx={{
                        width : "45px",
                        height : "45px",
                    }}
                >
                    <Avatar
                        src={userDetails.profilePicture}
                        sx={{
                            width : "45px",
                            height : "45px",
                        }}
                    />
                </IconButton>
                <TextField
                    placeholder="Search"
                    value={userDataState.searchedData}
                    onChange={(e) => {
                        setUserDataState((prev : any) => ({
                            ...prev,
                            searchedData : e.target.value,
                            onSearch : true
                        }));

                        if (!e.target.value.startsWith("@") && e.target.value.length > 0){
                            fetchSearchedUsers(false);
                        } else if (e.target.value.length < 1){
                            setUserDataState((prev : any) => ({
                                ...prev,
                                usersData : prev.connectionsData,
                                onSearch : false
                            }))
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key == "Enter" && userDataState.searchedData.startsWith("@")){
                            fetchSearchedUsers(true);
                        }}}
                    variant="outlined"
                    sx={{
                        backgroundColor : "#303030",
                        borderRadius : "50px",
                        width : isSmallScreen ? "90%" : "80%",
                        height : "50px",
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
                            <InputAdornment position="start"
                            >
                                <SearchRounded
                                    sx={{
                                        color : "white",
                                        fontSize : "30px",
                                        height : "40px"
                                    }}
                                />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                {userDataState.fetchSearch ?
                                <CircularProgress
                                    size={25}
                                    sx={{
                                        color : "white"
                                    }}
                                />
                                :
                                userDataState.searchedData.length > 0 &&
                                <IconButton
                                    onClick={() => setUserDataState((prev : any) => ({
                                        ...prev,
                                        searchedData : "",
                                        usersData : prev.connectionsData,
                                        onSearch : false
                                    }))}
                                >
                                    <CloseRounded
                                        sx={{
                                            color : "white",
                                        }}
                                    />
                                </IconButton>}
                            </InputAdornment>
                        ),
                        sx: {
                            height: 50,
                        },
                    }}
                />
            </Box>

            {userDataState.usersData.length > 0 
            &&
            userDataState.usersData.filter((data : any) => !(
                (data.userName1 == userDetails.userName && data.connectionDeletedByUser1) 
                || 
                (data.userName2 == userDetails.userName && data.connectionDeletedByUser2))).length > 0
            ? 
                userDataState.usersData.map((data : any, id : any) => {

                    if ((data.userName1 == userDetails.userName && data.connectionDeletedByUser1) || (data.userName2 == userDetails.userName && data.connectionDeletedByUser2)){
                        return null;
                    }

                    const isUser = userDetails.userName != data.userName1;
                    const lastConversation = isUser ? data.user1LastConversation : data.user2LastConversation;
                    const lastConversationAt = isUser ? data.user1LastConversationAt : data.user2LastConversationAt;
                    const lastConversationType = isUser ? data.user1LastConversationType : data.user2LastConversationType;

                    return (
                    <React.Fragment key={id}>
                    <ButtonBase key={id}
                        onClick={() => !(userDataState.onSearch && data.status == "newUser") && selectUser(data)}
                        sx={{
                            width: "98%",
                            marginLeft: "1%",
                            height: "80px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0 10px",
                            cursor : "pointer",
                            borderRadius: "10px",
                            background: selectedUser && data.userName == selectedUser.userName ? "linear-gradient(to right, rgba(192,212,219,255), rgba(202,217,212,255))" : "",
                            "&:hover": {
                                backgroundColor: userDataState.onSearch && data.status == "newUser" ? "" : "#252525",
                            },
                        }}>
                        <Avatar
                            src={data.profilePicture}
                        />
                        <Box 
                            sx={{
                                width : isSmallScreen ? "85%" : "65%",
                                display : "flex",
                                flexDirection : "column",
                                alignItems : "flex-start",
                                justifyContent : "center"
                            }}>
                            <Typography
                                color="white"
                                sx={{
                                    fontWeight : "bold"
                                }}
                            >
                                {userDataState.onSearch && !userDataState.searchedData.startsWith("@") ? 
                                    highlightPart(data.userName, userDataState.searchedData) : 
                                    data.userName
                                }
                            </Typography>
                            <Typography
                                color={selectedUser && data.userName == selectedUser.userName ? "white" : "#a2a2a2"}
                                fontSize={14}
                                sx={{
                                    overflow : "hidden",
                                    textOverflow : "ellipsis",
                                    textWrap : "nowrap",
                                    maxWidth : "105%"
                                }}
                            >
                                {userDataState.onSearch && userDataState.searchedData.startsWith("@") ? 
                                    highlightPart(`@${data.userName}`, userDataState.searchedData) : 
                                    lastConversationType == "text" ?
                                        lastConversation
                                        // <Typography>
                                        //     <Typography color="error" variant="caption">Draft: </Typography>
                                        //     {lastConversation + lastConversation + lastConversation}
                                        // </Typography>
                                        :
                                    lastConversationType && lastConversationType.startsWith("image") ?
                                        <Box
                                            sx={{
                                                height : "100%",
                                                display : "flex",
                                                alignItems : "center",
                                            }}
                                        >
                                            <ImageRounded
                                                sx={{
                                                    marginRight : "5px",
                                                }}
                                            />
                                            Photo
                                        </Box>
                                        :
                                    lastConversationType && lastConversationType.startsWith("audio") ?
                                        <Box
                                            sx={{
                                                height : "100%",
                                                display : "flex",
                                                alignItems : "center",
                                            }}
                                        >
                                        {lastConversationType == "audio/webm" ?
                                            <MicRounded
                                                sx={{
                                                    marginRight : "5px",
                                                }}
                                            />
                                            :
                                            <HeadsetRounded
                                                sx={{
                                                    marginRight : "5px",
                                                }}
                                            />}
                                            Audio
                                        </Box>
                                        :
                                    lastConversationType && lastConversationType.startsWith("video") ?
                                        <Box
                                            sx={{
                                                height : "100%",
                                                display : "flex",
                                                alignItems : "center",
                                            }}
                                        >
                                            <VideocamRounded
                                                sx={{
                                                    marginRight : "5px",
                                                }}
                                            />
                                            Video
                                        </Box>
                                        :
                                        lastConversationType &&
                                        <Box
                                            sx={{
                                                height : "100%",
                                                display : "flex",
                                                alignItems : "center",
                                            }}
                                        >
                                            <InsertDriveFileRounded
                                                sx={{
                                                    marginRight : "5px",
                                                }}
                                            />
                                            File
                                        </Box>
                                }
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                width: "51px",
                                height: "60%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "end",
                                justifyContent: "space-around",
                            }}>
                            {userDataState.onSearch && data.status == "newUser" &&
                                <Button
                                    onClick={() => setInviteState((prev : any) => ({
                                        ...prev,
                                        invite : data.userName
                                    }))}
                                    sx={{
                                        width: "100%",
                                        height: "30px",
                                        fontSize: "12px",
                                    }}
                                >
                                    Invite
                                </Button>
                            }
                            {!(userDataState.onSearch && userDataState.searchedData.startsWith("@")) &&
                            <>
                                <Typography
                                    color="white"
                                    sx={{
                                        fontSize: "11px",
                                    }}>
                                    {lastConversationAt ? 
                                        formatSmartDate(lastConversationAt) == "Today" 
                                            ? extractTime(lastConversationAt) 
                                            : formatSmartDate(lastConversationAt)
                                    : ""}
                                </Typography>
                                {!selectingUserState.selectingUser ?
                                <Box
                                    sx={{
                                        width: data.unReadMsgsOfUser1 < 100 ? "25px" : "30px",
                                        height: "20px",
                                        background: (userDataState.selectedUser && userDataState.selectedUser.userName == data.userName || data.unReadMsgsOfUser1 == 0) ? "transparent" : "grey",
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "12px",
                                    }}>
                                    {userDataState.selectedUser && userDataState.selectedUser.userName == data.userName ? "" : data.unReadMsgsOfUser1 == 0 ? "" : data.unReadMsgsOfUser1 < 100 ? data.unReadMsgsOfUser1 : "99+"}
                                </Box>
                                :
                                selectingUserState.selectedUser && selectingUserState.selectedUser.userName == data.userName && 
                                <CircularProgress
                                    size={20}
                                    sx={{
                                        color : "white"
                                    }}
                                />}
                            </>}
                        </Box>
                    </ButtonBase>
                    <Divider 
                        sx={{borderColor : "#323232"}}
                    />
                    </React.Fragment>
                    )
                })
            :
            <Box
                sx={{
                    width : "90%",
                    height : "90%",
                    marginLeft : "5%",
                    display : "flex",
                    alignItems : "center",
                    justifyContent : "center"
                }}
            >
                <Typography
                    sx={{
                        color : "grey",
                        textAlign : "center"
                    }}
                >
                    <strong>No connections found.</strong><br/>
                    Discover people by searching with @Name.
                </Typography>
            </Box>
            }

            <Drawer
                open={openProfileDrawer}
                onClose={() => setOpenProfileDrawer(false)}
                anchor="left"
            >
                <Box
                    sx={{
                        background : "#0f0f0f",
                        width : "100%",
                        height : "100%"
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
                                justifyContent : "space-between",
                            }}
                        >
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={() => setOpenProfileDrawer(false)}
                                sx={{
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
                                Settings
                            </Typography>
                            <Tooltip
                                title="Logout"
                                arrow
                            >
                                <IconButton
                                    onClick={() => {
                                        setLogoutState((prev : any) => ({
                                            ...prev,
                                            logout : true
                                        }));
                                        setOpenProfileDrawer(false);
                                    }}
                                    color="inherit"
                                    sx={{
                                        ":hover" : {
                                            bgcolor : "#333333"
                                        }
                                    }}
                                >
                                    <LogoutRounded/>
                                </IconButton>
                            </Tooltip>
                        </Toolbar>
                    </AppBar>
                    <Box
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
                        <input 
                            ref={profileImgRef}
                            type="file" 
                            accept="image/*" 
                            style={{
                                display : "none"
                            }}
                            onChange={handleProfileImgChange}
                        />
                        <img
                            src={userDetails.profilePicture}
                            width="75%"
                            height="75%"
                            style={{
                                borderRadius : "50%",
                                opacity : profileImagUploadingState.profileImagUploading ? "0.1" : "1"
                            }}
                        />
                        {profileImagUploadingState.profileImagUploading && 
                        <CircularProgress
                            thickness={2}
                            size={150}
                            sx={{
                                position : "absolute",
                                color : "white",
                                opacity : "1",
                                zIndex : "1"
                            }}
                        />}
                        <IconButton
                            disabled={profileImagUploadingState.profileImagUploading}
                            onClick={handleClickProfileImage}
                            sx={{
                                color : "white",
                                position : "absolute",
                                width : "76%",
                                height : "76%",
                                ":hover" : {
                                    backgroundColor: "rgba(0, 0, 0, 0.3)", /* dark tint */
                                    backdropFilter : "blur(1px) brightness(0.7)",
                                },
                                ":hover .profile-add-photo-icon" : {
                                    opacity : "1"
                                }
                            }}
                        >
                            <AddPhotoAlternateOutlined
                                className="profile-add-photo-icon"
                                sx={{
                                    fontSize : "100px",
                                    opacity : "0"
                                }}
                            />
                        </IconButton>
                    </Box>

                    <List
                    sx={{ 
                            width: 360,
                        }}
                    >
                       {[0, 1, 2].map((id) => {
                        return(
                            <>
                            <ButtonBase
                                    sx={{
                                        width : "100%"
                                    }}
                                    onClick={() => {
                                        if (id == 0){
                                            handleCopy("Username", `@${userDetails.userName}`);
                                        } else if (id == 1) {
                                            handleCopy("Email", userDetails.email);
                                        } else {
                                            setOpenProfileDrawer(false);
                                            setChangePasswordState(prev => ({
                                                ...prev,
                                                dialog : true
                                            }));
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
                                    /> : id == 1 ?
                                    <MailOutlineRounded
                                        sx={{
                                            color : "white"
                                        }}
                                    />
                                    :
                                    <HttpsOutlined
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
                                    <Typography>
                                        {id == 0 ? 
                                            "@" + userDetails.userName 
                                            : id == 1 ?
                                            userDetails.email
                                            :
                                            "Change Password"
                                        }
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color : "grey",
                                            fontSize : "15px"
                                        }}
                                    >
                                        {id == 0 ? "Username" : id == 1 ? "Email" : ""}
                                    </Typography>
                                </ListItem>
                            </ButtonBase>
                            <Divider/>
                            </>
                        )})}
                    </List>                    
                </Box>
            </Drawer>

            <Dialog
                open={changePasswordState.dialog}
            >
                <DialogTitle
                    variant="h5"
                    sx={{
                        textAlign : "center",
                        bgcolor : "#222222",
                        color : "white",
                    }}
                >
                    Change Password
                </DialogTitle>
                <IconButton
                    onClick={handleChangePasswordDialogClose}
                    sx={{
                        position : "absolute",
                        top : "10px",
                        right : "10px",
                    }}
                >
                    <CloseRounded
                        sx={{
                            fontSize : "30px",
                            color : "white",
                        }}
                    />
                </IconButton>
                <DialogContent
                    sx={{
                        bgcolor : "#222222",
                    }}
                >
                    <DialogContentText
                        sx={{
                            textAlign : "center",
                            color : "white",
                        }}
                    >
                        Ready to change your password?<br/>Just enter your current one and choose a new password you'd like to use.
                    </DialogContentText>
                    {[0, 1, 2].map(id => {
                        return (
                            <TextField
                                placeholder={id == 0 ? "Current Password" : id == 1 ? "New Password" : "Confirm New Password"}
                                type={changePasswordState.passwordVisibility == id ? "text" : "password"}
                                variant="outlined"
                                fullWidth
                                color="black"
                                error={id == 0 ? changePasswordState.currentPasswordError : changePasswordState.passwordError}
                                value={id == 0 ? changePasswordState.currentPassword : id == 1 ? changePasswordState.newPassword : changePasswordState.confirmPassword}
                                onChange={(e) => {
                                    setChangePasswordState((prev) => ({
                                        ...prev,
                                        [id == 0 ? "currentPassword" : id == 1 ? "newPassword" : "confirmPassword"]: e.target.value,
                                        [id == 0 ? "currentPasswordError" : "passwordError"]: false
                                    }));
                                }}
                                sx={{
                                    marginTop : "30px",
                                    backgroundColor : "#303030",
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            // border: "black",
                                            color : "white",
                                        },
                                        color : "white",
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'grey',     // border color when focused
                                    },
                                    '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'darkgrey', // border color on hover
                                    },
                                }}
                                InputProps={{
                                    endAdornment : (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setChangePasswordState((prev) => ({
                                                    ...prev,
                                                    passwordVisibility : prev.passwordVisibility == id ? -1 : id
                                                }))}
                                            >
                                                {changePasswordState.passwordVisibility == id ? 
                                                    <VisibilityOffRounded sx={{ color: "white" }} />
                                                    :
                                                    <VisibilityRounded sx={{ color: "white" }} />
                                                }
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        )
                    })}
                </DialogContent>
                <DialogActions
                    sx={{
                        bgcolor : "#222222"
                    }}
                >
                    <Button
                        disabled={changePasswordState.button}
                        onClick={handleChangePassword}
                        startIcon={
                            <LockRounded />
                        }
                        sx={{
                            width : "95%",
                            marginRight : "2.5%",
                            marginBottom : "10px",
                            bgcolor : "white",
                            color : "#222222",
                            height : "50px"
                        }}
                    >
                        Change Password
                        {changePasswordState.button &&
                            <CircularProgress
                                size={30}
                                sx={{
                                    color : "#222222",
                                    position : "absolute"
                                }}
                            />
                        }
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={logoutState.logout}
                sx={{
                    border : "none"
                }}
            >
                <DialogTitle
                    variant="h5"
                    sx={{
                        bgcolor : "#222222",
                        color : "white",
                        border : "none"
                    }}
                >
                    Logout
                </DialogTitle>
                <DialogContent
                    sx={{
                        bgcolor : "#222222",
                        border : "none"
                    }}
                >
                    <DialogContentText 
                        color="white"
                        sx={{
                            bgcolor : "#222222",
                            border : "none"
                        }}
                    >
                        Are you sure you want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions
                    sx={{
                        bgcolor : "#222222",
                        border : "none"
                    }}
                >
                    <Button
                        color="inherit"
                        sx={{
                            color : "lightgrey"
                        }}
                        onClick={() => setLogoutState((prev : any) => ({
                            ...prev, 
                            logout : false
                        }))}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        onClick={handleLogout}
                        disabled={logoutState.button}
                    >
                        Logout
                        {logoutState.button && <CircularProgress
                            size={30}
                            color="error"
                            sx={{
                                position : "absolute",
                            }}
                        />}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={inviteState.invite && inviteState.invite.length > 0}
            >
                <DialogTitle
                    variant="h6"
                    sx={{
                        bgcolor : "#222222",
                        color : "lightgrey",
                        textAlign : "center"
                    }}
                >
                    Invite <strong style={{ color : "white" }} >{inviteState.invite}</strong> to ChatApp!
                </DialogTitle>
                <DialogContent
                    sx={{
                        bgcolor : "#222222",
                        textAlign : "center",
                    }}
                >
                    <DialogContentText
                        sx={{
                            textAlign : "start",
                            color : "#aaaaaa",
                            marginTop : "15px"
                        }}
                    >
                        By inviting, your username will be shared with them — they’ll receive an email with a special link to join and connect with you instantly.<br/>
                        It’s quick, secure, and hassle-free.<br/><br/>
                        Before sending the invite, please double-check that the email address is correct and valid.<br/><br/>
                        Tip: Ask them to check spam or promotions if they don't see the email right away.<br/><br/>
                        Thank you for helping grow our community!
                    </DialogContentText>
                </DialogContent>
                <DialogActions
                    sx={{
                        bgcolor : "#222222"
                    }}
                >
                    <Button
                        onClick={() => setInviteState((prev : any) => ({
                            ...prev,
                            invite : null
                        }))}
                        color="inherit"
                        sx={{
                            bgcolor : "#222222",
                            color : "white",
                            border : "solid 1px white",
                            height : "50px",
                            width : "20%",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={inviteState.button}
                        onClick={handleInvite}
                        sx={{
                            bgcolor : "white",
                            color : "#222222",
                            height : "50px",
                            width : "25%",
                        }}
                    >
                        Invite
                        {inviteState.button &&
                            <CircularProgress
                                size={30}
                                sx={{
                                    position : "absolute",
                                    color : "black"
                                }}
                            />
                        }
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog 
                open={profileImagUploadingState.profileImage != null}
            >
                <DialogTitle
                    sx={{
                        background : "#222222",
                        color : "white",
                        fontWeight : "600"
                    }}
                >
                    Change Profile Picture
                </DialogTitle>
                <DialogContent
                    sx={{
                        background : "#222222",
                    }}
                >
                    <DialogContentText
                        color="lightgrey"
                        sx={{
                            margin : "15px 0"
                        }}
                    >
                        Are you sure, you want to change profile picture ?
                    </DialogContentText>
                    <Box
                        sx={{
                            marginTop : "30px",
                            display : "flex",
                            alignItems : "center",
                            justifyContent : "space-around"
                        }}
                    >
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <img
                                src={userDetails.profilePicture}
                                style={{
                                    width : "200px",
                                    height : "200px",
                                    borderRadius  :"50%",
                                    objectFit : "contain",
                                    border : "solid 1px grey",
                                    marginBottom : "10px"
                                }}
                            />
                            <Typography color="white">Old</Typography>
                        </Box>
                        <ArrowForwardRounded
                            sx={{
                                fontSize : "30px",
                                color : "white",
                                margin : "0 30px"
                            }}
                        />
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <img
                                src={profileImagUploadingState.profileImage && URL.createObjectURL(profileImagUploadingState.profileImage)}
                                style={{
                                    width : "200px",
                                    height : "200px",
                                    borderRadius  :"50%",
                                    objectFit : "contain",
                                    border : "solid 1px grey",
                                    marginBottom : "10px"
                                }}
                            />
                            <Typography color="white">New</Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions
                    sx={{
                        background : "#222222"
                    }}
                >
                    <Button
                        onClick={() => {
                            setProfileImageUploadingState((prev : any) => ({
                                ...prev,
                                profileImage : null
                            }));
                        }}
                        sx={{
                            background : "transparent",
                            color : "white",
                            height : "40px",
                            width : "100px",
                            border : "solid 1px white"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleChangeImage}
                        sx={{
                            background : "white",
                            color : "black",
                            height : "40px",
                            width : "100px"
                        }}
                    >
                        Change
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Profiles;