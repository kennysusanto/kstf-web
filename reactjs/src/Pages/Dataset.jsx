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

// import Container from "react-bootstrap/Container";
// import Row from "react-bootstrap/Row";
// import Col from "react-bootstrap/Col";
// import Button from "react-bootstrap/Button";
// import Form from "react-bootstrap/Form";
// import ButtonGroup from "react-bootstrap/ButtonGroup";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ButtonGroup from "@mui/material/ButtonGroup";

import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import Typography from "@mui/material/Typography";

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
    const [activeDeviceId, setActiveDeviceId] = useState("");
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
    const [dataChanged, setDataChanged] = useState(false);

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
            if (videoDevices.length > 0) {
                setActiveDeviceId(videoDevices[0].deviceId);
            }
        })();
    }, []);

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
        classes.find((m) => m.id == cc.id).count++;
        // let dataCount = trainingDataOutputs.filter((m) => m == cc.id).length;
        let dataCount = classesTensorLabels.filter((m) => m == cc.id).length;
        if (dataCount > highestDataCount) {
            setHighestDataCount(dataCount);
        }
        setDataChanged(true);
    };

    const uuidv4 = () => {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
            (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
        );
    };

    const generateId = () => {
        let newId = uuidv4();
        if (classes != undefined && classes.length > 0) {
            let conflict = classes.some((m) => m.id === newId);
            while (conflict) {
                newId = uuidv4();
                conflict = classes.some((m) => m.id === newId);
            }
        }
        if (dataset != undefined && dataset.length > 0) {
            let conflict = dataset.some((m) => m.id == newId);
            while (conflict) {
                newId = uuidv4();
                conflict = dataset.some((m) => m.id === newId);
            }
        }
        return newId;
    };

    const inputClass = () => {
        if (className != "") {
            classes.push({
                id: generateId(),
                name: className,
                count: 0,
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
            const data = await axios.get(`/api/dataset`);
            let classGroups = data.data.data;
            classGroups = classGroups.map((m) => ({
                ...m,
                count: m.data.length,
            }));

            // sync to local array
            for (const g of classGroups) {
                if (classes.find((m) => m.id === g.id)) {
                    continue;
                }
                classes.push(g);
            }

            return classGroups;
        },
    });

    const mutation = useMutation({
        mutationFn: (newData) => {
            return axios.post(`/api/dataset`, newData);
        },
    });

    const saveToServer = () => {
        mutation.mutate({
            images,
            classes,
        });
        setDataChanged(false);
    };

    return (
        <Container className="container-dataset">
            <Grid container columns={12} spacing={2}>
                <Grid size={12}>
                    <Button variant="contained" href="/">
                        Back
                    </Button>
                </Grid>
                <Grid size={{ sm: 12, md: 6 }} style={{ width: "100%" }}>
                    {/* <h3>{isMobile ? "Mobile" : "PC"}</h3> */}
                    <Select
                        onChange={(event) => {
                            setActiveDeviceId(event.target.value);
                        }}
                        value={activeDeviceId}
                        fullWidth
                    >
                        {devices.map((d) => (
                            <MenuItem key={d.deviceId} value={d.deviceId}>
                                {d.label}
                            </MenuItem>
                        ))}
                    </Select>
                    <Grid container columns={12} spacing={1}>
                        <Grid size={6}>
                            <div className="m-2" style={{ width: "100%" }}>
                                <Camera
                                    ref={camera}
                                    numberOfCamerasCallback={(val) => {
                                        textToast("Check your camera");
                                        setNumberOfCameras(val);
                                    }}
                                    aspectRatio={isMobile ? 3 / 4 : 4 / 3}
                                    videoSourceDeviceId={activeDeviceId}
                                    videoReadyCallback={async () => {
                                        console.log("Video feed ready.");
                                    }}
                                />
                                <canvas className="canvas1 d-none" />
                                <canvas className="canvas2 d-none" />
                            </div>

                            <ButtonGroup variant="outlined" sx={{ width: "100%" }}>
                                <Button
                                    hidden={numberOfCameras <= 1}
                                    onClick={() => {
                                        camera.current.switchCamera();
                                    }}
                                >
                                    Flip Camera
                                </Button>
                                <Button
                                    hidden={numberOfCameras <= 1}
                                    onClick={() => {
                                        setCapturing(!capturing);
                                        capturingRef.current = !capturing;
                                    }}
                                >
                                    {capturing ? "Stop Track" : "Track Face"}
                                </Button>
                            </ButtonGroup>
                        </Grid>
                        <Grid size={6}>
                            <div className="m-2">
                                <img className="img1" width="100%" />
                                {image != null ? (
                                    <Button
                                        onClick={() => {
                                            clearPreview();
                                        }}
                                        variant="contained"
                                    >
                                        Clear
                                    </Button>
                                ) : null}
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid size={{ sm: 12, md: 6 }}>
                    <Grid container spacing={1} columns={12}>
                        <Grid size={12}>
                            <Typography variant="h5">Classes</Typography>
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                className="form-control classname-input"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.code == "Enter") {
                                        inputClass();
                                    }
                                }}
                                variant="filled"
                                label="Class name"
                                fullWidth
                            />
                        </Grid>
                        <Grid size={12}>
                            <Button onClick={inputClass} disabled={status !== "success"} variant="contained" color="success" fullWidth>
                                Add
                            </Button>
                        </Grid>
                        <Grid size={12}>
                            <Grid container spacing={2}>
                                {classes.map((c) => (
                                    <Grid>
                                        <Button
                                            key={c.id}
                                            size="lg"
                                            onMouseDown={async () => {
                                                await captureImage(c);
                                            }}
                                            variant="contained"
                                        >
                                            {c.name} ({c.count})
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                        <Grid size={12}>
                            {mutation.isPending ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Button onClick={saveToServer} variant="contained" color="success" disabled={!dataChanged}>
                                        Save
                                    </Button>
                                    {mutation.isError ? <span>An error has occurred: {mutation.error.message}</span> : null}
                                    {mutation.isSuccess ? <span>Save success!</span> : null}
                                </>
                            )}
                        </Grid>
                        {/* <Grid size={12}>
                            <h4>Data from server</h4>
                            {status === "pending" ? <span>Loading...</span> : null}
                            {status === "success" ? (
                                <Grid container spacing={2}>
                                    {dataset.map((d) => (
                                        <Grid>
                                            <Button key={d.id} variant="outlined" disabled>
                                                {d.name} ({d.count})
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : null}
                        </Grid> */}
                    </Grid>
                </Grid>
            </Grid>
            <ToastContainer limit={5} />
        </Container>
    );
}

export default App;
