const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token){
        return res.status(401).json({
            "message": "Authentication required."
        });
    }
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