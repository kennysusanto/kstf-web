import express from "express";
import multer from "multer";
import { uuidv4 } from "../helpers/misc.js";
import trainService from "../services/trainService.js";

const dirname = "./src/public/model";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dirname); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        // You can customize the filename here
        // For example, use the original filename with a timestamp
        // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".").pop());
        const uniquePrefix = uuidv4();
        cb(null, uniquePrefix + "_" + file.originalname);
    },
});

const upload = multer({ storage: storage });
const router = express.Router();

router.post("/", upload.any(), async (req, res, next) => {
    try {
        const saved = await trainService.saveModelFiles(req.files || []);
        res.json({ data: saved });
    } catch (error) {
        next(error);
    }
});

export default router;
