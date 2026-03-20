import { createBrowserRouter, Navigate } from "react-router";
import Splash from "../Splash.jsx";
import Face from "../Face.jsx";
import DatasetIndexPage from "../Pages/Dataset/DatasetIndex.jsx";
import DatasetCreatePage from "../Pages/Dataset/DatasetCreate.jsx";
import TrainPage from "../Pages/Train.jsx";
import PredictPage from "../Pages/Predict.jsx";
import LoginPage from "../Pages/Login.jsx";
import AppShell from "./AppShell.jsx";
import { LoginRoute, ProtectedRoute } from "./routeGuards.jsx";

const router = createBrowserRouter([
    {
        path: "/login",
        element: (
            <LoginRoute>
                <LoginPage />
            </LoginRoute>
        ),
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppShell />,
                children: [
                    {
                        path: "/",
                        element: <Splash />,
                    },
                    {
                        path: "/face",
                        element: <Face />,
                    },
                    {
                        path: "/dataset",
                        element: <DatasetIndexPage />,
                    },
                    {
                        path: "/dataset/create",
                        element: <DatasetCreatePage />,
                    },
                    {
                        path: "/dataset/create/:id",
                        element: <DatasetCreatePage />,
                    },
                    {
                        path: "/train",
                        element: <TrainPage />,
                    },
                    {
                        path: "/predict",
                        element: <PredictPage />,
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);

export default router;