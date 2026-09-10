const allowedFields = (allowedFieldsList) => {
    return (req, res, next) => {
        const hasUnexpectedFields = Object.keys(req.body).some((key) => {
            return !allowedFieldsList.includes(key);
        });

        if (hasUnexpectedFields){
            return res.status(400).json({
                message: "Unexpected field found in request."
            });
        }

        next();
    };
};

module.exports = allowedFields;