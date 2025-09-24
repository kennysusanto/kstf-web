import React, { createContext, useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export const AuthContext = createContext();

const ConfirmLogoutModal = ({ props }) => {
    const { show, setShow, logout } = props;
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleConfirmLogout = () => {
        handleClose();
        logout();
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body>You are logging out!</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="outline-danger" onClick={handleConfirmLogout}>
                        Logout
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [show, setShow] = useState(false);

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

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            <ConfirmLogoutModal props={{ show, setShow, logout }} />
            {children}
            {isLoggedIn ? (
                <Button onClick={() => setShow(true)} variant="outline-danger">
                    Logout
                </Button>
            ) : null}
        </AuthContext.Provider>
    );
};
