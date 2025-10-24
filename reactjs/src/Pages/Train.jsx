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
// import ListGroup from "react-bootstrap/ListGroup";
// import InputGroup from "react-bootstrap/InputGroup";

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
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import Typography from "@mui/material/Typography";

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
    const [showDialog, setShowDialog] = useState(false);
    const [dialogData, setDialogData] = useState(null);
    const [models, setModels] = useState([]);
    const [epoch, setEpoch] = useState(5);

    const isMobile = browserWidth <= 768;

    const handleCloseDialog = () => {
        setDialogData(null);
        setShowDialog(false);
    };

    const handleDialogDelete = async () => {
        textToast(`Delete`);
        setDialogData(null);
        setShowDialog(false);

        await axios.delete(`api/train/${dialogData.uid}`);
        setModels([]);
        const dd = await modelsQuery.refetch();
        setModels(dd.data);
    };

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
            let temp = trainingDataInputs;
            temp.push(imageTensor);
            setTrainingDataInputs(temp);
            temp = trainingDataOutputs;
            temp.push(classGroup.id);
            setTrainingDataOutputs(temp);
            temp = classesTensors;
            temp.push(imageTensor);
            setClassesTensors(temp);
            temp = classesTensorLabels;
            temp.push(classGroup.id);
            setClassesTensorLabels(temp);
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
        // let domain = window.location.protocol + "//" + window.location.hostname + (window.location.port != "" ? ":" + window.location.port : "");
        // const URL = `${domain}/api/public/model.json`;
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
            epochs: epoch,
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
        let domain = window.location.protocol + "//" + window.location.hostname + (window.location.port != "" ? ":" + window.location.port : "");
        let resp = await model.save(`${domain}/api/train`);

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

    const modelsQuery = useQuery({
        queryKey: ["models"],
        queryFn: async () => {
            const data = await axios.get(`/api/train`);

            setModels(data.data.data);

            return data.data.data;
        },
    });

    const listStyle = {
        py: 0,
        width: "100%",
        maxWidth: 360,
        borderRadius: 12,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
    };

    return (
        <Container className="container-training">
            <Grid container columns={12} spacing={2}>
                <Grid size={12}>
                    <Button variant="contained" href="/">
                        Back
                    </Button>
                </Grid>

                <Grid size={{ sm: 12, md: 6 }}>
                    <Grid container spacing={2} columns={12}>
                        <Grid size={12}>
                            <Typography variant="h5">Classes</Typography>
                        </Grid>
                        <Grid size={12}>
                            <div>
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
                            </div>
                        </Grid>
                        <Grid size={12}>
                            {dataset !== undefined ? (
                                <Grid container columns={12} spacing={2}>
                                    <Grid size={12}>
                                        <TextField
                                            value={epoch}
                                            label="Epoch"
                                            onChange={(e) => setEpoch(e.target.value)}
                                            type="number"
                                            variant="filled"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            value={modelName}
                                            label="Model name"
                                            onChange={(e) => setModelName(e.target.value)}
                                            placeholder="Awesome Model"
                                            variant="filled"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <Button
                                            className="mb-2"
                                            variant="contained"
                                            color="success"
                                            disabled={
                                                highestDataCount == 0 || dataset.length == 0 || !dataset.every((m) => m.count == highestDataCount)
                                            }
                                            title="Data count needs to be the same across all class"
                                            onClick={() => {
                                                console.log("TRAINING");
                                                textToast("Training started");

                                                setTimeout(async () => {
                                                    await trainAndPredict();
                                                }, 500);
                                            }}
                                            fullWidth
                                        >
                                            Train {modelName} on {dataset.length} classes
                                        </Button>
                                    </Grid>
                                </Grid>
                            ) : null}
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="h5">Models</Typography>
                        </Grid>
                        <Grid size={12}>
                            <List style={listStyle}>
                                {modelsQuery.status === "pending" ? <span>Loading...</span> : null}
                                {modelsQuery.status === "success"
                                    ? models.map((m) => (
                                          <>
                                              <ListItemButton
                                                  key={m.uid}
                                                  onClick={() => {
                                                      setDialogData({
                                                          ...m,
                                                      });
                                                      setShowDialog(true);
                                                  }}
                                              >
                                                  <ListItemText primary={m.uid}></ListItemText>
                                              </ListItemButton>
                                              <Divider component="li" />
                                          </>
                                      ))
                                    : null}
                            </List>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Dialog open={showDialog} onClose={handleCloseDialog}>
                <DialogTitle id="alert-dialog-title">{"Data"}</DialogTitle>
                <DialogContent>
                    {dialogData == null ? null : (
                        <DialogContentText id="alert-dialog-description">
                            You are viewing <b>{dialogData.uid}</b>
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleDialogDelete} autoFocus variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <ToastContainer limit={5} />
        </Container>
    );
}

export default App;
