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
import ToggleButton from "react-bootstrap/ToggleButton";
import ListGroup from "react-bootstrap/ListGroup";

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
    const [highestDataCount, setHighestDataCount] = useState(0);

    const isMobile = browserWidth <= 768;

    let mobilenet = undefined;
    const [mobileNetBase, setMobileNetBase] = useState(undefined);
    const [predictRes, setPredictRes] = useState(undefined);
    const [modelValue, setModelValue] = useState("");
    const [useModel, setUseModel] = useState(undefined);

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
        (async () => {
            await loadMobileNetFeatureModel();
        })();
    }, []);

    useEffect(() => {
        if (!capturing) {
            return;
        }
        detectFaceLoop();
    }, [capturing]);

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
            let answer = nmobileNetBase.predict(tf.zeros([1, Constants.MOBILE_NET_INPUT_HEIGHT, Constants.MOBILE_NET_INPUT_WIDTH, 3]));
            // console.log(answer.shape);
        });
    };

    const detectFaceLoop = () => {
        if (capturingRef.current && useModel != undefined && mobileNetBase != undefined) {
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

                    let imageFeatures = calculateFaceTensor(false);
                    if (imageFeatures != null) {
                        tf.tidy(function () {
                            let startDate = new Date();
                            // let imageFeatures = calculateFeaturesOnCurrentFrame();
                            let prediction = useModel.predict(imageFeatures.expandDims()).squeeze();
                            let highestIndex = prediction.argMax().arraySync();
                            let predictionArray = prediction.arraySync();
                            // Do your operations
                            let endDate = new Date();
                            let ms = endDate.getTime() - startDate.getTime();
                            // console.log(highestIndex, ms);
                            if (classes !== undefined) {
                                // console.log(classes[highestIndex].name, ms);
                                setPredictRes({
                                    name: classes[highestIndex].name,
                                    confidence: Math.floor(predictionArray[highestIndex] * 100),
                                    spent: ms,
                                });
                            }
                        });
                    } else {
                        setPredictRes(null);
                    }
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

    const calculateFaceTensor = (showToast = true) => {
        // const estimationConfig = { flipHorizontal: false };
        // const faces = await detector.estimateFaces(video, estimationConfig);

        // if (faces.length > 0) {
        // let r = faces[0].box;
        let canvas = document.querySelector(".container-dataset .canvas2");
        let image = document.querySelector(".container-dataset .img1");
        // let ctx = canvas.getContext("2d");
        // canvas.width = Constants.MOBILE_NET_INPUT_WIDTH;
        // canvas.height = Constants.MOBILE_NET_INPUT_HEIGHT;
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.drawImage(video, r.xMin, r.yMin, r.width, r.height, 0, 0, canvas.width, canvas.height);
        // // ctx.drawImage(video, r.xMin, r.yMin, r.width, r.height, 0, 0, r.width, r.height);
        // let data = canvas.toDataURL("image/png");
        // image.setAttribute("src", data);
        // image.style.visibility = "visible";

        // image.style.display = "block";

        return tf.tidy(function () {
            let videoFrameAsTensor = tf.browser.fromPixels(canvas);
            // Resize video frame tensor to be 224 x 224 pixels which is needed by MobileNet for input.
            let resizedTensorFrame = tf.image.resizeBilinear(
                videoFrameAsTensor,
                [Constants.MOBILE_NET_INPUT_HEIGHT, Constants.MOBILE_NET_INPUT_WIDTH],
                true
            );

            let normalizedTensorFrame = resizedTensorFrame.div(255);

            return mobileNetBase.predict(normalizedTensorFrame.expandDims()).squeeze();
            //return normalizedTensorFrame;
        });
        // } else {
        //     if (showToast) {
        //         textToast("Face not detected!");
        //     }

        //     return null;
        // }
    };

    const {
        status,
        data: models,
        error,
    } = useQuery({
        queryKey: ["models"],
        queryFn: async () => {
            const data = await axios.get(`/api/train`);

            return data.data.data;
        },
    });

    const alertClicked = () => {
        alert("You clicked the third ListGroupItem");
    };

    useEffect(() => {
        if (modelValue === "") {
            return;
        }
        console.log("Loading model value", `/api/model/${modelValue}/model.json`);
        (async () => {
            const model = await tf.loadLayersModel(`/api/model/${modelValue}/model.json`);
            model.summary();
            setUseModel(model);

            setCapturing(!capturing);
            capturingRef.current = !capturing;
            scrollToBottom();
        })();
        // http://localhost:5172/model/f755f2b4-dcd3-49e1-b0a8-23976c0f13e0/model.json
        // http://localhost:5172/model/f755f2b4-dcd3-49e1-b0a8-23976c0f13e0/model.weights.bin
    }, [modelValue]);

    const {
        status2,
        data: classes,
        error2,
    } = useQuery({
        queryKey: ["classes"],
        queryFn: async () => {
            const data = await axios.get(`/api/dataset`);
            let classGroups = data.data.data;

            return classGroups;
        },
        // enabled: mobileNetBase !== undefined && useModel !== undefined,
    });

    return (
        <Container className="container-dataset">
            <Row className="mb-2">
                <div>
                    <Button href="/">Back</Button>
                </div>
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
                                scrollToBottom();
                                if (capturing) {
                                    setModelValue("");
                                }
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
                    <h3>Models</h3>
                    <ListGroup>
                        {status === "pending" ? <span>Loading...</span> : null}
                        {status === "success"
                            ? models.map((m) => (
                                  <ListGroup.Item
                                      key={m.uid}
                                      action
                                      onClick={() => {
                                          setModelValue(m.uid);
                                          setCapturing(false);
                                          capturingRef.current = false;
                                          scrollToBottom();
                                      }}
                                      active={modelValue == m.uid}
                                  >
                                      {m.uid}
                                  </ListGroup.Item>
                              ))
                            : null}
                    </ListGroup>
                    {predictRes === undefined || !capturing ? null : (
                        <p className="mt-2">
                            Predicted {predictRes.name} ({predictRes.confidence}%) in {predictRes.spent}ms
                        </p>
                    )}
                </Col>
            </Row>

            <ToastContainer limit={5} />
        </Container>
    );
}

export default App;
