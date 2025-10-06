import { useContext, useState } from "react";
// import "./App.css";
import ConfirmLogoutModal from "./Components/ConfirmLogoutModal";
import { AuthContext } from "./AuthContext";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

function App() {
    const [count, setCount] = useState(0);
    const [show, setShow] = useState(false);
    const { isLoggedIn, user, login, logout } = useContext(AuthContext);

    return (
        <>
            <div className="d-grid gap-3 mt-2">
                <Button href="/Face">Quick Demo</Button>
                <Button href="/Dataset">Dataset</Button>
                <Button href="/Train">Train</Button>
                <Button href="/Predict">Predict</Button>
                <div>
                    <ConfirmLogoutModal props={{ show, setShow, logout }} />
                    {isLoggedIn ? (
                        <div className="d-grid">
                            <Button onClick={() => setShow(true)} variant="outline-danger">
                                Logout
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
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
