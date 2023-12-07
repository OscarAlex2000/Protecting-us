const jwt = require('jsonwebtoken');
const axios = require("axios");
const bcryptjs = require('bcryptjs')
const jimp = require('jimp');
const crypto = require("crypto");
const randomstring = require("randomstring");
const { response } = require('express');
const { redisEmit } = require('../helpers/redis-emit');
const { unlinkSync } = require('fs');
const { generarJWT } = require('../helpers/generar-jwt');
const { readFileSync } = require('fs');
const { existsSync } = require('fs');
const { mkdirSync } = require('fs');
const { writeFileSync } = require('fs');
const { sendValidationEmail } = require('./usuariosCtrl');
const { CaptchaGenerator } = require('captcha-canvas');
const { clearJwtWhiteListUser } = require('../helpers');

// const { dbConnection } = require('../database/config');
const Usuario = require('../models/usuarioModel');
const CompanyConfig = require('../models/companyConfig')
const Captcha = require('../models/captchaModel')

const login = async (req = request, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model('Usuario');
        const { user_name, password } = req.body;
        let user = {};

        if (global.auth.login_data === 'user_name') { // Cuando para iniciar sesion se necesite solo el nombre de usuario
            user = await Usuario.findOne({ $and: [{ user_name }, { status: true }] });
            if (!user) {
                // conn.close();
                return res.status(401).json({
                    ok: false,
                    msg: `Incorrect data`,
                    msg_es: `Datos incorrectos`,
                    param: `user name`
                });
            }
        } else if (global.auth.login_data === 'user_name_and_password') { // Cuando para iniciar sesion se necesite el nombre de usuario y la contraseña
            const user_now = user_name.toLowerCase();
            user = await Usuario.findOne({ $and: [{ user_name: user_now }, { status: true }] });
            if (!user) {
                // conn.close();
                return res.status(401).json({
                    ok: false,
                    msg: `Incorrect data`,
                    msg_es: `Datos incorrectos`,
                    param: `user name or password`
                });
            }
            // Verificar la contraseña
            const validPassword = bcryptjs.compareSync(password, user.password);
            if (!validPassword) {
                // conn.close();
                return res.status(401).json({
                    ok: false,
                    msg: `Incorrect data`,
                    msg_es: `Datos incorrectos`,
                    param: `password`
                });
            }
        } else {
            // conn.close();
            return res.status(401).json({
                ok: false,
                msg: `Incorrect config LOGIN_DATA value`,
                msg_es: `Valor de configuración de LOGIN_DATA incorrecto`
            });
        }

        // Validar que el usuario esté activo
        if (!user.active) {
            // conn.close();
            return res.status(401).json({
                ok: false,
                msg: `Inactive user`,
                msg_es: `Usuario inactivo`
            });
        }
        if (global.auth.account_validation) {
            if (user.validated === false) {
                // conn.close();
                return res.status(401).json({
                    ok: false,
                    msg: `User not validated`,
                    msg_es: `Usuario no validado`
                });
            }
        }

        // const CompanyConfig = conn.model("CompanyConfig");
        const company = await CompanyConfig.findOne({ company_id: user.company_id });

        if (company && !company.multiple_sessions && user.session_expire > Date.now()) {
            // conn.close();
            return res.status(401).json({
                ok: false,
                msg: `User has an active session`,
                msg_es: `El usuario tiene una sesion activa`
            });
        }
        const keep_logged = req.body.keep_logged ?? false;
        // Generar el JWT
        const token = await generarJWT(user.id, req, keep_logged);

        let penultimate_login = user.last_login;
        // Guardar en el documento del usuario la fecha del inicio de sesion
        user = await Usuario.findByIdAndUpdate(user.id, { last_login: Date.now(), $push: { 'jwt_white_list': token } }, { new: true });
        user.user_name = user_name;
        user.penultimate_login = penultimate_login;
        user.jwt_white_list = undefined;
        user.password = undefined;
        user.status = undefined;
        user.reset_password_code = undefined;
        user.reset_password_expires = undefined;

        // Evento redis de inicio de sesion
        await redisEmit('userLogin', { ...user._doc, token: token });

        clearJwtWhiteListUser(user.id);
        // conn.close();

        return res.status(200).json({
            ok: true,
            msg: `Successful login`,
            msg_es: `Inicio de sesion exitoso`,
            user,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: `An error occurred while logging in`,
            msg_es: `Ocurrio un error en el inicio de sesion`
        });
    }
}

const checkIn = async (req = request, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model('Usuario');

        const token = req.header('x-token');
        const { _id } = jwt.decode(token, global.auth.jwt_secret_key);

        const user = await Usuario.findByIdAndUpdate(_id, { $set: { 'last_check_in': Date.now() } }, { new: true });
        // conn.close();
        return res.status(200).json({
            msg: `Successful check-in`,
            msg_es: `Check-in exitoso`,
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: `An error occurred when logging out`,
            msg_es: `Ocurrio un error al cerrar la sesion`
        });
    }
}

const logout = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model('Usuario');

        const token = req.header('x-token');
        const { _id, exp } = jwt.decode(token, global.auth.jwt_secret_key);
        if (Date.now() > exp * 1000) {
            const user = await Usuario.findById(_id);
            // conn.close();
            return res.status(403).json({
                msg: `Invalid token`,
                msg_es: `El token ya no es válido`,
                user
            });
        } else {
            const user = await Usuario.findByIdAndUpdate(_id, { session_expire: null, $pull: { 'jwt_white_list': [] } }, { new: true });
            // conn.close();
            return res.status(200).json({
                msg: `Successful logout`,
                msg_es: `Cierre de sesion exitoso`,
                user
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: `An error occurred when logging out`,
            msg_es: `Ocurrio un error al cerrar la sesion`
        });
    }
}

const renewToken = async (req = request, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model('Usuario');

        const { usuario } = req;

        // Generar el JWT
        const token = await generarJWT(usuario.id, req);

        // Guardar en el documento del usuario la fecha del inicio de sesion
        user = await Usuario.findByIdAndUpdate(usuario.id, { $push: { 'jwt_white_list': token } }, { new: true });

        clearJwtWhiteListUser(usuario.id);
        // conn.close();

        return res.status(200).json({
            msg: "New token generated",
            msg_es: "Se genero un nuevo token",
            user,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: `An error occurred when renewing the token`,
            msg_es: `Ocurrio un error al renovar el token`
        });
    }


}

const resetPass = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model('Usuario');

        const { code } = req.params;
        let { password } = req.body;
        let user = await Usuario.findOne({ reset_password_code: code });

        if (password) {
            const salt = bcryptjs.genSaltSync();
            password = bcryptjs.hashSync(password, salt);
        }

        // Cambiar contraseña, fecha de cambio de contraseña y limpiar codigo de cambio de contraseña
        user = await Usuario.findByIdAndUpdate(user.id, { reset_password_code: null, reset_password_expires: null, password, password_change_date: Date.now() }, { new: true });

        // conn.close();
        return res.status(200).json({
            msg: "Password updated",
            msg_es: "La contraseña ha sido actualizada",
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: `An error occurred while changing the password`,
            msg_es: `Ocurrio un error al cambiar la contraseña`
        });
    }

}

const generateCaptcha = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Captcha = conn.model('Captcha');

        let { base64 = false } = req.query;

        //Generate captcha
        const captcha = new CaptchaGenerator()
            .setDimension(200, 400)
            .setCaptcha({ size: '50', color: 'red' })
            .setTrace({ color: "deeppink" });
        const buffer = captcha.generateSync();
        const text = captcha.text

        //Save to db
        const config = readFileSync('./config/config.json');
        let config_json = JSON.parse(config);
        const minutes_to_expire = config_json.captcha.minutes_to_expire;

        const actual_date = new Date();
        const expires_at = new Date(actual_date.getTime() + minutes_to_expire * 60000);

        captcha_db = new Captcha({ text, expires_at });
        await captcha_db.save();

        const captcha_id = captcha_db._id;

        //Delete expired captchas
        deleteExpiredCaptchas();

        //Create and save image of captcha
        //Create the folder data/captcha if not exists
        const dir = './data/captcha/';
        if (!existsSync(dir)) {
            console.log('Creating folder data/captcha');
            mkdirSync(dir, { recursive: true });
        }
        //Converte buffer to base64
        const base64Data = buffer.toString('base64')

        //Convert the png to jpg
        const jpg_buffer = await jimp.read(buffer);
        jpg_buffer.quality(100);
        jpg_buffer.background(0xFFFFFFFF);
        jpg_buffer.write(`./data/captcha/${captcha_id}.jpg`);
        // conn.close();
        //writeFileSync(`data/captcha/${captcha_id}.jpg`, buffer);
        return res.status(200).json({
            _id: captcha_id,
            img: `${captcha_id}.jpg`,
            captcha_base64: base64 == 'true' ? base64Data : '',

        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: `An error occurred while generating the captcha`,
            msg_es: `Ocurrio un error al generar el captcha`
        })
    }
}

const deleteExpiredCaptchas = async () => {
    try {
        // const conn = await dbConnection();
        // const Captcha = conn.model('Captcha');

        const actual_date = new Date();
        const expired_captchas = await Captcha.find({ expires_at: { $lt: actual_date } });

        for (let i = 0; i < expired_captchas.length; i++) {
            const captcha_id = expired_captchas[i]._id;
            if (existsSync(`./data/captcha/${captcha_id}.jpg`)) {

                console.log(`Deleting captcha ${captcha_id}`);
                unlinkSync(`./data/captcha/${captcha_id}.jpg`);
                await Captcha.findByIdAndDelete(captcha_id);
            }
        }
        // conn.close();
    } catch (error) {
        console.log(error);
    }
}

const validateCaptcha = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Captcha = conn.model('Captcha');

        const { captcha_id } = req.body;
        const { captcha_text } = req.body;
        if (!captcha_id) {
            return res.status(400).json({
                msg: `Captcha id is required`,
                msg_es: `Se requiere el id de captcha `
            })
        }
        if (!captcha_text) {
            return res.status(400).json({
                msg: `Captcha text is required`,
                msg_es: `Se requiere el texto de captcha `
            })
        }
        const captcha = await Captcha.findById(captcha_id);

        //Validate captcha if its not expired or deleted from db
        if (captcha == null) {
            return res.status(400).json({
                msg: `Captcha not found`,
                msg_es: `Captcha no encontrado`
            })
        }
        //Validate captcha if its not expired and the text is the same
        if (captcha.text === captcha_text && captcha.expires_at > new Date()) {
            return res.status(200).json({
                msg: "Captcha valid",
                msg_es: "Captcha valido"
            });
        } else {
            return res.status(400).json({
                msg: "Captcha not valid",
                msg_es: "Captcha no valido"
            });
        }
        // conn.close();

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: `An error occurred while validating the captcha`,
            msg_es: `Ocurrio un error al validar el captcha`
        })
    }


}

const resendValidationEmail = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model('Usuario');

        const { user_name } = req.body;

        if (!user_name) {
            return res.status(400).json({
                msg: `User name is required`,
                msg_es: `Se requiere el nombre de usuario`
            })
        }
        const user = await Usuario.findOne({ user_name });
        if (user == null) {
            return res.status(400).json({
                msg: `User not found`,
                msg_es: `Usuario no encontrado`
            })
        }
        // create a new validation code and save it to the db
        const validation_code = global.auth.validation_code_type == "long_code" ? crypto.randomBytes(20).toString("hex") : randomstring.generate({ length: 6, capitalization: "uppercase", charset: "alphanumeric" })
        user.validation_code = validation_code
        const validation_href = global.auth.validation_route + "/" + validation_code

        await user.save();
    const header = global.mail_info.api_key ? {'api-key':global.mail_info.api_key}: {'x-token':xtoken};
        const email_response = await sendValidationEmail(user.name, user_name, validation_href, header);
        console.log(typeof(email_response), email_response);
        if (!email_response) {
            return res.status(400).json({
                msg: `An error occurred while sending the validation email`,
                msg_es: `Ocurrio un error al enviar el correo de validacion`
            })
        }
        // conn.close();
        return res.status(200).json({
            msg: "Validation email sent",
            msg_es: "Correo de validacion enviado"
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: `An error occurred while resending the validation email`,
            msg_es: `Ocurrio un error al reenviar el correo de validacion`
        })
    }
}
module.exports = {
    login,
    checkIn,
    renewToken,
    resetPass,
    logout,
    generateCaptcha,
    validateCaptcha,
    resendValidationEmail
}