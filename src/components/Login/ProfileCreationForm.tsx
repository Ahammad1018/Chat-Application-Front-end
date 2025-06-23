import { AddPhotoAlternateRounded, ArrowForward } from "@mui/icons-material";
import { Box, Button, ButtonBase, CardContent, CircularProgress, IconButton, TextField } from "@mui/material";

const ProfileCreationForm = (
        { profileSelectionState, setProfileSelectionState, handleClose, handleFileChange, fileInputRef, handleClick, ImageData, sendEmail_NewUser, buttonState } :
        { profileSelectionState : any, setProfileSelectionState : any, handleClose : any, handleFileChange : any, fileInputRef : any, handleClick : any, ImageData : any, sendEmail_NewUser : any, buttonState : any}
    ) => {
    return(
        <CardContent
                sx={{
                    display : "flex",
                    flexDirection : "column",
                    alignItems : "center",
                    justifyContent : "start",
                    position : "relative",
                }}
        >
            <Box
                sx={{
                    width : {
                        xs : "150px",
                        md : "150px",
                        lg : "200px",
                    },
                    height : {
                        xs : "150px",
                        md : "150px",
                        lg : "200px",
                    },
                    border : "solid 1px grey",
                    borderRadius : "50%",
                    position : "absolute",
                    top : {
                        xs : "-20%",
                        sm : "-20%",
                        md : "-25%",
                        lg : "-30%"
                    },
                }}
            >
                <img 
                    src={profileSelectionState.profileImg}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                    alt="Profile Image"
                    width="100%"
                    height="100%"
                    style={{
                        borderRadius : "50%",
                        objectFit : "cover",
                    }}
                />
                <>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <IconButton
                    onClick={handleClick}
                    sx={{
                        position : "absolute",
                        top : "70%",
                        left : "70%",
                        color : "grey",
                        background : "#f7f7f7",
                        border : "solid 1px lightgrey",
                        "&:hover" : {
                            background : "lightgrey",
                        }
                    }}
                >
                    <AddPhotoAlternateRounded
                        sx={{
                            fontSize : "30px",
                        }}
                    />
                </IconButton>
                </>
            </Box>

            <Box
                sx={{
                    display : "grid",
                    gridTemplateColumns : "repeat(5, 1fr)",
                    marginTop : "25%",
                }}
            >
                {ImageData.map((image : any, index : any) => {
                    return (
                        <ButtonBase
                            sx={{
                                borderRadius : "50%",
                                margin : "8px 10px",
                                width : "50px",
                                height : "50px",
                            }}
                        >
                        <img 
                            onContextMenu={(e) => e.preventDefault()}
                            key={index}
                            src={image.src}
                            alt={image.alt}
                            width="100%"
                            height="100%"
                            className="rounded-full"
                            draggable="false"
                            onClick={() => {
                                fileInputRef.current!.value = "";
                                setProfileSelectionState((prev : any) => ({
                                    ...prev,
                                    profileImg : image.src,
                                    imageAlt : image.alt,
                                })
                            )}}
                            style={{
                                border : "solid 1px grey",
                            }}
                        />
                        </ButtonBase>
                    );
                })}
            </Box>

            <TextField
                label="Enter username"
                value={profileSelectionState.userName}
                onChange={(e) => {
                    setProfileSelectionState((prev : any) => ({
                        ...prev,
                        userName : e.target.value,
                        userNameError : false,
                    }));
                }}
                error={profileSelectionState.userNameError}
                sx={{
                    width : "100%",
                    margin : "6% 0",
                    background : '#f7f7f7',
                    color : "black"
                }}
            />

            <Box
                sx={{
                    display : "flex",
                    justifyContent : "space-between",
                    alignItems : "center",
                    width : "100%",
                }}
            >
                <Button
                    sx={{
                        color : "#424242",
                        border : "solid 1px #424242",
                        width : "30%",
                        height : "50px",
                        fontSize : "15px",
                    }}
                    onClick={handleClose}
                >
                    Back
                </Button>

                <Button 
                    variant="contained"
                    disabled={buttonState.signUpButton}
                    onClick={sendEmail_NewUser}
                    sx={{
                        position : "relative",
                        width : "65%",
                        height : "50px",
                        fontSize : "15px",
                        backgroundColor : "#424242",
                    }}
                    >
                    Create
                    <ArrowForward sx={{
                        position : "absolute",
                        right : "10px",
                        fontSize : "20px",
                    }}/>
                    
                    {buttonState.signUpButton &&
                    <CircularProgress
                        size={30}
                        sx={{
                            position : "absolute",
                            color : "black"
                        }}
                    />}

                </Button>
            </Box>
            
        </CardContent>
    );
};

export default ProfileCreationForm;