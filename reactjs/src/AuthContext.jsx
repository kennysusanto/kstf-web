import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    // You might want to check localStorage for a stored token on initial load
    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
            // Validate token and set user/isLoggedIn state
            setIsLoggedIn(true);
            setUser({ username: "exampleUser" }); // Replace with actual user data from token
        }
    }, []);

    const login = (userData, token) => {
        setIsLoggedIn(true);
        setUser(userData);
        localStorage.setItem("authToken", token); // Store token in localStorage
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem("authToken"); // Remove token from localStorage
    };

    return <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>{children}</AuthContext.Provider>;
};
