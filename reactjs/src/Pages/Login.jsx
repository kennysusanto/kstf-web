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
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";

import apiClient from "../services/apiClient.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { getApiUrl } from "../services/apiUrl.js";
import kstfTitle from "../assets/kstf-title.svg";
import "./Login.css";

function App() {
    const { login } = useContext(AuthContext);
    const [errorInput, setErrorInput] = useState(false);
    const [email, setEmail] = useState("");
    const [emailFormatError, setEmailFormatError] = useState(false);
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [apiConnected, setApiConnected] = useState(null);
    const [apiVersion, setApiVersion] = useState("");

    const validateEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
    };

    useEffect(() => {
        let isMounted = true;

        const checkApiConnection = async () => {
            try {
                console.log(getApiUrl("/api/version"));
                let res = await apiClient.get(getApiUrl("/api/version"), { timeout: 5000 });
                if (isMounted) {
                    setApiConnected(true);
                    setApiVersion(res.data);
                }
            } catch (error) {
                if (isMounted) {
                    setApiConnected(false);
                    setApiVersion("");
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

        if (formDataObj.email == "" || formDataObj.password == "") {
            return;
        }

        if (!validateEmail(formDataObj.email)) {
            setEmailFormatError(true);
            return;
        }

        setErrorInput(false);
        setEmailFormatError(false);
        try {
            let ress = await apiClient.post(getApiUrl("/api/auth/login"), formDataObj);
            if (ress.data) {
                if (ress.data.user) {
                    login(ress.data.user, ress.data.token);
                } else {
                    setMessage(ress.data.message);
                }
            }
        } catch (err) {
            setMessage(err?.response?.data?.message || "Login failed");
        }
    };
    return (
        <Container maxWidth="sm" className="login-page-root">
            <Paper elevation={2} className="login-card" sx={{ p: { xs: 3, sm: 4 } }}>
                <Stack spacing={3} component="form" noValidate onSubmit={handleSubmit}>
                    <Box className="login-branding" sx={{ textAlign: "center" }}>
                        <BadgeOutlined fontSize="large" />
                        <Box
                            component="img"
                            src={kstfTitle}
                            alt="KSTF"
                            sx={{ width: { xs: 180, sm: 220 }, height: "auto", mt: 1, mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Face Recognition Platform
                        </Typography>
                    </Box>

                    <Chip
                        label={apiConnected === null ? "API: Checking connection..." : apiConnected ? `API: Connected v${apiVersion}` : "API: Cannot connect"}
                        color={apiConnected === false ? "error" : "default"}
                        variant="outlined"
                        sx={{ alignSelf: "center" }}
                    />

                    <FormControl fullWidth variant="outlined" error={errorInput || emailFormatError}>
                        <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-email"
                            name="email"
                            type="email"
                            label="Email"
                            value={email}
                            onChange={(event) => {
                                const value = event.target.value;
                                setEmail(value);
                                setEmailFormatError(value !== "" && !validateEmail(value));
                            }}
                            error={errorInput || emailFormatError}
                        />
                        {emailFormatError ? <FormHelperText>Please enter a valid email address</FormHelperText> : null}
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
