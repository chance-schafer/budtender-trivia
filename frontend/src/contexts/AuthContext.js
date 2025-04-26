// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/auth.service'; // Ensure path is correct
import Spinner from '../components/Spinner'; // Ensure path is correct

const AuthContext = createContext(null); // Initialize with null

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingAuthState, setLoadingAuthState] = useState(true);

    useEffect(() => {
        // console.log("AuthProvider: Checking initial auth state..."); // Optional log
        try {
            const user = AuthService.getCurrentUser(); // Gets from localStorage
            if (user) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        } catch (error) {
            console.error("AuthProvider: Error reading user from storage:", error);
            AuthService.logout();
            setCurrentUser(null);
        } finally {
            // console.log("AuthProvider: Setting loadingAuthState to false."); // Optional log
            setLoadingAuthState(false);
        }

        const handleForcedLogout = (event) => {
            console.warn("AuthProvider: Received auth-error-logout event. Logging out.", event.detail);
            logout();
        };
        window.addEventListener('auth-error-logout', handleForcedLogout);

        return () => {
            window.removeEventListener('auth-error-logout', handleForcedLogout);
        };
    }, []);

    const login = async (username, password) => {
        console.log("AuthProvider: Calling AuthService.login..."); // Log entry point
        try {
            const user = await AuthService.login(username, password); // This await should wait for success or throw
            console.log("AuthProvider: AuthService.login returned successfully:", user); // Log success data

            // Check user data validity again just in case
            if (user && user.accessToken) {
                console.log("AuthProvider: Calling setCurrentUser with valid data.");
                setCurrentUser(user); // Update state
                return user; // Return user data on success
            } else {
                 // Should ideally be caught by AuthService, but as a fallback:
                 console.error("AuthProvider: Invalid user data received after login attempt (no token?):", user);
                 setCurrentUser(null);
                 throw new Error("Login failed: Invalid data received from service.");
            }
        } catch (error) {
            // This catches errors thrown by AuthService.login (e.g., from 401 response)
            console.error("AuthProvider: Error caught during login process:", error.message || error);
            setCurrentUser(null); // Ensure user state is null on error
            // Re-throw the error so LoginPage can display it
            throw error; // IMPORTANT: Make sure error is re-thrown
        }
    };

    const logout = () => {
        console.log("AuthProvider: Logging out user.");
        AuthService.logout();
        setCurrentUser(null);
    };

    const register = async (username, email, password, inviteCode) => {
        return AuthService.register(username, email, password, inviteCode);
    };

    const updateCurrentUser = (updatedUserData) => {
        const existingUser = currentUser || AuthService.getCurrentUser();
        if (!existingUser) {
            console.error("AuthProvider: Cannot update - no existing user context or storage found.");
            logout();
            return;
        }
        const updatedUser = {
            ...existingUser,
            username: updatedUserData.username !== undefined ? updatedUserData.username : existingUser.username,
            email: updatedUserData.email !== undefined ? updatedUserData.email : existingUser.email,
            storeLocation: updatedUserData.storeLocation !== undefined ? updatedUserData.storeLocation : existingUser.storeLocation,
            roles: updatedUserData.roles ? updatedUserData.roles.map(r => r.toUpperCase().startsWith("ROLE_") ? r : `ROLE_${r.toUpperCase()}`) : existingUser.roles,
        };
        if (AuthService.setCurrentUser) {
             AuthService.setCurrentUser(updatedUser);
        } else {
             localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        setCurrentUser(updatedUser);
        // console.log("AuthProvider: User context and storage updated", updatedUser); // Optional log
    };

    const value = {
        currentUser,
        loadingAuthState,
        login,
        logout,
        register,
        updateCurrentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {loadingAuthState ? (
                <div className="flex justify-center items-center min-h-screen">
                    <Spinner />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
