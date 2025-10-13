import { useState, useRef, useEffect, useContext } from "react";
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
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthContext } from "../AuthContext.jsx";

function App() {
    const { isLoggedIn, user, login, logout } = useContext(AuthContext);
    const [errorInput, setErrorInput] = useState(false);
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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
            let ress = await axios.post(`/api/auth/login`, formDataObj);
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
        <Container className="container-training">
            <Box component="form" noValidate onSubmit={handleSubmit}>
                <Grid container columns={12}>
                    <Grid size={12}>
                        <h3 className="text-center">Login</h3>
                    </Grid>

                    <Grid size={12}>
                        <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined" error={errorInput}>
                            <InputLabel htmlFor="outlined-adornment-username">Username</InputLabel>
                            <OutlinedInput id="outlined-adornment-username" name="username" label="Username" error={errorInput} />
                            {/* <FormHelperText error={errorInput}>
                                <InfoOutlined />
                                Oops! something is wrong.
                            </FormHelperText> */}
                        </FormControl>
                        <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined" error={errorInput}>
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
                            {/* <FormHelperText >
                                <InfoOutlined />
                                Oops! something is wrong.
                            </FormHelperText> */}
                        </FormControl>
                        {/* <Form.Group>
                            <Form.Label id="input-username">Username</Form.Label>
                            <InputGroup className="mb-3">
                                <Form.Control name="username" placeholder="johndoe" aria-label="Username" aria-describedby="input-username" required />
                                <Form.Control.Feedback type="invalid">Please enter an username.</Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label id="input-username">Password</Form.Label>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    name="password"
                                    placeholder="1234"
                                    aria-label="Username"
                                    type="password"
                                    aria-describedby="input-username"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">Please enter a password.</Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group> */}
                    </Grid>
                    <Grid size={12}>
                        <Button variant="contained" type="submit">
                            Login
                        </Button>
                    </Grid>
                    <Grid size={12}>
                        <p className="text-center">{message}</p>
                    </Grid>
                </Grid>
            </Box>

            <ToastContainer limit={5} />
        </Container>
    );
}

export default App;
