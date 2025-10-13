import { useContext, useState } from "react";
// import "./App.css";
import ConfirmLogoutModal from "./Components/ConfirmLogoutModal";
import { AuthContext } from "./AuthContext";

// import Container from "react-bootstrap/Container";
// import Row from "react-bootstrap/Row";
// import Col from "react-bootstrap/Col";
// import Button from "react-bootstrap/Button";

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

function App() {
    const [count, setCount] = useState(0);
    const [show, setShow] = useState(false);
    const { isLoggedIn, user, login, logout } = useContext(AuthContext);

    return (
        <>
            <Grid container columns={12} spacing={2}>
                <Grid size={12}>
                    <Button variant="contained" href="/Face">
                        Quick Demo
                    </Button>
                </Grid>
                <Grid size={12}>
                    <Button variant="contained" href="/Dataset">
                        Dataset
                    </Button>
                </Grid>
                <Grid size={12}>
                    <Button variant="contained" href="/Train">
                        Train
                    </Button>
                </Grid>
                <Grid size={12}>
                    <Button variant="contained" href="/Predict">
                        Predict
                    </Button>
                </Grid>
                <Grid size={12}>
                    <Button variant="contained" href="/">
                        Dashboard
                    </Button>
                </Grid>
                <div>
                    <ConfirmLogoutModal props={{ show, setShow, logout }} />
                    {isLoggedIn ? (
                        <div className="d-grid">
                            <Button variant="outlined" color="error" onClick={() => setShow(true)}>
                                Logout
                            </Button>
                        </div>
                    ) : null}
                </div>
            </Grid>
            <ul>
                {/* <li>
                    <a href="/App">App</a>
                </li>
                <li>
                    <a href="/Menu">Menu</a>
                </li> */}
                {/* <li>
                    <a href="/Face">Face Learning Simple</a>
                </li>
                <li>
                    <a href="/Dataset">Dataset</a>
                </li>
                <li>
                    <a href="/Train">Train</a>
                </li>
                <li>
                    <a href="/Predict">Predict</a>
                </li> */}
            </ul>
        </>
    );
}

export default App;
