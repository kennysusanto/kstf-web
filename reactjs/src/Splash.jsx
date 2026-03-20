import { useState } from "react";
// import "./App.css";

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
import { Link } from "react-router";

function App() {
    const cards = [
        // {
        //     to: "/face",
        //     title: "Quick Demo",
        //     text: "Experience a simple setup for face recognition",
        // },
        {
            to: "/dataset",
            title: "Dataset",
            text: "Manage faces to train the model",
        },
        {
            to: "/train",
            title: "Train",
            text: "Create your model",
        },
        {
            to: "/predict",
            title: "Predict",
            text: "Run prediction with trained models",
        },
        {
            to: "/",
            title: "Dashboard",
            text: "View reports",
        },
    ];

    return (
        <>
            <Typography variant="h4" component="h2" gutterBottom>
                Welcome to KSTF
            </Typography>
            <Box sx={{ display: "grid", gap: 2 }}>
                {cards.map((card, index) => (
                    <Card key={index}>
                        <CardActionArea component={Link} to={card.to}>
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
            </Box>
        </>
    );
}

export default App;
