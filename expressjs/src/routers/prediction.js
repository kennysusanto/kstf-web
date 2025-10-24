import express from "express";
import fs from "fs";
import { uuidv4, readFilesSync, readFilesSync2 } from "../helpers/misc.js";
import multer from "multer";
import path from "path";
import db from "../persistence/index.js";

const router = express.Router();
// middleware that is specific to this router
// const timeLog = (req, res, next) => {
//     console.log("Time: ", Date.now());
//     next();
// };
// router.use(timeLog);

// define the home page route
router.get("/", async (req, res, next) => {
    let toReturn = await db.getPredictions();
    res.json({ data: toReturn });
});

// define the about route
router.get("/about", (req, res) => {
    res.json({ message: "About prediction" });
});

// router.get("/:modelname", (req, res) => {
//     let bytes = readFileBytes(`${dirname}/${req.params.class}/${req.params.filename}`);
//     res.json({
//         data: bytes,
//     });
// });

router.post("/", async (req, res) => {
    let prediction = req.body;
    let id = await db.storePrediction(prediction);
    res.json({
        data: {
            id,
        },
    });
});

export default router;
