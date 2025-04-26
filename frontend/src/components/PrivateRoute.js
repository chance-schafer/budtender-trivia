// frontend/src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner'; // Optional: Show a spinner while checking auth

const PrivateRoute = ({ children }) => {
  const { currentUser, loadingAuthState } = useAuth();
  const location = useLocation(); // Get current location to redirect back after login

  // 1. If authentication state is still loading, show a spinner or null
  if (loadingAuthState) {
    // Optional: You can return a full-page spinner here
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-128px)]"> {/* Adjust height as needed */}
        <Spinner />
      </div>
    );
    // Or simply return null if you prefer a blank screen while loading
    // return null;
  }

  // 2. If loading is finished and there's no user, redirect to login
  if (!currentUser) {
    console.log("PrivateRoute: No user found, redirecting to login.");
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
    // 'replace' avoids adding the private route to the history stack when redirecting
  }

  // 3. If loading is finished and there IS a user, render the child component
  console.log("PrivateRoute: User found, rendering protected component.");
  return children;
};

export default PrivateRoute;
