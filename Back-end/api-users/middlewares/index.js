const validaCampos = require('../middlewares/validar-campos');
const validarJWT = require('../middlewares/validar-jwt');
const db = require('../middlewares/db');

module.exports = {
    ...validaCampos,
    ...validarJWT,
    ...db
}