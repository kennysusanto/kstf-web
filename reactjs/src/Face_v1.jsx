import { useState, useRef, useEffect } from "react";
// import "./App.css";
import "./Face.css";
import { Camera } from "react-camera-pro";

import "@mediapipe/face_detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import * as faceDetection from "@tensorflow-models/face-detection";
import * as tf from "@tensorflow/tfjs";

let nextId = 0;

function App() {
    // face detection
    const camera = useRef(null);
    const [image, setImage] = useState(null);
    const [numberOfCameras, setNumberOfCameras] = useState(0);
    let video = document.getElementById("video");
    let canvas = useRef(null);
    let canvasctx = useRef(null);
    const [devices, setDevices] = useState([]);
    const [activeDeviceId, setActiveDeviceId] = useState(undefined);

    const detectorModel = faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig = {
        runtime: "mediapipe",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection",
        // or 'base/node_modules/@mediapipe/face_detection' in npm.
    };
    let detector = useRef(null);

    const geta = async () => {
        console.log(camera);
        canvas = document.getElementById("mycanvas");
        // canvas = video.nextElementSibling;
        // canvas.style.display = "block";
        canvasctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        //drawVideo();
        // video.style.visibility = "hidden";

        detector = await faceDetection.createDetector(detectorModel, detectorConfig);
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

    // image classification

    const MOBILE_NET_INPUT_WIDTH = 224;
    const MOBILE_NET_INPUT_HEIGHT = 224;
    const STOP_DATA_GATHER = -1;
    const [className, setClassName] = useState("");
    const [classes, setClasses] = useState([]);

    let mobilenet = undefined;
    const [gatherDataState, setGatherDataState] = useState(STOP_DATA_GATHER);
    let videoPlaying = false;
    const [trainingDataInputs, setTrainingDataInputs] = useState([]);
    const [trainingDataOutputs, setTrainingDataOutputs] = useState([]);
    let examplesCount = [];
    let predict = false;
    const [model, setModel] = useState(undefined);
    const [mobileNetBase, setMobileNetBase] = useState(undefined);
    const [trainingComplete, setTrainingComplete] = useState(false);
    const [predicting, setPredicting] = useState(false);
    const [predictRes, setPredictRes] = useState("");

    useEffect(() => {
        (async () => {
            await loadMobileNetFeatureModel();
            console.log("KS THIS SHOULD ONLY RUN ONCE");
        })();
    }, []);

    const loadMobileNetFeatureModel = async () => {
        const URL = "https://storage.googleapis.com/jmstore/TensorFlowJS/EdX/SavedModels/mobilenet-v2/model.json";
        mobilenet = await tf.loadLayersModel(URL);
        // STATUS.innerText = "MobileNet v2 loaded successfully!";
        // mobilenet.summary(null, null, (line) => {
        //     console.log(line);
        // });

        const layer = mobilenet.getLayer("global_average_pooling2d_1");
        let nmobileNetBase = tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
        setMobileNetBase(nmobileNetBase);
        // mobileNetBase.summary();
        console.log("MobileNet v2 loaded successfully!", nmobileNetBase);

        // Warm up the model by passing zeros through it once.
        tf.tidy(function () {
            let answer = nmobileNetBase.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
            // console.log(answer.shape);
        });
    };

    const calculateFeaturesOnCurrentFrame = () => {
        return tf.tidy(function () {
            // Grab pixels from current VIDEO frame.
            let videoFrameAsTensor = tf.browser.fromPixels(video);
            // Resize video frame tensor to be 224 x 224 pixels which is needed by MobileNet for input.
            let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor, [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH], true);

            let normalizedTensorFrame = resizedTensorFrame.div(255);

            return mobileNetBase.predict(normalizedTensorFrame.expandDims()).squeeze();
        });
    };

    const captureImage = (cc) => {
        // console.log("capture", cc);
        let imageFeatures = calculateFeaturesOnCurrentFrame();
        // console.log("KS imageFeatures", imageFeatures);

        trainingDataInputs.push(imageFeatures);
        trainingDataOutputs.push(cc.id);
    };

    const trainAndPredict = async () => {
        console.log("TRAINING");
        let model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [1280], units: 64, activation: "relu" }));
        model.add(tf.layers.dense({ units: classes.length, activation: "softmax" }));

        model.summary();

        // Compile the model with the defined optimizer and specify a loss function to use.
        model.compile({
            // Adam changes the learning rate over time which is useful.
            optimizer: "adam",
            // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
            // Else categoricalCrossentropy is used if more than 2 classes.
            loss: classes.length === 2 ? "binaryCrossentropy" : "categoricalCrossentropy",
            // As this is a classification problem you can record accuracy in the logs too!
            metrics: ["accuracy"],
        });
        setModel(model);

        predict = false;
        tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);

        let outputsAsTensor = tf.tensor1d(trainingDataOutputs, "int32");
        let oneHotOutputs = tf.oneHot(outputsAsTensor, classes.length);
        let inputsAsTensor = tf.stack(trainingDataInputs);

        let results = await model.fit(inputsAsTensor, oneHotOutputs, {
            shuffle: true,
            batchSize: 5,
            epochs: 5,
            callbacks: { onEpochEnd: logProgress },
        });

        outputsAsTensor.dispose();
        oneHotOutputs.dispose();
        inputsAsTensor.dispose();

        predict = true;

        // Make combined model for download.

        let combinedModel = tf.sequential();
        combinedModel.add(mobileNetBase);
        combinedModel.add(model);

        combinedModel.compile({
            optimizer: "adam",
            loss: classes.length === 2 ? "binaryCrossentropy" : "categoricalCrossentropy",
        });

        combinedModel.summary();
        console.log("TRAINING COMPLETE");
        // await combinedModel.save("downloads://my-model");

        // predictLoop();
        setTrainingComplete(true);
    };

    const logProgress = (epoch, logs) => {
        console.log("Data for epoch " + epoch, logs);
    };

    useEffect(() => {
        if (!predicting) {
            return;
        }

        predictProcess();
    }, [predicting]);

    const predictProcess = () => {
        if (predicting) {
            tf.tidy(function () {
                let imageFeatures = calculateFeaturesOnCurrentFrame();
                let prediction = model.predict(imageFeatures.expandDims()).squeeze();
                let highestIndex = prediction.argMax().arraySync();
                let predictionArray = prediction.arraySync();
                setPredictRes(
                    "Prediction: " + classes[highestIndex].name + " with " + Math.floor(predictionArray[highestIndex] * 100) + "% confidence"
                );
            });

            requestAnimationFrame(predictProcess);
        }
    };

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
                <div>
                    <Camera
                        ref={camera}
                        numberOfCamerasCallback={setNumberOfCameras}
                        aspectRatio={4 / 3}
                        videoSourceDeviceId={activeDeviceId}
                        videoReadyCallback={() => {
                            console.log("Video feed ready.");
                        }}
                    />
                    <canvas id="mycanvas" />
                </div>
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
                <h3>Capture Buttons</h3>
                <div>
                    {classes.map((c) => (
                        <button
                            key={c.id}
                            onMouseDown={() => {
                                captureImage(c);
                            }}
                        >
                            {c.name} ({trainingDataOutputs.filter((m) => m == c.id).length})
                        </button>
                    ))}
                </div>
                <button
                    onClick={async () => {
                        await trainAndPredict();
                    }}
                >
                    Train
                </button>
                <p>Training data {trainingDataInputs.length}</p>
            </div>
            <div>
                <label>Class Name</label>
                <input value={className} onChange={(e) => setClassName(e.target.value)} />
                <button
                    onClick={() => {
                        classes.push({
                            id: nextId++,
                            name: className,
                        });
                        localStorage.setItem("classes", JSON.stringify(classes));
                        setClassName("");
                    }}
                >
                    Add
                </button>
                <ul>
                    {classes.map((c) => (
                        <li key={c.id} id={c.id}>
                            {c.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3>Prediction</h3>
                {trainingComplete ? (
                    <button
                        onClick={() => {
                            setPredicting(!predicting);
                        }}
                    >
                        {predicting ? "Stop" : "Predict"}
                    </button>
                ) : null}
                {predicting ? <p>{predictRes}</p> : null}
            </div>
        </>
    );
}

export default App;
