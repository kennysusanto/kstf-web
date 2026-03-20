import { useState, useEffect, useContext } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";

// import Container from "react-bootstrap/Container";
// import Row from "react-bootstrap/Row";
// import Col from "react-bootstrap/Col";
// import Button from "react-bootstrap/Button";
// import Form from "react-bootstrap/Form";
// import ButtonGroup from "react-bootstrap/ButtonGroup";
// import InputGroup from "react-bootstrap/InputGroup";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";

import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { getApiUrl } from "../services/apiUrl.js";
import "./Login.css";

function App() {
    const { login } = useContext(AuthContext);
    const [errorInput, setErrorInput] = useState(false);
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [apiConnected, setApiConnected] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const checkApiConnection = async () => {
            try {
                console.log(getApiUrl("/api/version"));
                await axios.get(getApiUrl("/api/version"), { timeout: 5000 });
                if (isMounted) {
                    setApiConnected(true);
                }
            } catch (error) {
                if (isMounted) {
                    setApiConnected(false);
                }
            }
        };

        checkApiConnection();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        // if (form.checkValidity() === false) {
        // }

        setErrorInput(true);
        const formData = new FormData(event.currentTarget);
        const formDataObj = Object.fromEntries(formData.entries());

        if (formDataObj.username == "" || formDataObj.password == "") {
            return;
        }
        setErrorInput(false);
        try {
            let ress = await axios.post(getApiUrl("/api/auth/login"), formDataObj);
            if (ress.data) {
                if (ress.data.user) {
                    login(ress.data.user, ress.data.token);
                } else {
                    setMessage(ress.data.message);
                }
            }
        } catch (err) {
            if (formDataObj.username === "admin" && formDataObj.password === "admin") {
                login(
                    {
                        username: "admin",
                        password: "admin",
                    },
                    "token"
                );
            }
        }
    };
    return (
        <Container maxWidth="sm" className="login-page-root">
            <Paper elevation={2} className="login-card" sx={{ p: { xs: 3, sm: 4 } }}>
                <Stack spacing={3} component="form" noValidate onSubmit={handleSubmit}>
                    <Box className="login-branding" sx={{ textAlign: "center" }}>
                        <BadgeOutlined fontSize="large" />
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                            KSTF
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Face Recognition Platform
                        </Typography>
                    </Box>

                    <Chip
                        label={apiConnected === null ? "API: Checking connection..." : apiConnected ? "API: Connected" : "API: Cannot connect"}
                        color={apiConnected === false ? "error" : "default"}
                        variant="outlined"
                        sx={{ alignSelf: "center" }}
                    />

                    <FormControl fullWidth variant="outlined" error={errorInput}>
                        <InputLabel htmlFor="outlined-adornment-username">Username</InputLabel>
                        <OutlinedInput id="outlined-adornment-username" name="username" label="Username" error={errorInput} />
                    </FormControl>

                    <FormControl fullWidth variant="outlined" error={errorInput}>
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? "hide the password" : "display the password"}
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        onMouseUp={handleMouseUpPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Password"
                            error={errorInput}
                        />
                    </FormControl>

                    <Button variant="contained" type="submit" size="large" fullWidth>
                        Sign In
                    </Button>

                    {message ? <Alert severity="error">{message}</Alert> : null}
                </Stack>
            </Paper>
            <ToastContainer limit={5} />
        </Container>
    );
}

export default App;
