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
import moment from "moment";

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
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";

const columns = [
    { field: "c", headerName: "Class", width: 120, valueGetter: (value, row) => `${row.classname} (${row.confidence}%)` },
    // { field: "confidence", headerName: "Confidence", width: 80 },
    {
        field: "createdat",
        headerName: "Time",
        width: 180,
        valueGetter: (value, row) => `${moment(row.createdat).format("DD-MM-YYYY HH:mm:ss")}`,
    },
];
// const columns = [
//     { field: "id", headerName: "ID", width: 70 },
//     { field: "firstName", headerName: "First name", width: 130 },
//     { field: "lastName", headerName: "Last name", width: 130 },
//     {
//         field: "age",
//         headerName: "Age",
//         type: "number",
//         width: 90,
//     },
//     {
//         field: "fullName",
//         headerName: "Full name",
//         description: "This column has a value getter and is not sortable.",
//         sortable: false,
//         width: 160,
//         valueGetter: (value, row) => `${row.firstName || ""} ${row.lastName || ""}`,
//     },
// ];

// const rows = [
//     { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
//     { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
//     { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
//     { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
//     { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
//     { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
//     { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
//     { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
//     { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
// ];

const paginationModel = { page: 0, pageSize: 5 };

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
    const [showDialog, setShowDialog] = useState(false);
    const [dialogData, setDialogData] = useState(null);

    const isMobile = browserWidth <= 768;

    const handleCloseDialog = () => {
        setDialogData(null);
        setShowDialog(false);
    };

    const handleDialogDelete = async () => {
        textToast(`Delete`);
        setDialogData(null);
        setShowDialog(false);

        await axios.delete(`api/dataset/${dialogData.folder}/${dialogData.filename}`);
        setClasses([]);
        const dd = await refetch();
        let classGroups = dd.data;
        classGroups = classGroups.map((m) => ({
            ...m,
            count: m.data.length,
        }));

        // sync to local array
        const temp = [];
        for (const g of classGroups) {
            if (temp.find((m) => m.id === g.id)) {
                continue;
            }
            temp.push(g);
        }
        setClasses(temp);
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

    const {
        status,
        data: rows,
        error,
        isFetching,
        refetch,
        remove,
    } = useQuery({
        queryKey: ["dataset"],
        queryFn: async () => {
            const data = await axios.get(`/api/prediction`);
            return data.data.data;
        },
        // enabled: false,
    });

    // const mutation = useMutation({
    //     mutationFn: (newData) => {
    //         return axios.post(`/api/dataset`, newData);
    //     },
    // });

    // const saveToServer = () => {
    //     mutation.mutate({
    //         images,
    //         classes,
    //     });
    //     setDataChanged(false);
    // };

    // const getUrl = (classId, className, fileName, ext) => {
    //     const apiVersion = "v1";
    //     const resourceId = "item-456";
    //     const endpoint = `/api/dataset/${classId}_${className}/${fileName}${ext}`;
    //     const fullUrl = `${window.location.origin}${endpoint}`;
    //     // console.log(fullUrl);
    //     return fullUrl;
    // };

    return (
        <Container className="container-dataset">
            <Grid container columns={12} spacing={2}>
                <Grid size={12}>
                    <Button variant="contained" href="/">
                        Back
                    </Button>
                </Grid>

                <Grid size={{ sm: 12, md: 6 }}>
                    <Grid container spacing={1} columns={12}>
                        <Grid size={12}>
                            <Typography variant="h5">Dashboard</Typography>
                        </Grid>
                        <Grid size={12}>
                            <Paper sx={{ height: 400, width: "100%" }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    initialState={{ pagination: { paginationModel } }}
                                    pageSizeOptions={[5, 10]}
                                    // checkboxSelection
                                    sx={{ border: 0 }}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Dialog open={showDialog} onClose={handleCloseDialog}>
                <DialogTitle id="alert-dialog-title">{"Data"}</DialogTitle>
                <DialogContent>
                    {dialogData == null ? null : <img srcSet={dialogData.url} src={dialogData.url} loading="lazy" />}
                    {/* <DialogContentText id="alert-dialog-description">Hi</DialogContentText> */}
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
