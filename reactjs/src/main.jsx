import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import App from "./App.jsx";
import Splash from "./Splash.jsx";
import Menu from "./Menu.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Splash />,
    },
    {
        path: "/App",
        element: <App />,
    },
    {
        path: "/Menu",
        element: <Menu />,
    },
]);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
