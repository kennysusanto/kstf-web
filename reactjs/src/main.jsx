import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import router from "./app/router.jsx";

import CssBaseline from "@mui/material/CssBaseline";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <QueryClientProvider client={queryClient}>
            <CssBaseline />
            <RouterProvider router={router} />
        </QueryClientProvider>
    </AuthProvider>
);
