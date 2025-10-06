import { useState, useRef, useEffect, useContext } from "react";
import "./Dataset.css";
import { Camera } from "react-camera-pro";
import "@mediapipe/face_detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import * as faceDetection from "@tensorflow-models/face-detection";
import * as tf from "@tensorflow/tfjs";
import { ToastContainer, toast, Slide } from "react-toastify";
import Constants from "../Misc/Constants.jsx";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import InputGroup from "react-bootstrap/InputGroup";

import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthContext } from "../AuthContext.jsx";

function App() {
    const { isLoggedIn, user, login, logout } = useContext(AuthContext);
    const [validated, setValidated] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        // if (form.checkValidity() === false) {
        // }

        setValidated(true);
        const formData = new FormData(event.target),
            formDataObj = Object.fromEntries(formData.entries());

        if (formDataObj.username == "" || formDataObj.password == "") {
            return;
        }
        let ress = await axios.post(`/api/auth/login`, formDataObj);
        if (ress.data) {
            console.log(ress.data);
            if (ress.data.user) {
                login(ress.data.user, ress.data.token);
            } else {
                setMessage(ress.data.message);
                setValidated(false);
            }
        }
    };
    return (
        <Container className="container-training">
            <Row>
                <Col md={12}>
                    <h3 className="text-center">Login</h3>

                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label id="input-username">Username</Form.Label>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    name="username"
                                    placeholder="johndoe"
                                    aria-label="Username"
                                    aria-describedby="input-username"
                                    required
                                />
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
                        </Form.Group>

                        <div className="d-grid mb-2">
                            <Button type="submit">Login</Button>
                        </div>
                        <p className="text-center">{message}</p>
                    </Form>
                </Col>
            </Row>

            <ToastContainer limit={5} />
        </Container>
    );
}

export default App;
