import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import cors from "cors";
import birdsRouter from "./routers/birds.js";
import datasetRouter from "./routers/dataset.js";
import trainRouter from "./routers/train.js";
import authRouter from "./routers/auth.js";
import predictionRouter from "./routers/prediction.js";
import moment from "moment";
import path from "path";
import http from "http";
import https from "https";
import fs from "fs";
import db from "./persistence/index.js";

// const privateKey = fs.readFileSync("./cloudflare-private-key.pem", "utf8");
// const certificate = fs.readFileSync("./cloudflare-origin-cert.pem", "utf8");
// const credentials = { key: privateKey, cert: certificate };

const app = express();
const port = 5172;

const corsOptions = {
    origin: ["https://192.168.1.5:5173", "https://ksdedicated.work", "https://api.ksdedicated.work"], // Replace with your actual domain
};

app.use(cors(corsOptions));

app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: "4mb",
    })
);
app.use(bodyParser.json({ limit: "4mb" }));
app.use(methodOverride());

app.use(express.static("./static"));
app.use("/api/public", express.static("./src/public"));
app.use("/api/dataset", express.static("./src/public/dataset"));
app.use("/api/model", express.static("./src/public/model"));

app.use((req, res, next) => {
    console.log("Time:", moment(Date.now()).format("Do MMMM YYYY, HH:mm:ss"), req.url, req.originalMethod);
    next();
});

app.get("/api", (req, res) => {
    res.send("Hello World!");
});

// app.options("*", cors());
app.use("/api/birds", birdsRouter);
app.use("/api/dataset", datasetRouter);
app.use("/api/train", trainRouter);
app.use("/api/auth", authRouter);
app.use("/api/prediction", predictionRouter);
app.get("/api/version", (req, res) => {
    res.send("1.1.1");
});

app.use(errorHandler);

function errorHandler(err, req, res, next) {
    res.status(500);
    // res.render("error", { error: err });
    console.log("ERROR LOG", err);
    res.send(err);
}

db.init()
    .then(() => {
        // app.listen(3000, () => console.log('Listening on port 3000'));
        app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

// const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

// httpServer.listen(8080);
// httpsServer.listen(5171);

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGUSR2", gracefulShutdown); // Sent by nodemon
