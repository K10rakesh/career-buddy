const requireAtLeastOneField = (req, res, next) => {
    if (Object.keys(req.body).length === 0){
        return res.status(400).json({
            message: "At least one field is required."
        });
    }

    next();
};

module.exports = requireAtLeastOneField;