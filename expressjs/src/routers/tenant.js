import express from "express";
import { uuidv4 } from "../helpers/misc.js";
import tenantService from "../services/tenantService.js";

const router = express.Router();

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function badRequest(res, message) {
    return res.status(400).json({
        message,
        data: null,
    });
}

router.get("/", async (req, res, next) => {
    try {
        const data = await tenantService.getTenants();
        res.json({ data });
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        if (!isNonEmptyString(req.params.id)) {
            return badRequest(res, "id is required");
        }

        const data = await tenantService.getTenant(req.params.id);
        res.json({ data });
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        if (!isNonEmptyString(req.body?.name)) {
            return badRequest(res, "name is required");
        }

        const item = {
            id: uuidv4(),
            name: req.body.name.trim(),
            display_name: isNonEmptyString(req.body?.display_name) ? req.body.display_name.trim() : null,
            parent_id: req.body?.parent_id || null,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
        };

        await tenantService.storeTenant(item);
        res.json({ data: item });
    } catch (error) {
        next(error);
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        if (!isNonEmptyString(req.params.id)) {
            return badRequest(res, "id is required");
        }

        if (!isNonEmptyString(req.body?.name)) {
            return badRequest(res, "name is required");
        }

        const item = {
            name: req.body.name.trim(),
            display_name: isNonEmptyString(req.body?.display_name) ? req.body.display_name.trim() : null,
            parent_id: req.body?.parent_id || null,
            updated_at: new Date(),
        };

        await tenantService.updateTenant(req.params.id, item);
        res.json({ data: "success" });
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        if (!isNonEmptyString(req.params.id)) {
            return badRequest(res, "id is required");
        }

        await tenantService.removeTenant(req.params.id);
        res.json({ data: "success" });
    } catch (error) {
        next(error);
    }
});

export default router;
