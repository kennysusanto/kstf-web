import { useState, useRef } from "react";
import "./App.css";
import "./Face.css";
import { Camera } from "react-camera-pro";

import "@mediapipe/face_detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import * as faceDetection from "@tensorflow-models/face-detection";

function App() {
    const camera = useRef(null);
    const [image, setImage] = useState(null);
    const [numberOfCameras, setNumberOfCameras] = useState(0);
    let video = useRef(null);
    let canvas = useRef(null);
    let canvasctx = useRef(null);

    const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig = {
        runtime: "mediapipe",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection",
        // or 'base/node_modules/@mediapipe/face_detection' in npm.
    };
    let detector = useRef(null);

    const geta = async () => {
        console.log(camera);
        video = document.getElementById("video");
        canvas = document.getElementById("mycanvas");
        canvasctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        //drawVideo();

        detector = await faceDetection.createDetector(model, detectorConfig);
        drawVideo();
    };

    const drawVideo = async () => {
        canvasctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const estimationConfig = { flipHorizontal: false };
        const faces = await detector.estimateFaces(canvas, estimationConfig);
        canvasctx.strokeStyle = "red";
        canvasctx.lineWidth = 5;
        for (let face of faces) {
            let r = face.box;
            canvasctx.beginPath(); // Start a new path
            canvasctx.rect(r.xMin, r.yMin, r.width, r.height);
            canvasctx.stroke();

            for (let kp of face.keypoints) {
                canvasctx.beginPath();
                canvasctx.ellipse(kp.x, kp.y, 1, 1, 0, 0, 2 * Math.PI);
                canvasctx.stroke();
            }
        }
        requestAnimationFrame(drawVideo);
    };

    return (
        <>
            <div>
                <Camera ref={camera} numberOfCamerasCallback={setNumberOfCameras} aspectRatio={4 / 3} />
                <button
                    hidden={numberOfCameras <= 1}
                    onClick={() => {
                        camera.current.switchCamera();
                    }}
                >
                    Change Camera
                </button>
                {/* <button onClick={() => setImage(camera.current.takePhoto())}>Take photo</button> */}
                {/* <img src={image} alt="Taken photo" /> */}
                <button onClick={geta}>Render Canvas</button>
            </div>
            <div>
                <canvas id="mycanvas" />
            </div>
        </>
    );
}

export default App;
