import { ArrowForward, VisibilityOffRounded, VisibilityRounded } from "@mui/icons-material";
import { Box, Button, CardContent, CircularProgress, Divider, IconButton, TextField, Typography } from "@mui/material";
import { DividerRoot } from "../../App";

const LoginForm = (
        { setEmailState, emailState, passwordState, setpasswordState, handleClose, handleLogin, handleShowSnackbar, buttonState, setLoginState, isValidEmail } :
        {setEmailState : any, emailState : any, handleClose : any, handleLogin : any, handleShowSnackbar : any, buttonState : any, setLoginState : any, passwordState : any, setpasswordState : any, isValidEmail : any }
    ) => {
    return (
        <CardContent 
            className="h-[90%] w-[70%]"
            sx={{
                display : "flex",
                flexDirection : "column",
                justifyContent : "space-around",
                alignItems : "start",
            }}>
            
            <Box className="w-full h-[30%]">
                <Typography 
                    variant="h3" 
                    sx={{
                        fontWeight : "600",
                        fontSize : {
                            xs: '2rem',  // ~24px on extra-small screens
                            sm: '2.8rem',    // ~32px on small screens
                            md: '2.7rem',  // ~40px on medium+
                        }
                        }}>
                    Log in to
                </Typography>
                <Typography 
                    variant="h3" 
                    sx={{
                        fontWeight : "600",
                        fontSize : {
                            xs: '1.7rem',  // ~24px on extra-small screens
                            sm: '2.5rem',    // ~32px on small screens
                            md: '2.7rem',  // ~40px on medium+
                        }
                    }}>your
                    <span className="login-account-text">account</span>
                </Typography>
            </Box>

            <TextField
                label={emailState.error ? "Invalid Email" : "Email"}
                error={emailState.error}
                value={emailState.value}
                onChange={(e) => {
                    setEmailState({value : e.target.value, error : false});
                }}
                sx={{
                    background : '#f7f7f7',
                    width : "100%",
                    '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                            borderColor: 'black',
                        },
                    },
                    '& label.Mui-focused': {
                        color: 'black',
                    },
                }}
            />

            <TextField 
                label={passwordState.error ? "Invalid Password" : "Password"}
                type={passwordState.visible ? "text" : "password"}
                error={passwordState.error}
                value={passwordState.value}
                onChange={(e) => {
                    setpasswordState({value : e.target.value, error : false, visible : passwordState.visible});
                }}

                sx={{
                    background : '#f7f7f7',
                    width : "100%",
                    '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                            borderColor: 'black',
                        },
                    },
                    '& label.Mui-focused': {
                        color: 'black',
                    },
                }}

                InputProps={{
                    endAdornment: (
                        <IconButton
                            onClick={() => {setpasswordState({value : passwordState.value, error : passwordState.error, visible : !passwordState.visible})}}
                        >
                            {passwordState.visible ? <VisibilityOffRounded/> : <VisibilityRounded/>}
                        </IconButton>
                    ),
                }}
            />

            <DividerRoot>
                <Divider>
                    <Typography
                        onClick={() => {
                            handleClose();
                            setLoginState((prev : any) => ({
                            ...prev,
                            forgotPassword : true,
                        }))}}
                        sx={{
                            cursor : "pointer",
                            userSelect : "none",
                            "&:hover" : {
                                textDecoration : "underline",
                            },
                        }}
                    >
                        Forgot Password ?
                    </Typography>
                </Divider>
            </DividerRoot>

            <Button
                variant="contained"
                disabled={buttonState.loginButton}
                sx={{
                    position : "relative",
                    width : "100%",
                    height : "10%",
                    fontSize : "15px",
                    backgroundColor : "#424242",
                }}
                onClick={() => {
                    if (!isValidEmail(emailState.value))setEmailState({value : emailState.value, error : true});
                    else if (passwordState.value.length < 3)setpasswordState({value : passwordState.value, error : true, visible : passwordState.visible});
                    else handleLogin();
                    if (!isValidEmail(emailState.value) || passwordState.value.length < 3) {
                        handleShowSnackbar("Please enter valid credentials");
                    }
                }}
                >
                Log In
                <ArrowForward sx={{
                    position : "absolute",
                    right : "10px",
                    fontSize : "20px",
                }}/>

                {buttonState.loginButton && 
                <CircularProgress
                    size={30}
                    sx={{
                        position : "absolute",
                        color : "black",
                    }}
                />}
            </Button>
            
        </CardContent>
    );
};

export default LoginForm;
