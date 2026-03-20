import userRepository from "../repositories/userRepository.js";

export default async function authContext(req, res, next) {
    req.userId = null;
    req.user = null;

    try {
        const authorization = req.headers.authorization || "";

        if (!authorization.toLowerCase().startsWith("bearer ")) {
            return next();
        }

        const token = authorization.substring(7).trim();
        if (!token) {
            return next();
        }

        const user = await userRepository.getUserByAccessToken(token);
        if (!user) {
            return next();
        }

        req.userId = user.id;
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            tenant_id: user.tenant_id,
        };

        return next();
    } catch (error) {
        return next(error);
    }
}
