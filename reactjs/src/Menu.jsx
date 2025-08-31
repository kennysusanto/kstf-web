import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Face from "./Face.jsx";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <h1>Face Detector</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
            </div>
            <Face />
        </>
    );
}

export default App;
