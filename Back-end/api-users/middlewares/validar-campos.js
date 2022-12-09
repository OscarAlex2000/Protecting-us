const { validationResult } = require('express-validator');

const validarCampos = (req, res, next) => {
    const errors = validationResult(req).formatWith(({ location, msg, param, value, nestedErrors }) => {
        if ((Object.keys(msg).includes('value'))) {
            value = msg.value;
        }

        return { location, param, msg: msg.msg, msg_es: msg.msg_es, value, nestedErrors };
    });

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(400).json(errors.array());
    }

    next();
}

module.exports = {
    validarCampos
}