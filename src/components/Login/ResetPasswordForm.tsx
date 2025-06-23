import { ArrowForward, VisibilityOffRounded, VisibilityRounded } from "@mui/icons-material";
import { Box, Button, ButtonBase, CardContent, CircularProgress, IconButton, TextField, Typography } from "@mui/material";

const ResetPasswordForm = (
    { loginState, setLoginState, newCredentialState, setNewCredentialState, handleClose, handleValidateOTP, handleChangePassword, sendEmail_ForgotPassword, buttonState, otpTimer, isValidEmail } : 
    { loginState : any, setLoginState : any, newCredentialState : any, setNewCredentialState : any, handleClose : any, handleValidateOTP : any, handleChangePassword : any, sendEmail_ForgotPassword : any, buttonState : any, otpTimer : number, isValidEmail : any }
    ) => {

    return(
        
        <CardContent
            sx={{
                display : "flex",
                flexDirection : "column",
                justifyContent : "space-evenly",
                alignItems : "center",
                height : "100%",
            }}
        >
            {loginState.emailOtp ? 
            <Box
                sx={{
                    width : "25rem",
                    height : "75%",
                    display : "flex",
                    flexDirection : "column",
                    alignItems : "center",
                    justifyContent : "space-around",
                    position : "relative",
                }}
            >
                <Typography
                    variant="h4"
                    fontWeight={600}
                >
                    Reset Password
                </Typography>

                <Typography
                    sx={{
                        textAlign : 'center',
                        color : 'gray'
                    }}
                >
                    An OTP will be sent to your registered email address.
                    Please check your inbox to proceed.
                </Typography>

                <TextField
                    label={newCredentialState.emailError ? "Invalid Email" : "Email"}
                    color="black"
                    error={newCredentialState.emailError}
                    value={newCredentialState.email}
                    onChange={(e) => {
                        setNewCredentialState((prev : any) => ({
                            ...prev,
                            email : e.target.value,
                            emailError : false,
                        }))
                    }}
                    sx={{
                        width : "100%",
                        background : '#f7f7f7',
                    }}
                    InputProps={{
                        endAdornment: (
                            <ButtonBase
                                disabled={buttonState.otpButton || newCredentialState.otpSent}
                                onClick={() => {
                                    if (!isValidEmail(newCredentialState.email)) {
                                        setNewCredentialState((prev : any) => ({
                                            ...prev,
                                            emailError : true,
                                        }));
                                    } else {
                                        sendEmail_ForgotPassword();
                                    }
                                }}
                                sx={{
                                    fontSize : "11px",
                                    width : "120px",
                                    height : "50%",
                                    color : newCredentialState.emailError ? "#D32F2F" : buttonState.otpButton ? "lightgrey" : newCredentialState.otpSent ? "grey" : "black",
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

                <TextField
                    label={newCredentialState.otpError ? "Invalid OTP" : "OTP"}
                    color="black"
                    type="number"
                    error={newCredentialState.otpError}
                    value={newCredentialState.otp}
                    onChange={(e) => {
                        setNewCredentialState((prev : any) => ({
                            ...prev,
                            otp : e.target.value,
                            otpError : false,
                        }))
                    }}
                    sx={{
                        width : "100%",
                        background : '#f7f7f7',
                        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                        },
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
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                            color : "#424242",
                            border : "solid 1px #424242",
                            width : "30%",
                            height : "50px",
                        }}
                    >
                        Cancel
                    </Button>

                    <Button 
                        variant="contained"
                        sx={{
                            position : "relative",
                            width : "65%",
                            height : "50px",
                            fontSize : "15px",
                            backgroundColor : "#424242",
                        }}
                        disabled={newCredentialState.otp.length != 6}
                        onClick={handleValidateOTP}
                        >
                        Continue
                        <ArrowForward sx={{
                            position : "absolute",
                            right : "10px",
                            fontSize : "20px",
                        }}/>
                    </Button>
                </Box>

                </Box>
                :
                loginState.createNewPassword &&
                <Box
                    sx={{
                        width : "25rem",
                        height : "80%",
                        display : "flex",
                        flexDirection : "column",
                        alignItems : "center",
                        justifyContent : "space-around",
                        position : "relative",
                    }}
                >

                <Typography
                    variant="h4"
                    fontWeight={600}
                >
                    Create New Password
                </Typography>

                <Typography
                    sx={{
                        color : "grey",
                        textAlign : 'center'
                    }}
                >
                        Create a password with at least 8 characters, including a number, an uppercase letter, and a special character.
                    </Typography>
                <TextField
                    label="New Password"
                    color="black"
                    type={loginState.newPasswordVisibile1 ? "text" : "password"}
                    value={newCredentialState.password}
                    error={newCredentialState.passwordError}
                    onChange={(e) => {
                        setNewCredentialState((prev : any) => ({
                            ...prev,
                            password : e.target.value,
                            passwordError : false,
                        }))
                    }}
                    sx={{
                        width : "100%",
                        background : '#f7f7f7',
                    }}
                    InputProps={{
                        endAdornment: (
                            <IconButton
                                onClick={() => {
                                    setLoginState((prev : any) => ({
                                        ...prev,
                                        newPasswordVisibile1 : !loginState.newPasswordVisibile1,
                                    }))
                                }}
                            >
                                {loginState.newPasswordVisibile1 ? <VisibilityOffRounded/> : <VisibilityRounded/>}
                            </IconButton>
                        ),
                    }}
                />

                <TextField
                    label="Confirm Password"
                    color="black"
                    type={loginState.newPasswordVisibile2 ? "text" : "password"}
                    value={newCredentialState.confirmPassword}
                    error={newCredentialState.confirmPasswordError}
                    onChange={(e) => {
                        setNewCredentialState((prev : any) => ({
                            ...prev,
                            confirmPassword : e.target.value,
                            confirmPasswordError : false,
                        }))
                    }}
                    sx={{
                        width : "100%",
                        background : '#f7f7f7',
                    }}
                    InputProps={{
                        endAdornment: (
                            <IconButton
                                onClick={() => {
                                    setLoginState((prev : any) => ({
                                        ...prev,
                                        newPasswordVisibile2 : !loginState.newPasswordVisibile2,
                                    }))
                                }}
                            >
                                {loginState.newPasswordVisibile2 ? <VisibilityOffRounded/> : <VisibilityRounded/>}
                            </IconButton>
                        ),
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
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                            color : "#424242",
                            border : "solid 1px #424242",
                            width : "30%",
                            height : "50px",
                        }}
                    >
                        Cancel
                    </Button>

                    <Button 
                        variant="contained"
                        disabled={newCredentialState.password.length < 8 || newCredentialState.confirmPassword.length < 8 || buttonState.createNewPasswordButton}
                        sx={{
                            position : "relative",
                            width : "65%",
                            height : "50px",
                            fontSize : "15px",
                            backgroundColor : "#424242",
                        }}
                        onClick={handleChangePassword}
                    >
                        Change Password
                        <ArrowForward sx={{
                            position : "absolute",
                            right : "10px",
                            fontSize : "20px",
                        }}/>
                        {buttonState.createNewPasswordButton &&
                        <CircularProgress
                            size={30}
                            sx={{
                                position : "absolute",
                                color : "black",
                            }}
                        />}
                    </Button>
                    
                </Box>
            </Box>}

        </CardContent>
    );
};

export default ResetPasswordForm;