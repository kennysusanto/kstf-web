import express from "express";
import fs from "fs";
import { uuidv4, readFilesSync, readFileBytes } from "../helpers/misc.js";

const router = express.Router();

// middleware that is specific to this router
// const timeLog = (req, res, next) => {
//     console.log("Time: ", Date.now());
//     next();
// };
// router.use(timeLog);

// define the home page route
router.get("/", (req, res) => {
    let files = readFilesSync("./public/dataset");
    res.json({ data: files });
});
// define the about route
router.get("/about", (req, res) => {
    res.json({ message: "About dataset" });
});

router.get("/:class/:filename", (req, res) => {
    let bytes = readFileBytes(`./public/dataset/${req.params.class}/${req.params.filename}`);
    res.json({
        data: bytes,
    });
});

router.post("/", (req, res) => {
    // console.log(req.body);
    let dd = [];
    for (const group of req.body.images) {
        let { id, name, data } = group;
        let uuid = uuidv4();
        dd.push({ id, name, uuid });
        let dir = `./public/dataset/${id}_${name}`;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        let idx = data.indexOf(",");
        let buff = Buffer.from(data.substr(idx), "base64");

        fs.writeFileSync(`${dir}/${name}_${uuid}.png`, buff);
    }
    res.json({ data: dd });
});

export default router;
