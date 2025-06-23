import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Login/LoginPage';
import { Box, styled } from '@mui/material';
import Dashboard from './components/Dashboard/Dashboard';
import PageNotFound from './components/page-not-found';
import { LoginRoute, PrivateRoute } from './components/ProtectedRoute';

export const DividerRoot = styled('div')(({ theme }) => ({
    width: '100%',
    ...theme.typography.body2,
    color: (theme).palette.text.secondary,
    '& > :not(style) ~ :not(style)': {
      marginTop: theme.spacing(2),
    },
}));

const App = () => {

  return (
    <Box className="Main-App w-full h-screen">
    <Router>
      <Routes>
        <Route path="/login" element={
            <LoginRoute>
              <LoginPage />
            </LoginRoute>
        } />
  
          <Route path="/chat" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
          } />
          
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
    </Box>
  )
}

export default App;
