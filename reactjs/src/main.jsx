import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
// import App from "./App.jsx";
import Splash from "./Splash.jsx";
// import Menu from "./Menu.jsx";
import Face from "./Face.jsx";
import DatasetPage from "./Pages/Dataset.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

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
        element: <Face />,
    },
    {
        path: "/Predict",
        element: <Face />,
    },
]);

createRoot(document.getElementById("root")).render(
    // <StrictMode>
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>
    // </StrictMode>
);
