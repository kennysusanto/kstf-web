import { StrictMode, useContext, useState } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
// import App from "./App.jsx";
import Splash from "./Splash.jsx";
// import Menu from "./Menu.jsx";
import Face from "./Face.jsx";
import DatasetPage from "./Pages/Dataset.jsx";
import TrainPage from "./Pages/Train.jsx";
import PredictPage from "./Pages/Predict.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider, AuthContext } from "./AuthContext.jsx";
import LoginPage from "./Pages/Login.jsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        path: "/",
        element: <Splash />,
    },
    // {
    //     path: "/App",
    //     element: <App />,
    // },
    // {
    //     path: "/Menu",
    //     element: <Menu />,
    // },
    {
        path: "/Face",
        element: <Face />,
    },
    {
        path: "/Dataset",
        element: <DatasetPage />,
    },
    {
        path: "/Train",
        element: <TrainPage />,
    },
    {
        path: "/Predict",
        element: <PredictPage />,
    },
]);

const Main = () => {
    const { isLoggedIn, user, login, logout } = useContext(AuthContext);

    return (
        <>
            {isLoggedIn ? (
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router} />
                </QueryClientProvider>
            ) : (
                <LoginPage />
            )}
        </>
    );
};

createRoot(document.getElementById("root")).render(
    // <StrictMode>
    <AuthProvider>
        <Main />
    </AuthProvider>
    // </StrictMode>
);
