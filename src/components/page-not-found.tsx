import { Box, Link, Typography } from "@mui/material";

const PageNotFound = () => {
    return (
        <Box 
            sx={{
                width : "100%",
                height : "100%",
                display : "flex",
                flexDirection : "column",
                alignItems : "center",
                justifyContent : "center"
            }}>
            <img 
                src="404-not-found.gif" 
                alt="page-not-found"
                style={{
                    mixBlendMode : "multiply",
                    width : "40%",
                    height : "auto",
                    display : "block",
                }}
            />

            <Typography color="#485579">Oops! we couldn't find this page.</Typography>
            <Typography color="#485579">But don't worry, you can find plenty of other things on our <Link href="/login">homepage</Link>.</Typography>
        </Box>
    )
}

export default PageNotFound;