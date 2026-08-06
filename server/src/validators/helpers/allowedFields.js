const {body} = require('express-validator');
const allowedFields = (allowedFieldsList) => {
    return body().custom((requestBody) => {
        const hasUnexpectedFields = Object.keys(requestBody).some((key) => !allowedFieldsList.includes(key));
        if (hasUnexpectedFields){
            throw new Error('unexpected field found in request');
        }
        return true;
    })
}
module.exports = allowedFields;