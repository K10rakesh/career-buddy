const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader){
        return res.status(401).json({
            "message": "Authentication required."
        });
    }
    const words = authHeader.split(" ");
    if (words.length !== 2 || words[0] !== "Bearer"){
        return res.status(401).json({
            "message": "Authentication required."
        });
    }
    const token = words[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            return res.status(401).json({
                message: "Invalid or expired token."
            });
        }
        req.userId = decoded.userId;
        next();
    }
    catch (err){
        return res.status(401).json({
            "message": "Invalid or expired token."
        });
    }
}

module.exports = authMiddleware;