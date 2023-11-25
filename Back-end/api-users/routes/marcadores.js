const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos, validarJWT, db_connection } = require('../middlewares');
const { existeMarcadorPorId } = require('../helpers');

const { marksGet, markPost, markDelete } = require('../controllers/marcadoresCtrl');

const router = Router();

// Ruta para obtener todos los marcadores en el mapa
router.get('/', [
    db_connection,
    validarJWT,
    validarCampos
], marksGet);

// Ruta para agregar y/o actualizar los marcadores
router.post('/', [
    db_connection,
    validarJWT,
    check('marks', { msg: `Marks is required`, msg_es: `Los marcadores son obligatorios` }).notEmpty(),
    validarCampos
], markPost);


// Ruta para eliminar un marcador
router.delete('/:id', [
    db_connection,
    //validarJWT,
    check('id', { msg: `Invalid mark id`, msg_es: `El identificador del marcador no es válido` }).isMongoId(),
    check('id').custom(existeMarcadorPorId),
    validarCampos
], markDelete);

module.exports = router;