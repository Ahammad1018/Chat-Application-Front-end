import { Component } from 'react';
import { Box, Typography } from '@mui/material';

interface ErrorBoundaryState {
    hasError: boolean;
    error: any;
}

class ErrorBoundary extends Component<any, ErrorBoundaryState> {
    constructor(props : any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error : any) {
        return { hasError: true, error };
    }

    componentDidCatch(error : any, errorInfo : any) {
        console.error("Error caught in ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorModel error={this.state.error} />
        }

        return this.props.children;
    }
}

const ErrorModel = ({ error } : {error : any}) => {
    return (
        <>
        <Box className='w-screen h-screen flex flex-col items-center justify-between'>
            <img src='/error.gif' alt='Error Animation' width='300px' className='mt-[10%]' />
            <Typography variant='h4' color='error' className='text-center w-[90%]' sx={{marginBottom : '1%'}}>
                Something went wrong
            </Typography>
            <Typography variant='h6' color='grey'  className='text-center w-[90%]'>
                {error ? error.message : 'An unknown error occurred.'}
            </Typography>
            <Box className='h-[30%] w-full flex flex-col items-center justify-center'>
                <Typography sx={{fontSize : '100%', margin : '1%'}} color='error' className='text-center w-[90%]'>
                    Please retry after some time.
                </Typography>
            </Box>
        </Box>
        </>
    );
}

export default ErrorBoundary;
