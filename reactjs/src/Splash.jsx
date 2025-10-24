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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

function App() {
    const [count, setCount] = useState(0);
    const [show, setShow] = useState(false);
    const { isLoggedIn, user, login, logout } = useContext(AuthContext);
    const cards = [
        {
            href: "/Face",
            title: "Quick Demo",
            text: "Experience a simple setup for face recognition",
        },
        {
            href: "/Dataset",
            title: "Capture Dataset",
            text: "Setup faces to train the model",
        },
        {
            href: "/DatasetIndex",
            title: "View Dataset",
            text: "Manage captured dataset",
        },
        {
            href: "/Train",
            title: "Train",
            text: "Create your model",
        },
        {
            href: "/Predict",
            title: "Predict",
            text: "Run prediction with trained models",
        },
        {
            href: "/Dashboard",
            title: "Dashboard",
            text: "View reports",
        },
    ];

    return (
        <>
            <Box sx={{ display: "grid", gap: 2 }}>
                {cards.map((card, index) => (
                    <Card>
                        <CardActionArea href={card.href}>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {card.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {card.text}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))}
                <div>
                    <ConfirmLogoutModal props={{ show, setShow, logout }} />
                    {isLoggedIn ? (
                        <Button variant="outlined" color="error" onClick={() => setShow(true)} fullWidth>
                            Logout
                        </Button>
                    ) : null}
                </div>
            </Box>
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
