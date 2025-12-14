import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        userRole: null,
        user: null
    });

    // Check authentication status
    const checkAuthStatus = () => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
            try {
                const userData = JSON.parse(user);
                setAuthState({
                    isAuthenticated: true,
                    userRole: userData.role,
                    user: userData
                });
            } catch (e) {
                console.error("Error parsing user data:", e);
                // Clear invalid data
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setAuthState({
                    isAuthenticated: false,
                    userRole: null,
                    user: null
                });
            }
        } else {
            setAuthState({
                isAuthenticated: false,
                userRole: null,
                user: null
            });
        }
    };

    // Login function
    const login = (token, userData) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setAuthState({
            isAuthenticated: true,
            userRole: userData.role,
            user: userData
        });
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthState({
            isAuthenticated: false,
            userRole: null,
            user: null
        });
    };

    // Check auth status on mount
    useEffect(() => {
        checkAuthStatus();

        // Listen for storage changes from other tabs
        const handleStorageChange = () => {
            checkAuthStatus();
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <AuthContext.Provider value={{
            ...authState,
            login,
            logout,
            checkAuthStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
};