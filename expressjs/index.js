import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import cors from "cors";
import birdsRouter from "./routers/birds.js";
import datasetRouter from "./routers/dataset.js";
import trainRouter from "./routers/train.js";
import authRouter from "./routers/auth.js";
import moment from "moment";
import path from "path";

const app = express();
const port = 5172;

app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: "4mb",
    })
);
app.use(bodyParser.json({ limit: "4mb" }));
app.use(methodOverride());

app.use("/model", express.static("./public/model"));

app.use((req, res, next) => {
    console.log("Time:", moment(Date.now()).format("Do MMMM YYYY, HH:mm:ss"), req.url, req.originalMethod);
    next();
});

app.get("/api", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/birds", birdsRouter);
app.use("/api/dataset", datasetRouter);
app.use("/api/train", trainRouter);
app.use("/api/auth", authRouter);

app.use(errorHandler);

function errorHandler(err, req, res, next) {
    res.status(500);
    // res.render("error", { error: err });
    console.log("ERROR LOG", err);
    res.send(err);
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
