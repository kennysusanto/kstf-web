import express from "express";
import { uuidv4 } from "../helpers/misc.js";
import userRepository from "../repositories/userRepository.js";

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

router.post("/login", async (req, res, next) => {
    try {
        const email = String(req.body?.email || req.body?.username || "").trim().toLowerCase();
        const password = String(req.body?.password || "");

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Wrong password" });
        }

        const token = uuidv4();
        await userRepository.updateUserAccessTokenById(user.id, token);

        return res.json({
            message: "Login success",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                tenant_id: user.tenant_id,
            },
            token,
        });
    } catch (error) {
        return next(error);
    }
});

router.post("/logout", async (req, res, next) => {
    try {
        if (req.userId) {
            await userRepository.updateUserAccessTokenById(req.userId, null);
        }

        const message = "Logout success";
        res.json({ message });
    } catch (error) {
        next(error);
    }
});

export default router;
