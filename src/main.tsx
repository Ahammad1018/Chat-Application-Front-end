import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { LoginProvider } from './components/API/login.tsx';
import MySnackbarProvider from './components/SnackbarProvider.tsx';
import { ConnectionProvider } from './components/API/Connection.tsx';
import { ConversationProvider } from './components/API/Conversation.tsx';
import { UserProvider } from './components/API/Users.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <MySnackbarProvider>
          <LoginProvider>
            <ConnectionProvider>
              <ConversationProvider>
                <UserProvider>
                  <App />
                </UserProvider>
              </ConversationProvider>
            </ConnectionProvider>
          </LoginProvider>
      </MySnackbarProvider>
    </ErrorBoundary>
  </StrictMode>,
)
