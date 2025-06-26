import * as React from 'react';
import { CloseRounded } from "@mui/icons-material";
import { Box, Button, Card, TextField, Typography, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, ButtonBase } from "@mui/material";
import { LoginContext } from '../API/login';
import { ImageData, defaultImage } from '../ExternalData';
import { useSnackbar } from 'notistack';
import LoginForm from './LoginForm';
import ProfileCreationForm from './ProfileCreationForm';
import ResetPasswordForm from './ResetPasswordForm';
import { useNavigate } from 'react-router-dom';

export const isValidEmail = (email : string) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    
    // Basic regex check
    if (!emailRegex.test(email)) return false;
    
    // Additional manual checks
    const [local, domain] = email.split('@');
    
    if (!local || !domain) return false;
    
    // Disallow starting/ending with dot, or consecutive dots
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
    
    // Disallow invalid domain characters
    if (/[^a-zA-Z0-9.-]/.test(domain)) return false;
    
    // Domain must not start or end with a hyphen
    const domainParts = domain.split('.');
    if (domainParts.some(part => part.startsWith('-') || part.endsWith('-'))) return false;
    
    return true;
}

const LoginPage = () => {
    const { userLogin, sendEmail, changePassword, validateOTP, createNewUser } = React.useContext<any>(LoginContext);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [otpTimer, setOtpTimer] = React.useState<number>(30);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [emailState, setEmailState] = React.useState<{
        value : string,
        error : boolean,
    }>({
        value : "",
        error : false,
    });

    const [passwordState, setpasswordState] = React.useState<{
        value : string,
        error : boolean,
        visible : boolean,
    }>({
        value : "",
        error : false,
        visible : false,
    });

    const [loginState, setLoginState] = React.useState<{
        newUser : boolean,
        forgotPassword : boolean,
        emailOtp : boolean,
        createNewPassword : boolean,
        newPasswordVisibile1 : boolean,
        newPasswordVisibile2 : boolean,
        confirmNewUserCreate : boolean,
    }>({
        newUser : false,
        forgotPassword : false,
        emailOtp : true,
        createNewPassword : false,
        newPasswordVisibile1 : false,
        newPasswordVisibile2 : false,
        confirmNewUserCreate : false,
    });

    const [newCredentialState, setNewCredentialState] = React.useState<{
        email : string,
        emailError : boolean,
        otp : string,
        otpError : boolean,
        otpSent : boolean,
        password : string,
        passwordError : boolean,
        confirmPassword : string,
        confirmPasswordError : boolean,
    }>({
        email : "",
        emailError : false,
        otp : "",
        otpError : false,
        otpSent : false,
        password : "",
        passwordError : false,
        confirmPassword : "",
        confirmPasswordError : false,
    })

    const [profileSelectionState, setProfileSelectionState] = React.useState<{
        profileImg : string,
        file : File | null,
        imageAlt : string,
        userName : string,
        userNameError : boolean,
        otp : string,
        otpError : boolean,
        verifyEmail : boolean,
    }>({
        profileImg : defaultImage,
        file : null,
        imageAlt : "Default Profile Image",
        userName : "",
        userNameError : false,
        otp : "",
        otpError : false,
        verifyEmail : false,
    });

    const [buttonState, setButtonState] = React.useState<{
        loginButton : boolean,
        signUpButton : boolean,
        forgotPasswordButton : boolean,
        otpButton : boolean,
        createNewPasswordButton : boolean,
        createNewUserButton : boolean,
    }>({
        loginButton : false,
        signUpButton : false,
        otpButton : false,
        forgotPasswordButton : false,
        createNewPasswordButton : false,
        createNewUserButton : false,
    });
      
    const handleLogin = async () => {
        
        if (!isValidEmail(emailState.value) || passwordState.value.length < 3) { 
            return
        }

        setButtonState(prev => ({
            ...prev,
            loginButton : true,
        }));

        const response = await userLogin(emailState.value, passwordState.value);
        if (response.status && response.status === 200) {
            navigate("/chat");
            handleShowSnackbar("Login successful");
            handleClose();
        } else if (response.status === 404) {
            setLoginState(prev => ({
                ...prev,
                confirmNewUserCreate : true,
            }));
        } else if (response.status == 401) {
            handleShowSnackbar("Invalid details. Please try again.");
        } else {
            handleShowSnackbar("Login failed. Please try again.");
        }

        setButtonState(prev => ({
            ...prev,
            loginButton : false,
        }));
    }

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

    const sendEmail_ForgotPassword = async () => {

        setButtonState(prev => ({
            ...prev,
            otpButton : true,
        }));

        if (!isValidEmail(newCredentialState.email)) {
            setNewCredentialState(prev => 
                ({...prev, emailError: true})
            );
        } else {
            const res = await sendEmail(newCredentialState.email);
            if (res.status && res.status === 201) {
                handleShowSnackbar("A verification code has been successfully sent to your email. It will expire in 5 minutes.");
                setNewCredentialState(prev => ({
                    ...prev,
                    otpSent : true,
                }));
            } else if (res.status && res.status === 404) {
                handleShowSnackbar("No account found with this email. Please check your email or sign up.");
            } else {
                handleShowSnackbar("Failed to send verification code. Please try again.");
            }
        }
        setButtonState(prev => ({
            ...prev,
            otpButton : false,
        }));
    }

    React.useEffect(() => {
        if (newCredentialState.otpSent) {
            if (otpTimer >= 0) {
                const timer = setTimeout(() => {
                    setOtpTimer(prev => prev - 1);
                }, 1000);
                return () => clearTimeout(timer);
            } else {
                setOtpTimer(30);
                setNewCredentialState(prev => ({
                    ...prev,
                    otpSent : false,
                }));
            }
        }
    },[otpTimer, newCredentialState.otpSent]);

    const handleChangePassword = async () => {

        setButtonState(prev => ({
            ...prev,
            createNewPasswordButton : true,
        }));

        if (newCredentialState.password != newCredentialState.confirmPassword) {
            handleShowSnackbar("Passwords do not match. Please try again.");
        } else {
            const res = await changePassword(newCredentialState.email, newCredentialState.password);
            if (res.status && res.status === 201) {
                handleShowSnackbar("Password changed successfully. You can now log in with your new password.");
                handleClose();
            } else if (res.message && res.message === "Session expired!") {
                handleShowSnackbar("Your password reset session has expired. Please start the process again.");
                setLoginState(prev => ({
                    ...prev,
                    emailOtp : true,
                    createNewPassword : false,
                }));
                setNewCredentialState(prev => ({
                    ...prev,
                    password : "",
                    confirmPassword : "",
                }))
            } else {
                handleShowSnackbar("Failed to change password. Please try again.");
            }
        }
        setButtonState(prev => ({
            ...prev,
            createNewPasswordButton : false,
        }));
    }

    const handleValidateOTP = async () => {

        setButtonState(prev => ({
            ...prev,
            forgotPasswordButton : true,
        }));

        if (!isValidEmail(newCredentialState.email)){
            handleShowSnackbar("Please enter a valid email address.");
            setNewCredentialState(prev => ({
                ...prev,
                emailError : true,
            }))
        } else {
            const res = await validateOTP(newCredentialState.email, newCredentialState.otp);
            if (res.status && res.status === 200) {
                sessionStorage.setItem("resetPasswordToken", res.data);
                handleShowSnackbar("OTP verified successfully. You can now create a new password.");
                setLoginState(prev => ({
                    ...prev,
                    emailOtp : false,
                    createNewPassword : true,
                    otpSent : false,
                }));
            } else if (res.status && res.status === 404) {
                handleShowSnackbar("No account found with this email. Please check your email or sign up.");
            } else if (res.status && res.status === 408) {
                handleShowSnackbar("Your OTP has expired. Please request a new one.");
            } else {
                handleShowSnackbar("Failed to validate verification code. Please try again.");
            }
        }
    }

    const handleClose = () => {
        setLoginState({
            newUser : false,
            forgotPassword : false,
            emailOtp : true,
            createNewPassword : false,
            newPasswordVisibile1 : false,
            newPasswordVisibile2 : false,
            confirmNewUserCreate : false,
        });
        setNewCredentialState({
            email : "",
            emailError : false,
            otp : "",
            otpError : false,
            otpSent : false,
            password : "",
            passwordError : false,
            confirmPassword : "",
            confirmPasswordError : false,
        });
        setEmailState({
            value : "",
            error : false,
        });
        setpasswordState({
            value : "",
            error : false,
            visible : false,
        });
        setProfileSelectionState({
            profileImg : defaultImage,
            file : null,
            imageAlt : "Default Profile Image",
            userName : "",
            userNameError : false,
            otp : "",
            otpError : false,
            verifyEmail : false,
        });
        setButtonState({
            loginButton : false,
            signUpButton : false,
            otpButton : false,
            forgotPasswordButton : false,
            createNewPasswordButton : false,
            createNewUserButton : false,
        });
        setOtpTimer(30);

    }

    const sendEmail_NewUser = async () => {

        setButtonState(prev => ({
            ...prev,
            signUpButton : true,
            otpButton : true
        }));

        if (profileSelectionState.userName.length > 0) {
            const res = await sendEmail(emailState.value, profileSelectionState.userName);
            if (res.status && res.status === 201) {
                handleShowSnackbar("A verification code has been successfully sent to your email. It will expire in 5 minutes.");
                setProfileSelectionState(prev => ({
                    ...prev,
                    verifyEmail : true,
                }));
                setNewCredentialState(prev => ({
                    ...prev,
                    otpSent : true
                }));
            } else if (res.status === 422) {
                handleShowSnackbar("This username is already in use. Try a different one.");
                setProfileSelectionState(prev => ({
                    ...prev,
                    userNameError : true,
                }));
            } else {
                handleShowSnackbar("Failed to send verification code. Please try again.");
            }
        } else {
            handleShowSnackbar("Hmm... looks like you missed the username field.");
        }

        setButtonState(prev => ({
            ...prev,
            signUpButton : false,
            otpButton : false
        }));
    }

    const handleCreateNewUser = async () => {
        setButtonState(prev => ({
            ...prev,
            createNewUserButton : true,
        }));

        const userInfo = {
            userData : {
                userName : profileSelectionState.userName,
                email : emailState.value,
                password : passwordState.value,
                profilePicture : profileSelectionState.profileImg,
            },
            otp : profileSelectionState.otp,
        }

        const formData = new FormData();
        formData.append("userInfo", JSON.stringify(userInfo)); // JSON as string

        if (profileSelectionState.profileImg !== defaultImage) {
            const isFound = ImageData.find((image) => image.src === profileSelectionState.profileImg);
            if (isFound) {
                formData.append("file", profileSelectionState.file as Blob); // File as Blob
            }
        }

        const res = await createNewUser(formData);
        if (res.status && res.status === 201) {
            handleShowSnackbar("Account created successfully. You can now log in.");
            handleClose();
        } else if (res.status == 408) {
            handleShowSnackbar("Your OTP has expired. Please restart the process.");
            handleClose();
        } else if (res.status == 406) {
            handleShowSnackbar("Invalid OTP. Please try again.");
        } else {
            handleShowSnackbar("Failed to create account. Please try again.");
        }
        
        setButtonState(prev => ({
            ...prev,
            createNewUserButton : false,
        }));
    }

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

        const userData = {
            userName : profileSelectionState.userName,
            email : emailState.value,
            password : passwordState.value,
            profilePicture : profileSelectionState.profileImg,
        }

        const file = event.target.files?.[0];
        const maxSizeInBytes = 5 * 1024 * 1024;

        if (file && file.type.startsWith("image/") && file.size <= maxSizeInBytes) {
            
            const formData = new FormData();
            formData.append("file", file as Blob);
            formData.append('userData', JSON.stringify(userData)); // serialize JSON

            setProfileSelectionState(prev => ({
                ...prev,
                profileImg : URL.createObjectURL(file as Blob),
                file : file,
                imageAlt : file.name,
            }));
        } else {
            handleShowSnackbar("Please upload an image (JPG, PNG, or GIF) under 5MB.");
        }
    };

    React.useEffect(() => {
        console.log("Profile Selection State Updated:", profileSelectionState);
    }, [profileSelectionState.profileImg]);


    return  (
        <Box className="h-full w-full"
            sx={{
                backgroundColor : "transparent",
                display : "flex",
                justifyContent : "center",
                alignItems : "center",
            }}>
            <Card 
                variant="outlined" 
                className="flex justify-center items-center"
                sx={{
                    backgroundColor : "#ffff",
                    borderRadius : "30px",
                    width : {
                        xs : "75%",
                        sm : "70%",
                        md : "55%",
                        lg : "35%",
                    },
                    height : "60%",
                    overflow : "visible"
                }}>

                {!loginState.newUser && !loginState.forgotPassword ?
                    <LoginForm 
                        setEmailState={setEmailState}
                        emailState={emailState}
                        passwordState={passwordState}
                        setpasswordState={setpasswordState}
                        handleClose={handleClose}
                        handleLogin={handleLogin}
                        handleShowSnackbar={handleShowSnackbar}
                        buttonState={buttonState}
                        setLoginState={setLoginState}
                        isValidEmail={isValidEmail}
                    />

                    : loginState.newUser ? 
                        <ProfileCreationForm
                            profileSelectionState={profileSelectionState}
                            setProfileSelectionState={setProfileSelectionState}
                            handleClose={handleClose}
                            handleFileChange={handleFileChange}
                            fileInputRef={fileInputRef}
                            handleClick={handleClick}
                            ImageData={ImageData}
                            sendEmail_NewUser={sendEmail_NewUser}
                            buttonState={buttonState}
                        />

                    :
                        <ResetPasswordForm
                            loginState={loginState}
                            setLoginState={setLoginState}
                            newCredentialState={newCredentialState}
                            setNewCredentialState={setNewCredentialState}
                            handleClose={handleClose}
                            handleValidateOTP={handleValidateOTP}
                            handleChangePassword={handleChangePassword}
                            sendEmail_ForgotPassword={sendEmail_ForgotPassword}
                            buttonState={buttonState}
                            otpTimer={otpTimer}
                            isValidEmail={isValidEmail}
                        />
                }
            </Card>

            <Dialog
                open={loginState.confirmNewUserCreate}
            >
                <DialogTitle>
                    <Typography
                        variant="h5"
                        fontWeight={600}
                        sx={{
                            textAlign : "center",
                        }}
                    >
                        Would you like to create a new account?
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography
                        sx={{
                            fontSize : "16px",
                        }}
                    >
                        It looks like you don't have an account yet. Would you like to create one?
                    </Typography>
                    <Typography
                        sx={{
                            color : "#424242",
                            marginTop : "10px",
                            fontSize : "15px",
                            textAlign : "center",
                        }}
                    >
                        <strong>Note</strong> : The password you entered will be used for your new account.<br/>
                        Please confirm to proceed with account creation or,<br/>
                        if you'd like to <strong>change your password</strong>,<br/>
                        you can go back and update it before registering.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        sx={{
                            color : "#242424",
                            border : "solid 1px #242424",
                        }}
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor : "#242424",
                            color : "white",
                            "&:hover" : {
                                backgroundColor : "#2F2F2F",
                            }
                        }}
                        onClick={() => {
                            setLoginState(prev => ({
                                ...prev,
                                confirmNewUserCreate : false,
                                newUser : true,
                            }));
                        }}
                    >
                        Create Account
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={profileSelectionState.verifyEmail}
            >
                <DialogTitle>
                    <Typography
                        variant="h5"
                        fontWeight={600}
                        sx={{
                            textAlign : "center",
                        }}
                    >
                        Verify Your Email
                    </Typography>
                </DialogTitle>
                <DialogContent
                    sx={{
                        display : "flex",
                        flexDirection : "column",
                        alignItems : "center",
                        justifyContent : "space-around",
                        width : "500px",
                        height : "250px",
                        position : "relative",
                    }}
                >
                    <Typography
                        sx={{
                            textAlign : "center",
                            color : "grey",
                        }}
                    >
                        A verification code has been sent to your email.
                        Please enter it below to complete your registration.
                    </Typography>

                    <TextField
                        label="Email"
                        value={emailState.value}
                        disabled
                        sx={{
                            width : "90%",
                            background : '#f7f7f7',
                        }}
                    />

                    <TextField
                        label={profileSelectionState.otpError ? "Invalid OTP" : "OTP"}
                        type="number"
                        error={profileSelectionState.otpError}
                        value={profileSelectionState.otp}
                        onChange={(e) => {
                            setProfileSelectionState(prev => ({
                                ...prev,
                                otp : e.target.value,
                                otpError : false,
                            }))
                        }}
                        sx={{
                            width : "90%",
                            background : '#f7f7f7',
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: 'black',
                                },
                            },
                            '& label.Mui-focused': {
                                color: 'black',
                            },
                            '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                            },
                        }}
                        InputProps={{
                        endAdornment: (
                            <ButtonBase
                                disabled={buttonState.otpButton || newCredentialState.otpSent}
                                onClick={sendEmail_NewUser}
                                sx={{
                                    fontSize : "11px",
                                    width : "120px",
                                    height : "50%",
                                    color : buttonState.otpButton ? "lightgrey" : newCredentialState.otpSent ? "grey" : "black",
                                    borderRadius : "5px",
                                    textAlign : "center",
                                    cursor : "pointer",
                                    userSelect : "none",
                                    position : "relative",
                                    "&:hover" : {
                                        textDecoration : "underline",
                                    },
                                }}
                            >
                                {newCredentialState.otpSent ? `Resend in ${otpTimer}s` : "Send OTP"}
                                {buttonState.otpButton && 
                                    <CircularProgress
                                        size={20}
                                        sx={{
                                            position : "absolute",
                                            color : "grey"
                                        }}
                                    />
                                }
                            </ButtonBase>
                        ),
                    }}
                    />

                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        sx={{
                            color : "#242424",
                            border : "solid 1px #242424",
                        }}
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={buttonState.createNewUserButton || profileSelectionState.otp.length != 6}
                        sx={{
                            position : "relative",
                            backgroundColor : "#242424",
                            color : "white",
                            "&:hover" : {
                                backgroundColor : "#2F2F2F",
                            }
                        }}
                        onClick={handleCreateNewUser}
                    >
                        Create Account
                        {buttonState.createNewUserButton && 
                        <CircularProgress
                            size={25}
                            sx={{
                                position : "absolute",
                                color : "black"
                            }}
                        />}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default LoginPage;