const v8 = require('v8');
const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos, validarJWT, db_connection } = require('../middlewares');
const {
    login,
    renewToken,
    resetPass,
    logout,
    checkIn,
    generateCaptcha,
    validateCaptcha,
    resendValidationEmail
} = require('../controllers/authCtrl');
const { existeCodigoRecuperacion } = require('../helpers/db-validators');

const router = Router();

// Login
router.post('/login', [
    db_connection,
    check('user_name', { msg: `Username is required`, msg_es: `El nombre de usuario es obligatorio` }).notEmpty(),
    check('password', { msg: `Password is required`, msg_es: `La contraseña es obligatoria` }).if(() => { return global.auth.login_data === 'user_name_and_password' }).notEmpty(),
    validarCampos
], login);

// Logout
router.post('/logout', db_connection, logout);

// Validar JWT
router.get('/validate', [db_connection, validarJWT], (req, res = response) => {

    let all_permissions = req.usuario.permissions.map(element => element.alias);
    for (const profile of req.usuario.profiles.filter(p => p.enabled)) {
        all_permissions = [...new Set([...all_permissions, ...profile.permissions.map(permission => permission.alias)])]
    }

    return res.status(200).json({
        ok: true,
        msg: "OK",
        msg_es: "OK",
        user: {
            _id: req.usuario._id,
            company_id: req.usuario.company_id,
            branch_id: req.usuario.branch_id,
            account_id: req.usuario.account_id,
            name: req.usuario.name,
            first_surname: req.usuario.first_surname,
            second_surname: req.usuario.second_surname,
            gender: req.usuario.gender,
            thumbnail_image_name: req.usuario.thumbnail_image_name,
            thumbnail_image_url: req.usuario.thumbnail_image_url,
            image_name: req.usuario.image_name,
            image_url: req.usuario.image_url,
            all_permissions: all_permissions,
            root: req.usuario.root
        }
    })
});

// Renovar token
router.get('/', [db_connection, validarJWT], renewToken);

// Ruta para validar codigo de recuperación de contraseña
router.get('/reset/validate/:code', [
    db_connection,
    check('code').custom(existeCodigoRecuperacion),
    validarCampos,
], (req, res = response) => {
    return res.status(200).json({
        msg: "OK",
        msg_es: "OK"
    })
});

// Ruta para cambiar contraseña
router.patch('/reset/:code', [
    db_connection,
    check('code').custom(existeCodigoRecuperacion),
    validarCampos,
    check('password', { msg: `The password must have a minimum of ${global.auth.password_min_length} characters`, msg_es: `La contraseña debe de tener ${global.auth.password_min_length} caracteres minimo` })
        .isLength({ min: global.auth.password_min_length }),
    validarCampos
], resetPass);

router.get('/generate-captcha', [db_connection], generateCaptcha);

router.post('/validate-captcha', [
    db_connection,
    check('captcha_text', { msg: 'captcha_text is required' }).notEmpty(),
    check('captcha_id', { msg: 'captcha_id is required' }).notEmpty(),
    validarCampos
], validateCaptcha);

//Ruta para reenviar el correo de validación de cuenta
router.post('/resend-validation-email', [
    db_connection,
    check('user_name', { msg: `user_name is required`, msg_es: `El user_name es obligatorio` }).notEmpty(),
    validarCampos
], resendValidationEmail);

// Ruta para hacer check-in
router.post('/check-in', [
    db_connection,
    validarJWT,
    validarCampos
], checkIn);

module.exports = router;