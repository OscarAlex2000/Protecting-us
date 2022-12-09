const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos, validarJWT, db_connection } = require('../middlewares');
const { existeUsuarioPorId, existeUsuarioPorOldId, oldidDisponible, userNameDisponible, userNameExiste, existeCodigoValidacion, esUsuarioEliminado, checkUserPermissions, checkUserProfiles, AuthorizeCodeExiste, AuthorizeCodeDisponible, AuthorizeCodeDisponiblePatch, userNameDisponiblePatch, esPosibleEliminarUsuario, esPosibleDesactivarUsuario } = require('../helpers');
const { usersGet, totalUsers, userGet, userGetByOld, userPost, userValidate, userValidateGet, userUploadImage, userDeleteImage, userPatch, userDelete, userPassRecoveryCode, userAuthorizeValidator } = require('../controllers/usuariosCtrl');
const Usuario = require('../models/usuarioModel');
const bcryptjs = require('bcryptjs')

const router = Router();

// Ruta para obtener todos los usuarios
router.get('/', [
    db_connection,
    validarJWT,
    validarCampos
], usersGet);

// Ruta para saber cuanos usuarios habilotados hay en la base de datos
router.get('/total-users', [
    db_connection,
], totalUsers);

// Ruta para obtener un usuario especifico con el ID
router.get('/:id', [
    db_connection,
    validarJWT,
    check('id', { msg: `Invalid user id`, msg_es: `El id de usuario no es válido` }).isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos,
], userGet);

// Ruta para registrar un primer usuario
router.post('/register', [
    db_connection,
    check('old_id').optional().custom(oldidDisponible),
    validarCampos,
    check('company_id', { msg: `Company id is required`, msg_es: `El id de la empresa es obligatorio` })
        .if(() => { return global.api.company_id_required === 'true' }).notEmpty(),
    check('account_id', { msg: `Invalid account id`, msg_es: `El id de cuenta del usuario no es valido` }).if(check('account_id').exists()).isMongoId(),
    check('name', { msg: `The name is required`, msg_es: 'El nombre es obligatorio' }).notEmpty(),
    check('user_name', { msg: `Username is required`, msg_es: `El nombre de usuario es obligatorio` }).notEmpty(),
    check('password', { msg: `The password is required`, msg_es: `La contraseña es obligatoria` })
        .if(() => { return global.auth.login_data === 'user_name_and_password' }).notEmpty(),
    validarCampos,
    check('company_id', { msg: `Invalid company id`, msg_es: `El id de la empresa no es valido` })
        .if(() => { return global.api.company_id_required === 'true' }).isMongoId(),
    check('user_name', { msg: `The username isn't an email`, msg_es: `El nombre de usuario no es un correo` })
        .if(() => { return global.auth.user_name_type === 'email' }).isEmail(),
    check('user_name', { msg: `The username isn't a phone number`, msg_es: `El nombre de usuario no es un número de teléfono` })
        .if(() => { return global.auth.user_name_type === 'phone_number' }).matches(/^([0-9]{10})$/),
    check('user_name', { msg: `The username must have a minimum of ${global.auth.user_name_min_length} characters`, msg_es: `El nombre de usuario debe tener ${global.auth.user_name_min_length} caracteres minimo` })
        .if(() => { return global.auth.user_name_type === 'code' }).isLength({ min: global.auth.user_name_min_length }),
    check('password', { msg: `The password must have a minimum of ${global.auth.password_min_length} characters`, msg_es: `La contraseña debe de tener ${global.auth.password_min_length} caracteres minimo` })
        .if(() => { return global.auth.login_data === 'user_name_and_password' }).isLength({ min: global.auth.password_min_length }),
    validarCampos,
    check('user_name').custom(userNameDisponible),
    check('authorize_code').if(check('authorize_code').exists()).custom(AuthorizeCodeDisponible),
    validarCampos,
    // check('permissions').custom(checkUserPermissions),
    // check('profiles').custom(checkUserProfiles),
    validarCampos
], userPost);

// Ruta para registrar un nuevo usuario
router.post('/', [
    db_connection,
    validarJWT,
    check('old_id').optional().custom(oldidDisponible),
    validarCampos,
    check('company_id', { msg: `Company id is required`, msg_es: `El id de la empresa es obligatorio` })
        .if(() => { return global.api.company_id_required === 'true' }).notEmpty(),
    check('account_id', { msg: `Invalid account id`, msg_es: `El id de cuenta del usuario no es valido` }).if(check('account_id').exists()).isMongoId(),
    check('name', { msg: `The name is required`, msg_es: 'El nombre es obligatorio' }).notEmpty(),
    check('user_name', { msg: `Username is required`, msg_es: `El nombre de usuario es obligatorio` }).notEmpty(),
    // check('password', { msg: `The password ir required`, msg_es: `La contraseña es obligatoria` })
    //     .if(() => { return global.auth.login_data === 'user_name_and_password' }).notEmpty(),
    validarCampos,
    check('company_id', { msg: `Invalid company id`, msg_es: `El id de la empresa no es valido` })
        .if(() => { return global.api.company_id_required === 'true' }).isMongoId(),
    check('user_name', { msg: `The username isn't an email`, msg_es: `El nombre de usuario no es un correo` })
        .if(() => { return global.auth.user_name_type === 'email' }).isEmail(),
    check('user_name', { msg: `The username isn't a phone number`, msg_es: `El nombre de usuario no es un número de teléfono` })
        .if(() => { return global.auth.user_name_type === 'phone_number' }).matches(/^([0-9]{10})$/),
    check('user_name', { msg: `The username must have a minimum of ${global.auth.user_name_min_length} characters`, msg_es: `El nombre de usuario debe tener ${global.auth.user_name_min_length} caracteres minimo` })
        .if(() => { return global.auth.user_name_type === 'code' }).isLength({ min: global.auth.user_name_min_length }),
    check('password', { msg: `The password must have a minimum of ${global.auth.password_min_length} characters`, msg_es: `La contraseña debe de tener ${global.auth.password_min_length} caracteres minimo` })
        .if(() => { return global.auth.login_data === 'user_name_and_password' }).optional().isLength({ min: global.auth.password_min_length }),
    validarCampos,
    check('user_name').custom(userNameDisponible),
    check('authorize_code').if(check('authorize_code').exists()).custom(AuthorizeCodeDisponible),
    validarCampos,
    check('permissions').custom(checkUserPermissions),
    check('profiles').custom(checkUserProfiles),
    validarCampos
], userPost);

// Ruta para subir la imagen de un usuario
router.post('/image/:id', [
    db_connection,
    validarJWT,
    check('id', { msg: `Invalid user id`, msg_es: `El id de usuario no es válido` }).isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos
], userUploadImage);

// Ruta para eliminar la imagen de un usuario
router.delete('/image/:id', [
    db_connection,
    validarJWT,
    check('id', { msg: `Invalid user id`, msg_es: `El id de usuario no es válido` }).isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos
], userDeleteImage);

// Ruta para actualizar un usuario
router.patch('/:id', [
    db_connection,
    validarJWT,
    check('id', { msg: `Invalid user id`, msg_es: `El id de usuario no es válido` }).isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos,
    check('id').custom(esUsuarioEliminado),
    validarCampos,
    check('id').if(check('active').exists()).if(check('active').equals('false')).custom(esPosibleDesactivarUsuario),
    validarCampos,
    check('old_password', { msg: `The old password is required`, msg_es: 'La contraseña actual es obligatoria' }).if((oldPass, { req }) => {
        if (req.params.password && req.usuario._id.toString() === req.params.id) {
            return true;
        }
        return false;
    }).notEmpty(),
    validarCampos,
    check('old_password').if(check('password').exists()).custom(async (oldPass, { req }) => {
        if (req.usuario._id.toString() === req.params.id) {
            if (!oldPass) {
                throw ({ msg: `The old password is required`, msg_es: 'La contraseña actual es obligatoria' });
            }
            let user = await Usuario.findById(req.params.id);
            const validPassword = bcryptjs.compareSync(oldPass, user.password);
            if (!validPassword) {
                throw ({ msg: "The old password is incorrect", msg_es: "La contraseña actual es incorrecta" });
            }
        }
    }),
    validarCampos,
    check('account_id', { msg: `Invalid account id`, msg_es: `El id de cuenta del usuario no es valido` }).if(check('account_id').exists()).isMongoId(),
    check('user_name', { msg: `The username isn't an email`, msg_es: `El nombre de usuario no es un correo` })
        .if(check('user_name').exists()).if(() => { return global.auth.user_name_type === 'email' }).isEmail(),
    check('user_name', { msg: `The username isn't a phone number`, msg_es: `El nombre de usuario no es un número de teléfono` })
        .if(check('user_name').exists()).if(() => { return global.auth.user_name_type === 'phone_number' }).matches(/^([0-9]{10})$/),
    check('user_name', { msg: `The username must have a minimum of ${global.auth.user_name_min_length} characters`, msg_es: `El nombre de usuario debe tener ${global.auth.user_name_min_length} caracteres minimo` })
        .if(check('user_name').exists()).if(() => { return global.auth.user_name_type === 'code' }).isLength({ min: global.auth.user_name_min_length }),
    validarCampos,
    check('user_name').if(check('user_name').exists()).custom(userNameDisponiblePatch),
    check('password', { msg: `The password must have a minimum of ${global.auth.password_min_length} characters`, msg_es: `La contraseña debe de tener ${global.auth.password_min_length} caracteres minimo` })
        .if(check('password').exists()).isLength({ min: global.auth.password_min_length }),
    check('authorize_code').if(check('authorize_code').exists()).custom(AuthorizeCodeDisponiblePatch),
    validarCampos,
    check('permissions').custom(checkUserPermissions),
    check('profiles').custom(checkUserProfiles),
    validarCampos
], userPatch);

// Ruta para validar el usuario
router.patch('/validate/:code', [
    db_connection,
    check('code', { msg: `There is no validation code in the request`, msg_es: `No hay codigo de validación` }).notEmpty(),
    check('code').custom(existeCodigoValidacion),
    validarCampos
], userValidate);

// Ruta get para validar el usuario
router.get('/validate/:code', [
    db_connection,
    check('code', { msg: `There is no validation code in the request`, msg_es: `No hay codigo de validación` }).notEmpty(),
    check('code').custom(existeCodigoValidacion),
    validarCampos
], userValidateGet);

// Ruta para eliminar un usuario
router.delete('/:id', [
    db_connection,
    validarJWT,
    check('id', { msg: `Invalid user id`, msg_es: `El id de usuario no es válido` }).isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos,
    check('id').custom(esPosibleEliminarUsuario),
    validarCampos
], userDelete);

// Ruta para obtener codigo de recuperación de contraseña
router.post('/pass-recovery-code', [
    db_connection,
    check('user_name', { msg: `Username is required`, msg_es: `El nombre de usuario es obligatorio` }).notEmpty(),
    validarCampos,
    check('user_name', { msg: `The mail format is wrong`, msg_es: `Se necesita un correo válido` }).isEmail(),
    validarCampos,
    check('user_name').custom(userNameExiste),
    validarCampos
], userPassRecoveryCode);

// Ruta para validar permiso de autorizacion de un usuario
router.post('/authorize-validator', [
    db_connection,
    check('authorize_code', { msg: `Authorize code is required`, msg_es: `El codigo de autorización es obligatorio` }).notEmpty(),
    check('permissions', { msg: `Permission id is required`, msg_es: `El id del permiso es obligatorio` }).notEmpty(),
    validarCampos,
    check('authorize_code').custom(AuthorizeCodeExiste),
    validarCampos
], userAuthorizeValidator);

module.exports = router;