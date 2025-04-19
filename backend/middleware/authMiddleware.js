import jwt from "jsonwebtoken";
import redisClient  from "../services/redisServices.js";

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "Unauthorized user" });
    }

    const isBlacklisted = await redisClient.get(token);

    if(isBlacklisted) {
        return res.status(401).json({ message: "Unauthorized user" });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
        return res.status(403).json({ message: "Invalid token" });
        }
        req.user = decoded;
        next();
    });
    }

    export default authMiddleware;