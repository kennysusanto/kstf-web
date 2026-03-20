import express from "express";
import datasetService from "../services/datasetService.js";

const router = express.Router();
// middleware that is specific to this router
// const timeLog = (req, res, next) => {
//     console.log("Time: ", Date.now());
//     next();
// };
// router.use(timeLog);

// define the home page route
router.get("/", (req, res, next) => {
    try {
        const groups = datasetService.listDatasetGroups(req.user.tenant_id);
        res.json({ data: groups });
    } catch (error) {
        next(error);
    }
    // let files = readFilesSync("./public/dataset");
    // res.json({ data: files });
});
// define the about route
router.get("/about", (req, res) => {
    res.json({ message: "About dataset" });
});

// router.get("/:class/:filename", (req, res) => {
//     let bytes = readFileBytes(`./public/dataset/${req.params.class}/${req.params.filename}`);
//     res.json({
//         data: bytes,
//     });
// });

router.post("/", (req, res, next) => {
    try {
        const saved = datasetService.saveDatasetImages(req.user.tenant_id, req.body.images || []);
        res.json({ data: saved });
    } catch (error) {
        next(error);
    }
});

router.get("/class/:id", async (req, res, next) => {
    try {
        const foundClass = await datasetService.getDatasetClass(req.user.tenant_id, req.params.id);
        res.json({ data: foundClass });
    } catch (error) {
        next(error);
    }
});

const createClassHandler = (req, res, next) => {
    try {
        const created = datasetService.createDatasetClass(req.user.tenant_id, req.body?.name);
        res.json({ ...created, data: created });
    } catch (error) {
        next(error);
    }
};

router.post("/class", createClassHandler);

router.delete("/:folder", (req, res, next) => {
    try {
        datasetService.deleteDatasetClassFolder(req.user.tenant_id, req.params.folder);
        res.json({
            data: "success",
        });
    } catch (error) {
        next(error);
    }
});

router.delete("/:folder/:filename", (req, res, next) => {
    try {
        datasetService.deleteDatasetClassFile(req.user.tenant_id, req.params.folder, req.params.filename);
        res.json({
            data: "success",
        });
    } catch (error) {
        next(error);
    }
});

export default router;
