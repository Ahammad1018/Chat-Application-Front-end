import { SnackbarProvider } from 'notistack';

const MySnackbarProvider = ({ children } : {children : any}) => {
  return (
        <SnackbarProvider maxSnack={3}>
            {children}
        </SnackbarProvider>
    );
};

export default MySnackbarProvider;