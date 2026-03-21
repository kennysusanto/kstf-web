import express from "express";
import datasetService from "../services/datasetService.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const groups = await datasetService.listDatasetImagesDB(req.user.tenant_id);
        res.json({ data: groups });
    } catch (error) {
        next(error);
    }
});

router.get("/files", async (req, res, next) => {
    try {
        const groups = await datasetService.listDatasetImagesFiles(req.user.tenant_id);
        res.json({ data: groups });
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

router.post("/", async (req, res, next) => {
    try {
        const saved = await datasetService.saveDatasetImages(req.user.tenant_id, req.body.images || []);
        res.json({ data: saved });
    } catch (error) {
        next(error);
    }
});

router.post("/class", async (req, res, next) => {
    try {
        const created = await datasetService.createDatasetClass(req.user.tenant_id, req.body?.name);
        res.json({ ...created, data: created });
    } catch (error) {
        next(error);
    }
});

router.delete("/:folder", async (req, res, next) => {
    try {
        await datasetService.deleteDatasetClassFolder(req.user.tenant_id, req.params.folder);
        res.json({
            data: "success",
        });
    } catch (error) {
        next(error);
    }
});

router.delete("/:folder/:filename", async (req, res, next) => {
    try {
        await datasetService.deleteDatasetClassFile(req.user.tenant_id, req.params.folder, req.params.filename);
        res.json({
            data: "success",
        });
    } catch (error) {
        next(error);
    }
});

export default router;
