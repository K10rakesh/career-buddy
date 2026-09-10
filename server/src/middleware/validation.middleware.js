const {matchedData, validationResult} = require('express-validator');
const validationMiddleware = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()){
        return res.status(400).json({errors: result.array()});
    }
    req.validatedData = matchedData(req, {
        includeOptionals: true
    });
    next();
}
module.exports = validationMiddleware;