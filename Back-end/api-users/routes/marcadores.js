const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos, validarJWT, db_connection } = require('../middlewares');
const { markPost } = require('../controllers/marcadoresCtrl');

const router = Router();

// Ruta para obtener todos los marcadores en el mapa
// router.get('/', [
//     db_connection,
//     validarJWT,
//     validarCampos
// ], marksGet);

// Ruta para agregar un nuevo marcador
router.post('/', [
    db_connection,
    validarJWT,
    check('marks', { msg: `Marks is required`, msg_es: `Los marcadores son obligatorios` }).notEmpty(),
    validarCampos
], markPost);

// Ruta para actualizar un marcador
// router.patch('/:id', [
//     db_connection,
//     validarJWT,
//     check('id', { msg: `Invalid user id`, msg_es: `El id de usuario no es válido` }).isMongoId(),
//     check('id').custom(existeUsuarioPorId),
//     validarCampos,
//     check('id').custom(esUsuarioEliminado),
//     validarCampos,
//     check('id').if(check('active').exists()).if(check('active').equals('false')).custom(esPosibleDesactivarUsuario),
//     validarCampos,
//     check('old_password').if(check('password').exists()).custom(async (oldPass, { req }) => {
//         if (req.usuario._id.toString() === req.params.id) {
//             if (!oldPass) {
//                 throw ({ msg: `The old password is required`, msg_es: 'La contraseña actual es obligatoria' });
//             }
//             let user = await Usuario.findById(req.params.id);
//             const validPassword = bcryptjs.compareSync(oldPass, user.password);
//             if (!validPassword) {
//                 throw ({ msg: "The old password is incorrect", msg_es: "La contraseña actual es incorrecta" });
//             }
//         }
//     }),
//     validarCampos,
// ], userPatch);

// Ruta para eliminar un marcador
// router.delete('/:id', [
//     db_connection,
//     validarJWT,
//     check('id', { msg: `Invalid user id`, msg_es: `El id de usuario no es válido` }).isMongoId(),
//     check('id').custom(existeUsuarioPorId),
//     validarCampos,
//     check('id').custom(esPosibleEliminarUsuario),
//     validarCampos
// ], userDelete);

module.exports = router;