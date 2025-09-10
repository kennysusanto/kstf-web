import { useState } from "react";
// import "./App.css";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <ul>
                {/* <li>
                    <a href="/App">App</a>
                </li>
                <li>
                    <a href="/Menu">Menu</a>
                </li> */}
                <li>
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
                </li>
            </ul>
        </>
    );
}

export default App;
