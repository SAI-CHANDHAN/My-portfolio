import React from 'react';
import { useAuth } from '../../context/AuthContext'; // Use useAuth instead of AuthContext
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth(); // Destructure user from useAuth()

  if (!user) {
    // Redirect to login if no user
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;