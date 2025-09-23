import { useState, useRef, useEffect } from "react";
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

import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";

let nextId = 0;

function App() {
    const camera = useRef(null);
    const [image, setImage] = useState(null);
    const [images, setImages] = useState([]);
    const [numberOfCameras, setNumberOfCameras] = useState(0);
    let video = document.querySelector(".container-dataset #video");
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
    const [className, setClassName] = useState("");
    const [classes, setClasses] = useState([]);
    const [classesTensors, setClassesTensors] = useState([]);
    const [classesTensorLabels, setClassesTensorLabels] = useState([]);
    const [highestDataCount, setHighestDataCount] = useState(0);

    const isMobile = browserWidth <= 768;

    function handleWindowSizeChange() {
        setBrowserWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener("resize", handleWindowSizeChange);
        return () => {
            window.removeEventListener("resize", handleWindowSizeChange);
        };
    }, []);

    const scrollToBottom = () => {
        setTimeout(() => {
            window.scrollTo({
                top: document.documentElement.scrollHeight, // Scrolls to the maximum scrollable height
                behavior: "smooth", // Provides a smooth scrolling animation
            });
        }, 200);
    };

    useEffect(() => {
        (async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((i) => i.kind == "videoinput");
            setDevices(videoDevices);
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
                    let canvas = document.querySelector(".container-dataset .canvas2");
                    let image = document.querySelector(".container-dataset .img1");
                    let ctx = canvas.getContext("2d");
                    canvas.width = Constants.MOBILE_NET_INPUT_WIDTH;
                    canvas.height = Constants.MOBILE_NET_INPUT_HEIGHT;
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
            });

            requestAnimationFrame(detectFaceLoop);
        } else {
            clearPreview();
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

    const clearPreview = () => {
        let image = document.querySelector(".container-dataset .img1");
        image.setAttribute("src", "");
        image.style.visibility = "hidden";
        setImage(null);
    };

    const calculateFaceTensor = async (showToast = true) => {
        const estimationConfig = { flipHorizontal: false };
        const faces = await detector.estimateFaces(video, estimationConfig);

        if (faces.length > 0) {
            let r = faces[0].box;
            let canvas = document.querySelector(".container-dataset .canvas2");
            let image = document.querySelector(".container-dataset .img1");
            let ctx = canvas.getContext("2d");
            canvas.width = Constants.MOBILE_NET_INPUT_WIDTH;
            canvas.height = Constants.MOBILE_NET_INPUT_HEIGHT;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, r.xMin, r.yMin, r.width, r.height, 0, 0, canvas.width, canvas.height);
            // ctx.drawImage(video, r.xMin, r.yMin, r.width, r.height, 0, 0, r.width, r.height);
            let data = canvas.toDataURL("image/png");
            image.setAttribute("src", data);
            image.style.visibility = "visible";

            image.style.display = "block";

            return tf.tidy(function () {
                let videoFrameAsTensor = tf.browser.fromPixels(canvas);
                // Resize video frame tensor to be 224 x 224 pixels which is needed by MobileNet for input.
                let resizedTensorFrame = tf.image.resizeBilinear(
                    videoFrameAsTensor,
                    [Constants.MOBILE_NET_INPUT_HEIGHT, Constants.MOBILE_NET_INPUT_WIDTH],
                    true
                );

                let normalizedTensorFrame = resizedTensorFrame.div(255);

                // return mobileNetBase.predict(normalizedTensorFrame.expandDims()).squeeze();
                return normalizedTensorFrame;
            });
        } else {
            if (showToast) {
                textToast("Face not detected!");
            }

            return null;
        }
    };

    const captureImage = async (cc) => {
        // console.log("capture", cc);
        // let imageFeatures = calculateFeaturesOnCurrentFrame();
        let imageTensor = await calculateFaceTensor();
        // console.log("KS imageFeatures", imageFeatures);

        if (imageTensor === null) {
            return;
        }

        let canvas = document.querySelector(".container-dataset .canvas2");
        let data = canvas.toDataURL("image/png");
        setImage(data);
        images.push({ id: cc.id, name: cc.name, data });
        // trainingDataInputs.push(imageFeatures);
        // trainingDataOutputs.push(cc.id);
        classesTensors.push(imageTensor);
        classesTensorLabels.push(cc.id);
        // let dataCount = trainingDataOutputs.filter((m) => m == cc.id).length;
        let dataCount = classesTensorLabels.filter((m) => m == cc.id).length;
        if (dataCount > highestDataCount) {
            setHighestDataCount(dataCount);
        }
    };

    const inputClass = () => {
        if (className != "") {
            classes.push({
                id: nextId++,
                name: className,
            });
            localStorage.setItem("classes", JSON.stringify(classes));
            setClassName("");
        }
        document.querySelector(".classname-input").focus();
    };

    const {
        status,
        data: dataset,
        error,
    } = useQuery({
        queryKey: ["dataset"],
        queryFn: async () => {
            const data = await axios.get("http://localhost:5172/api/dataset");
            let classGroups = [];
            for (const file of data.data.data) {
                let name = file.name.substr(0, file.name.indexOf("_"));
                let group = null;
                for (const c of classGroups) {
                    if (c.name === name) {
                        group = c;
                        break;
                    }
                }
                if (!group) {
                    group = {
                        id: nextId++,
                        name,
                        count: 1,
                    };
                    classGroups.push(group);
                } else {
                    group.count++;
                }
            }
            return classGroups;
        },
    });

    const mutation = useMutation({
        mutationFn: (newData) => {
            return axios.post("http://localhost:5172/api/dataset", newData);
        },
    });

    const saveToServer = () => {
        mutation.mutate({
            images,
            classes,
        });
    };

    return (
        <Container className="container-dataset">
            <Row>
                <a href="/">
                    <Button>Back</Button>
                </a>
            </Row>
            <Row>
                <Col md={6}>
                    <h3>{isMobile ? "Mobile" : "PC"}</h3>
                    <Form.Select
                        onChange={(event) => {
                            setActiveDeviceId(event.target.value);
                        }}
                    >
                        {devices.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>
                                {d.label}
                            </option>
                        ))}
                    </Form.Select>
                    <div className="m-2">
                        <Camera
                            ref={camera}
                            numberOfCamerasCallback={setNumberOfCameras}
                            aspectRatio={isMobile ? 3 / 4 : 4 / 3}
                            videoSourceDeviceId={activeDeviceId}
                            videoReadyCallback={async () => {
                                console.log("Video feed ready.");
                            }}
                        />
                        <canvas className="canvas1 d-none" />
                        <canvas className="canvas2 d-none" />
                    </div>

                    <ButtonGroup>
                        <Button
                            hidden={numberOfCameras <= 1}
                            onClick={() => {
                                camera.current.switchCamera();
                            }}
                        >
                            Change Camera
                        </Button>
                        <Button
                            hidden={numberOfCameras <= 1}
                            onClick={() => {
                                setCapturing(!capturing);
                                capturingRef.current = !capturing;
                            }}
                        >
                            {capturing ? "Stop" : "Detect Face"}
                        </Button>
                    </ButtonGroup>
                    <div className="m-2">
                        <img className="img1" />
                        <Button
                            hidden={image == null}
                            onClick={() => {
                                clearPreview();
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </Col>

                <Col md={6}>
                    <h3>Classes</h3>
                    <div className="input-group">
                        <span className="input-group-text">Class Name</span>
                        <input
                            className="form-control classname-input"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.code == "Enter") {
                                    inputClass();
                                }
                            }}
                        />
                        <Button onClick={inputClass}>Add</Button>
                    </div>
                    <div className="d-grid gap-2 mt-2">
                        {classes.map((c) => (
                            <Button
                                key={c.id}
                                size="lg"
                                onMouseDown={async () => {
                                    await captureImage(c);
                                }}
                            >
                                {c.name} ({classesTensorLabels.filter((m) => m == c.id).length})
                            </Button>
                        ))}
                    </div>
                    <div>
                        {mutation.isPending ? (
                            "Saving..."
                        ) : (
                            <>
                                {mutation.isError ? <span>An error has occurred: {mutation.error.message}</span> : null}
                                {mutation.isSuccess ? <span>Save success!</span> : null}
                                <Button onClick={saveToServer}>Save</Button>
                            </>
                        )}
                    </div>
                    <div>
                        <h4>Data from server</h4>
                        {status === "pending" ? <span>Loading...</span> : null}
                        {status === "success" ? (
                            <div className="d-grid gap-2 mt-2">
                                {dataset.map((d) => (
                                    <Button key={d.id} size="lg">
                                        {d.name} ({d.count})
                                    </Button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </Col>
            </Row>

            <ToastContainer limit={5} />
        </Container>
    );
}

export default App;
