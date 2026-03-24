import { useContext, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { AuthContext } from "../context/AuthContext.jsx";
import ConfirmLogoutModal from "../Components/shared/ConfirmLogoutModal.jsx";
import kstfTitle from "../assets/kstf-title.svg";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

const navItems = [
    { to: "/", label: "Home" },
    // { to: "/face", label: "Face" },
    { to: "/dataset", label: "Dataset" },
    { to: "/train", label: "Train" },
    { to: "/predict", label: "Predict" },
];

export default function AppShell() {
    const { logout } = useContext(AuthContext);
    const { pathname } = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <Container sx={{ py: 3 }}>
            <Stack spacing={2}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
                    <Box component="img" src={kstfTitle} alt="KSTF" sx={{ width: { xs: 130, md: 160 }, height: "auto" }} />

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {navItems.map((item) => (
                            <Button
                                key={item.to}
                                component={Link}
                                to={item.to}
                                variant={pathname === item.to ? "contained" : "outlined"}
                                size="small"
                            >
                                {item.label}
                            </Button>
                        ))}
                        <Button variant="outlined" color="error" size="small" onClick={() => setShowLogoutModal(true)}>
                            Logout
                        </Button>
                    </Stack>
                </Stack>

                <Box>
                    <Outlet />
                </Box>
            </Stack>

            <ConfirmLogoutModal props={{ show: showLogoutModal, setShow: setShowLogoutModal, logout }} />
        </Container>
    );
}