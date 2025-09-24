import express from "express";
import fs from "fs";
import { uuidv4, readFilesSync, readFilesSync2 } from "../helpers/misc.js";
import path from "path";

const router = express.Router();

// middleware that is specific to this router
// const timeLog = (req, res, next) => {
//     console.log("Time: ", Date.now());
//     next();
// };
// router.use(timeLog);

router.get("/", (req, res, next) => {});

router.get("/about", (req, res) => {
    res.json({ message: "About auth" });
});

router.post("/login", (req, res) => {
    let correct1 = req.body.username === "admin";
    let correct2 = req.body.password === "admin";

    let returnObj = {
        message: "User not found",
    };
    if (correct1 && correct2) {
        returnObj.message = "Login success";
        returnObj.user = {
            id: 1,
            username: req.body.username,
            role: "super admin",
        };
        returnObj.token = "somethinghere";
    } else if (correct1) {
        returnObj.message = "Wrong password";
    }

    res.json(returnObj);
});

router.post("/logout", (req, res) => {
    let message = "Logout success";
    res.json({ message });
});

export default router;
