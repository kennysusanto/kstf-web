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

router.get("/", async (req, res, next) => {
    try {
        const models = await trainService.listModels(req.user.tenant_id);
        res.json({ data: models });
    } catch (error) {
        next(error);
    }
});

router.post("/", upload.any(), async (req, res, next) => {
    try {
        const saved = await trainService.saveModelFiles(req.files || []);
        res.json({ data: saved });
    } catch (error) {
        next(error);
    }
});

router.post("/rename", async (req, res, next) => {
    try {
        const renamed = await trainService.renameModel(req.user.tenant_id, req.body.oldName, req.body.newName);
        res.json(renamed);
    } catch (error) {
        next(error);
    }
});

router.delete("/:folder", async (req, res, next) => {
    try {
        await trainService.deleteModel(req.user.tenant_id, req.params.folder);
        res.json({
            data: "success",
        });
    } catch (error) {
        next(error);
    }
});

export default router;
