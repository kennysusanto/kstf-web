import express from "express";
import { uuidv4 } from "../helpers/misc.js";
import userService from "../services/userService.js";

const router = express.Router();

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value) {
    return isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function badRequest(res, message) {
    return res.status(400).json({
        message,
        data: null,
    });
}

router.get("/", async (req, res, next) => {
    try {
        const data = await userService.getUsers();
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

        const data = await userService.getUser(req.params.id);
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

        if (!isValidEmail(req.body?.email)) {
            return badRequest(res, "valid email is required");
        }

        if (!isNonEmptyString(req.body?.password)) {
            return badRequest(res, "password is required");
        }

        const item = {
            id: uuidv4(),
            name: req.body.name.trim(),
            email: req.body.email.trim().toLowerCase(),
            password: req.body.password,
            tenant_id: req.body?.tenant_id || null,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
        };

        await userService.storeUser(item);
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

        if (!isValidEmail(req.body?.email)) {
            return badRequest(res, "valid email is required");
        }

        if (!isNonEmptyString(req.body?.password)) {
            return badRequest(res, "password is required");
        }

        const item = {
            name: req.body.name.trim(),
            email: req.body.email.trim().toLowerCase(),
            password: req.body.password,
            tenant_id: req.body?.tenant_id || null,
            updated_at: new Date(),
        };

        await userService.updateUser(req.params.id, item);
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

        await userService.removeUser(req.params.id);
        res.json({ data: "success" });
    } catch (error) {
        next(error);
    }
});

export default router;
