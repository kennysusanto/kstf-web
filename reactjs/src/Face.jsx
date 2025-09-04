import { useState, useRef, useEffect } from "react";
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

    const [devices, setDevices] = useState([]);
    const [activeDeviceId, setActiveDeviceId] = useState(undefined);

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

    useEffect(() => {
        (async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((i) => i.kind == "videoinput");
            setDevices(videoDevices);

            // try {
            //     const permissionsStatus = await navigator.permissions.query({
            //         name: "camera",
            //     });
            //     let stream = await navigator.mediaDevices.getUserMedia({ video: true });
            //     // console.log(stream);
            // } catch (er) {
            //     console.log(er);
            // }
        })();
    });

    return (
        <>
            <h1>Face Detector</h1>
            <a href="/">Back</a>
            <div>
                <select
                    onChange={(event) => {
                        setActiveDeviceId(event.target.value);
                    }}
                >
                    {devices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                            {d.label}
                        </option>
                    ))}
                </select>
                <text>{activeDeviceId}</text>
                <Camera
                    ref={camera}
                    numberOfCamerasCallback={setNumberOfCameras}
                    aspectRatio={4 / 3}
                    videoSourceDeviceId={activeDeviceId}
                    videoReadyCallback={() => {
                        console.log("Video feed ready.");
                    }}
                />
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
