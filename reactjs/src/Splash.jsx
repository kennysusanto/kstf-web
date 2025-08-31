import { useState } from "react";
import "./App.css";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <ul>
                <li>
                    <a href="/App">App</a>
                </li>
                <li>
                    <a href="/Menu">Menu</a>
                </li>
            </ul>
        </>
    );
}

export default App;
