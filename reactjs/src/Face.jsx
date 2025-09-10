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
import { ToastContainer, toast, Slide } from "react-toastify";

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
    const [capturing, setCapturing] = useState(false);

    const detectorModel = faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig = {
        runtime: "mediapipe",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection",
        // or 'base/node_modules/@mediapipe/face_detection' in npm.
    };

    const [detector, setDetector] = useState(null);
    var capturingRef = useRef(capturing);

    const [browserWidth, setBrowserWidth] = useState(window.innerWidth);

    function handleWindowSizeChange() {
        setBrowserWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener("resize", handleWindowSizeChange);
        return () => {
            window.removeEventListener("resize", handleWindowSizeChange);
        };
    }, []);

    const isMobile = browserWidth <= 768;

    const scrollToBottom = () => {
        setTimeout(() => {
            window.scrollTo({
                top: document.documentElement.scrollHeight, // Scrolls to the maximum scrollable height
                behavior: "smooth", // Provides a smooth scrolling animation
            });
        }, 200);
    };

    // const geta = async () => {
    //     console.log(camera);
    //     canvas = document.getElementById("mycanvas");
    //     // canvas = video.nextElementSibling;
    //     // canvas.style.display = "block";
    //     canvasctx = canvas.getContext("2d");
    //     canvas.width = video.videoWidth;
    //     canvas.height = video.videoHeight;
    //     //drawVideo();
    //     // video.style.visibility = "hidden";

    //     setDetector(await faceDetection.createDetector(detectorModel, detectorConfig));
    //     drawVideo();
    // };

    // const drawVideo = async () => {
    //     canvasctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    //     const estimationConfig = { flipHorizontal: false };
    //     const faces = await detector.estimateFaces(canvas, estimationConfig);
    //     canvasctx.strokeStyle = "red";
    //     canvasctx.lineWidth = 5;
    //     for (let face of faces) {
    //         let r = face.box;
    //         canvasctx.beginPath(); // Start a new path
    //         canvasctx.rect(r.xMin, r.yMin, r.width, r.height);
    //         canvasctx.stroke();

    //         for (let kp of face.keypoints) {
    //             canvasctx.beginPath();
    //             canvasctx.ellipse(kp.x, kp.y, 1, 1, 0, 0, 2 * Math.PI);
    //             canvasctx.stroke();
    //         }
    //     }
    //     requestAnimationFrame(drawVideo);
    // };

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

    useEffect(() => {
        (async () => {
            console.log("Detector is initializing");
            let d = await faceDetection.createDetector(detectorModel, detectorConfig);
            setDetector(d);
            console.log("Detector is initialized");
        })();
    }, []);

    useEffect(() => {
        if (!capturing) {
            return;
        }
        detectFaceLoop();
    }, [capturing]);

    const detectFaceLoop = () => {
        if (capturingRef.current) {
            const estimationConfig = { flipHorizontal: false };
            detector.estimateFaces(video, estimationConfig).then((faces) => {
                if (faces.length > 0) {
                    let r = faces[0].box;
                    let canvas = document.getElementById("mycanvas2");
                    let image = document.getElementById("myimg2");
                    let ctx = canvas.getContext("2d");
                    canvas.width = MOBILE_NET_INPUT_WIDTH;
                    canvas.height = MOBILE_NET_INPUT_HEIGHT;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(video, r.xMin, r.yMin, r.width, r.height, 0, 0, canvas.width, canvas.height);
                    // ctx.drawImage(video, r.xMin, r.yMin, r.width, r.height, 0, 0, r.width, r.height);
                    let data = canvas.toDataURL("image/png");
                    image.setAttribute("src", data);
                    image.style.visibility = "visible";
                    // canvasctx.beginPath(); // Start a new path
                    // canvasctx.rect(r.xMin, r.yMin, r.width, r.height);
                    // canvasctx.stroke();
                }
                // setImage(video);
            });

            requestAnimationFrame(detectFaceLoop);
        } else {
            clearPreview();
        }
    };

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
    var predictingRef = useRef(predicting);
    const [highestDataCount, setHighestDataCount] = useState(0);

    const [predictRes, setPredictRes] = useState(null);
    const [showPreview, setShowPreview] = useState(true);

    useEffect(() => {
        (async () => {
            await loadMobileNetFeatureModel();
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

    const calculateFaceFeatures = async (showToast = true) => {
        const estimationConfig = { flipHorizontal: false };
        const faces = await detector.estimateFaces(video, estimationConfig);

        if (faces.length > 0) {
            let r = faces[0].box;
            let canvas = document.getElementById("mycanvas2");
            let image = document.getElementById("myimg2");
            let ctx = canvas.getContext("2d");
            canvas.width = MOBILE_NET_INPUT_WIDTH;
            canvas.height = MOBILE_NET_INPUT_HEIGHT;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, r.xMin, r.yMin, r.width, r.height, 0, 0, canvas.width, canvas.height);
            // ctx.drawImage(video, r.xMin, r.yMin, r.width, r.height, 0, 0, r.width, r.height);
            let data = canvas.toDataURL("image/png");
            image.setAttribute("src", data);
            image.style.visibility = "visible";

            if (showPreview) {
                image.style.display = "block";
            } else {
                image.style.display = "none";
            }

            return tf.tidy(function () {
                let videoFrameAsTensor = tf.browser.fromPixels(canvas);
                // Resize video frame tensor to be 224 x 224 pixels which is needed by MobileNet for input.
                let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor, [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH], true);

                let normalizedTensorFrame = resizedTensorFrame.div(255);

                return mobileNetBase.predict(normalizedTensorFrame.expandDims()).squeeze();
            });
        } else {
            if (showToast) {
                textToast("Face not detected!");
            }

            return null;
        }
    };

    const textToast = (msg) => {
        if (msg == "") {
            return;
        }
        toast(msg, {
            position: "bottom-right",
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Slide,
        });
    };

    const captureImage = async (cc) => {
        // console.log("capture", cc);
        // let imageFeatures = calculateFeaturesOnCurrentFrame();
        let imageFeatures = await calculateFaceFeatures();
        // console.log("KS imageFeatures", imageFeatures);

        if (imageFeatures === null) {
            return;
        }

        trainingDataInputs.push(imageFeatures);
        trainingDataOutputs.push(cc.id);
        let dataCount = trainingDataOutputs.filter((m) => m == cc.id).length;
        if (dataCount > highestDataCount) {
            setHighestDataCount(dataCount);
        }
    };

    const trainAndPredict = async () => {
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
        textToast("Training complete!");
        scrollToBottom();
    };

    const logProgress = (epoch, logs) => {
        console.log("Data for epoch " + epoch, logs);
    };

    useEffect(() => {
        if (!predicting) {
            return;
        }

        (async () => {
            await predictLoop();
        })();
    }, [predicting]);

    const predictLoop = async () => {
        if (predictingRef.current) {
            let imageFeatures = await calculateFaceFeatures(false);
            if (imageFeatures != null) {
                tf.tidy(function () {
                    let startDate = new Date();
                    // let imageFeatures = calculateFeaturesOnCurrentFrame();
                    let prediction = model.predict(imageFeatures.expandDims()).squeeze();
                    let highestIndex = prediction.argMax().arraySync();
                    let predictionArray = prediction.arraySync();
                    // Do your operations
                    let endDate = new Date();
                    let ms = endDate.getTime() - startDate.getTime();
                    setPredictRes({
                        name: classes[highestIndex].name,
                        confidence: Math.floor(predictionArray[highestIndex] * 100),
                        spent: ms,
                    });
                });
            } else {
                setPredictRes(null);
            }
            requestAnimationFrame(predictLoop);
        } else {
            clearPreview();
        }
    };

    const clearPreview = () => {
        let image = document.getElementById("myimg2");
        image.setAttribute("src", "");
        image.style.visibility = "hidden";
    };

    return (
        <>
            <a href="/">Back</a>
            <div id="facecontainer">
                <p>{isMobile ? "Mobile" : "PC"}</p>
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
                {/* <text>{activeDeviceId}</text> */}
                <div id="mycam">
                    <Camera
                        ref={camera}
                        numberOfCamerasCallback={setNumberOfCameras}
                        aspectRatio={isMobile ? 3 / 4 : 4 / 3}
                        videoSourceDeviceId={activeDeviceId}
                        videoReadyCallback={async () => {
                            console.log("Video feed ready.");
                            // await detectFaceLoop();
                        }}
                    />
                    <canvas id="mycanvas" className="d-none" />
                    <canvas id="mycanvas2" className="d-none" />
                    <img id="myimg2" />
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
                {/* <button onClick={geta}>Render Canvas</button> */}
                <button
                    hidden={numberOfCameras <= 1}
                    onClick={() => {
                        setCapturing(!capturing);
                        capturingRef.current = !capturing;
                    }}
                >
                    {capturing ? "Stop" : "Detect Face"}
                </button>
            </div>

            <div>
                <h3>Training</h3>
                <label>Class Name</label>
                <input value={className} onChange={(e) => setClassName(e.target.value)} />
                <button
                    onClick={() => {
                        if (className != "") {
                            classes.push({
                                id: nextId++,
                                name: className,
                            });
                            localStorage.setItem("classes", JSON.stringify(classes));
                            setClassName("");
                        }
                    }}
                >
                    Add
                </button>
                <ul>
                    {classes.map((c) => (
                        <li key={c.id} id={c.id}>
                            <button
                                onMouseDown={async () => {
                                    await captureImage(c);
                                }}
                            >
                                {c.name} ({trainingDataOutputs.filter((m) => m == c.id).length})
                            </button>
                        </li>
                    ))}
                </ul>
                <button
                    disabled={
                        highestDataCount == 0 ||
                        classes.length == 0 ||
                        !classes.every((m) => trainingDataOutputs.filter((k) => k == m.id).length == highestDataCount)
                    }
                    title="Data count needs to be the same across all class"
                    onClick={() => {
                        console.log("TRAINING");
                        textToast("Training started");
                        clearPreview();
                        setTimeout(async () => {
                            await trainAndPredict();
                        }, 500);
                    }}
                >
                    Train on {trainingDataInputs.length} data
                </button>
            </div>
            <div>
                <h3>Prediction</h3>
                {trainingComplete ? (
                    <div>
                        <button
                            onClick={() => {
                                setPredicting(!predicting);
                                predictingRef.current = !predicting;
                            }}
                        >
                            {predicting ? "Stop" : "Predict"}
                        </button>
                        <button
                            onClick={() => {
                                setShowPreview(!showPreview);
                            }}
                        >
                            {showPreview ? "Hide Preview" : "Show Preview"}
                        </button>
                    </div>
                ) : null}
                {predicting && predictRes ? (
                    <p>
                        Prediction: <b>{predictRes.name}</b> with {predictRes.confidence}% confidence in {predictRes.spent}ms
                    </p>
                ) : (
                    <p>Start {trainingComplete ? "predicting" : "training"}</p>
                )}
            </div>
            <ToastContainer limit={5} />
        </>
    );
}

export default App;
