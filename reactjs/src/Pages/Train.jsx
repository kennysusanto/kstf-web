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
import ListGroup from "react-bootstrap/ListGroup";
import InputGroup from "react-bootstrap/InputGroup";

import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";

let nextId = 0;

function App() {
    const [image, setImage] = useState(null);
    const [images, setImages] = useState([]);
    const [browserWidth, setBrowserWidth] = useState(window.innerWidth);
    const [className, setClassName] = useState("");
    const [classesTensors, setClassesTensors] = useState([]);
    const [classesTensorLabels, setClassesTensorLabels] = useState([]);
    const [highestDataCount, setHighestDataCount] = useState(0);

    const STOP_DATA_GATHER = -1;

    let mobilenet = undefined;
    const [gatherDataState, setGatherDataState] = useState(STOP_DATA_GATHER);
    let videoPlaying = false;
    const [trainingDataInputs, setTrainingDataInputs] = useState([]);
    const [trainingDataOutputs, setTrainingDataOutputs] = useState([]);
    let examplesCount = [];
    const [model, setModel] = useState(undefined);
    const [mobileNetBase, setMobileNetBase] = useState(undefined);
    const [trainingComplete, setTrainingComplete] = useState(false);
    const [modelName, setModelName] = useState("");

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

    const processImage = async (classGroup) => {
        try {
            let pn = `${classGroup.id}_${classGroup.name}/${classGroup.data.name}${classGroup.data.ext}`;
            let url = `/api/dataset/${pn}`;
            url = encodeURI(url);
            // let response = await axios.get(url);
            // let base64img = response.data;
            // if (!base64img) {
            //     return;
            // }
            // if (mobileNetBase === undefined) {
            //     console.log("Mobile net base is undefined");
            // }
            // let fetchRes = await fetch(base64img);
            // let fetchBlob = await fetchRes.blob();
            // let fetchBlob = await base64img.blob();

            let fetchBlob = await axios.get(url, { responseType: "blob" });
            let bmp = await createImageBitmap(fetchBlob.data);
            let imageTensor = tf.tidy(function () {
                // read file bytes
                let videoFrameAsTensor = tf.browser.fromPixels(bmp);
                // Resize video frame tensor to be 224 x 224 pixels which is needed by MobileNet for input.
                let resizedTensorFrame = tf.image.resizeBilinear(
                    videoFrameAsTensor,
                    [Constants.MOBILE_NET_INPUT_HEIGHT, Constants.MOBILE_NET_INPUT_WIDTH],
                    true
                );

                let normalizedTensorFrame = resizedTensorFrame.div(255);

                return mobileNetBase.predict(normalizedTensorFrame.expandDims()).squeeze();
            });

            if (imageTensor === null) {
                return;
            }

            // images.push({ id: cc.id, name: cc.name, data });
            trainingDataInputs.push(imageTensor);
            trainingDataOutputs.push(classGroup.id);
            classesTensors.push(imageTensor);
            classesTensorLabels.push(classGroup.id);
            // let dataCount = trainingDataOutputs.filter((m) => m == cc.id).length;
            let dataCount = classesTensorLabels.filter((m) => m == classGroup.id).length;
            if (dataCount > highestDataCount) {
                setHighestDataCount(dataCount);
            }
        } catch (err) {
            console.error(err);
        }
    };

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
            let answer = nmobileNetBase.predict(tf.zeros([1, Constants.MOBILE_NET_INPUT_HEIGHT, Constants.MOBILE_NET_INPUT_WIDTH, 3]));
            // console.log(answer.shape);
        });
    };

    const trainAndPredict = async () => {
        setTrainingComplete(false);
        let model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [1280], units: 64, activation: "relu" }));
        model.add(tf.layers.dense({ units: dataset.length, activation: "softmax" }));

        model.summary();

        // Compile the model with the defined optimizer and specify a loss function to use.
        model.compile({
            // Adam changes the learning rate over time which is useful.
            optimizer: "adam",
            // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
            // Else categoricalCrossentropy is used if more than 2 classes.
            loss: dataset.length === 2 ? "binaryCrossentropy" : "categoricalCrossentropy",
            // As this is a classification problem you can record accuracy in the logs too!
            metrics: ["accuracy"],
        });
        setModel(model);

        tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);

        let outputsAsTensor = tf.tensor1d(trainingDataOutputs, "int32");
        let oneHotOutputs = tf.oneHot(outputsAsTensor, dataset.length);
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

        // Make combined model for download.

        let combinedModel = tf.sequential();
        combinedModel.add(mobileNetBase);
        combinedModel.add(model);

        combinedModel.compile({
            optimizer: "adam",
            loss: dataset.length === 2 ? "binaryCrossentropy" : "categoricalCrossentropy",
        });

        combinedModel.summary();
        console.log("TRAINING COMPLETE");
        // await combinedModel.save("downloads://my-model");
        let resp = await model.save(`/api/train`);

        let newName = modelName;
        for (const r of resp.responses) {
            r.json().then(async (rr) => {
                console.log(rr);
                let respRename = await axios.post(`/api/train/rename`, {
                    oldName: rr.data.uuid,
                    newName: newName,
                });
                modelsQuery.refetch();
            });
        }

        setModelName("");
        // axios.post("http://localhost:5172/api/train", { name: "unique", data: combinedModel });

        // predictLoop();
        setTrainingComplete(true);
        textToast("Training complete!");
        scrollToBottom();
    };

    const logProgress = (epoch, logs) => {
        console.log("Data for epoch " + epoch, logs);
    };

    const fetchQuery = async () => {
        const data = await axios.get(`/api/dataset`);
        let classGroups = data.data.data;
        for (const g of classGroups) {
            g.count = g.data.length;
            for (const file of g.data) {
                let id = g.id;
                let name = g.name;

                await processImage({
                    id,
                    name,
                    data: file,
                });
            }
        }
        return classGroups;
    };

    const {
        status,
        data: dataset,
        error,
    } = useQuery({
        queryKey: ["dataset"],
        queryFn: fetchQuery,
        enabled: mobileNetBase !== undefined && trainingDataInputs.length === 0,
    });

    const fetchModelsQuery = async () => {
        const data = await axios.get(`/api/train`);
        return data.data.data;
    };

    const modelsQuery = useQuery({
        queryKey: ["models"],
        queryFn: fetchModelsQuery,
    });

    return (
        <Container className="container-training">
            <Row className="mb-2">
                <div>
                    <Button href="/">Back</Button>
                </div>
            </Row>
            <Row>
                <Col md={12}>
                    <h3>Classes</h3>

                    <div>
                        {status === "pending" ? <span>Loading...</span> : null}
                        {status === "success" ? (
                            <div className="d-grid gap-2 mt-2">
                                {dataset.map((d) => (
                                    <Button key={d.id} variant="outline-secondary" disabled>
                                        {d.name} ({d.count})
                                    </Button>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {dataset !== undefined ? (
                        <div className="d-grid mt-2 ">
                            <InputGroup className="mb-2">
                                <InputGroup.Text>Model Name</InputGroup.Text>
                                <Form.Control value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="Awesome Model" />
                            </InputGroup>
                            <Button
                                className="mb-2"
                                variant="success"
                                disabled={highestDataCount == 0 || dataset.length == 0 || !dataset.every((m) => m.count == highestDataCount)}
                                title="Data count needs to be the same across all class"
                                onClick={() => {
                                    console.log("TRAINING");
                                    textToast("Training started");

                                    setTimeout(async () => {
                                        await trainAndPredict();
                                    }, 500);
                                }}
                            >
                                Train {modelName} on {dataset.length} classes
                            </Button>
                            <p>Highest data count: {highestDataCount}</p>
                            <p>
                                All class length the same as highest data count:{" "}
                                {dataset.every((m) => m.count == highestDataCount) ? "true" : "false"}
                            </p>
                        </div>
                    ) : null}

                    <h3>Models</h3>
                    <ListGroup>
                        {modelsQuery.status === "pending" ? <span>Loading...</span> : null}
                        {modelsQuery.status === "success" ? modelsQuery.data.map((m) => <ListGroup.Item key={m.uid}>{m.uid}</ListGroup.Item>) : null}
                    </ListGroup>
                </Col>
            </Row>

            <ToastContainer limit={5} />
        </Container>
    );
}

export default App;
