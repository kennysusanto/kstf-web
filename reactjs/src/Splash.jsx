import { useState } from "react";
// import "./App.css";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <div className="d-grid gap-2 mt-2">
                <a href="/Face">
                    <Button size="lg">Face Learning Simple</Button>
                </a>
                <a href="/Dataset">
                    <Button size="lg">Dataset</Button>
                </a>
                <a href="/Train">
                    <Button size="lg">Train</Button>
                </a>
                <a href="/Predict">
                    <Button size="lg">Predict</Button>
                </a>
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
