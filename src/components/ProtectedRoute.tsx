import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children } : {children : any}) => {
  const authToken = sessionStorage.getItem('AuthToken');
  const userData = sessionStorage.getItem('UserData');

  let tokenValid = false;
  const expiryStr = sessionStorage.getItem('TokenExpiry');
  if (expiryStr) {
    const expiryDate = new Date(expiryStr);
    const now = new Date();

    if (now <= expiryDate) {
      tokenValid = true;
    }
  }

  const isFound = (authToken && userData && expiryStr && tokenValid);

  return isFound ? children : <Navigate to="/login" />;
}

const LoginRoute = ({ children } : {children : any}) => {
  const authToken = sessionStorage.getItem('AuthToken');
  const userData = sessionStorage.getItem('UserData');

  let tokenValid = false;
  const expiryStr = sessionStorage.getItem('TokenExpiry');
  if (expiryStr) {
    const expiryDate = new Date(expiryStr);
    const now = new Date();

    if (now <= expiryDate) {
      tokenValid = true;
    }
  }

  const isFound = (authToken && userData && expiryStr && tokenValid);

  return isFound ? <Navigate to="/chat" /> : children;
}

export { PrivateRoute, LoginRoute };