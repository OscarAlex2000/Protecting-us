const { response, request } = require("express");
const path = require("path");
const fs = require("fs");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const randomstring = require("randomstring");
// const escapeStringRegexp = require("escape-string-regexp");
// import escapeStringRegexp from 'escape-string-regexp';
const {
    convertArrayInObjectsArray,
    diacriticInsensitiveRegExp,
    escapeStringRegexp
} = require("../helpers/busqueda");

const { redisEmit } = require("../helpers/redis-emit");
const { v4: uuidv4 } = require("uuid");
const sizeOf = require("image-size");
const sharp = require("sharp");
const axios = require("axios");

// const { dbConnection } = require("../database/config");
const Usuario = require('../models/usuarioModel');
const Captcha = require('../models/captchaModel')

// Obtener todos los usuarios - Paginado
const usersGet = async (req = request, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");

        let {
            limit = 10,
            from = 0,
            search_fields = JSON.stringify([
                "name",
                "first_surname",
                "second_surname",
                "user_name",
                "gender",
            ]),
            search = "",
            order_field = "name",
            order = "asc",
            active = null,
            root = null,
            exceptions = JSON.stringify([]),
        } = req.query;
        search_fields = JSON.parse(search_fields);
        // Quitar elementos por los que no se debe de poder buscar información del search
        let campos_ignorar = [
            "company_id",
            "branch_id",
            "password",
            "thumbnail_image",
            "image",
            "validation_code",
            "validated",
            "validation_date",
            "reset_password_code",
            "reset_password_expires",
            "password_change_date",
            "active",
            "status",
            "deleted_at",
            "last_login",
            "session_expire",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "root",
            "permissions",
            "profiles",
        ];
        if (
            global.api.show_user_name === "true" ||
            global.api.show_user_name === "1"
        ) {
            campos_ignorar.push("user_name");
        }
        search_fields.forEach((field) => {
            if (campos_ignorar.includes(field)) {
                search_fields = search_fields.filter((element) => {
                    return element !== field;
                });
            }
        });
        if (search_fields.length === 0) {
            if (
                global.api.show_user_name !== "true" &&
                global.api.show_user_name !== "1"
            ) {
                search_fields = [
                    "name",
                    "first_surname",
                    "second_surname",
                    "user_name",
                    "gender",
                ];
            } else {
                search_fields = [
                    "name",
                    "first_surname",
                    "second_surname",
                    "gender",
                ];
            }
        }

        // Diacritic insensitive
        search = await diacriticInsensitiveRegExp(escapeStringRegexp(search));
        const expresion = new RegExp(search, "i");
        const search_in = await convertArrayInObjectsArray(
            search_fields,
            expresion
        );

        let query = {
            $and: [{ status: true, _id: { $nin: JSON.parse(exceptions) } }],
            $or: search_in,
        };

        // Agregar filtro de COMPANY ID
        if (
            global.api.company_id_required === "true" ||
            global.api.company_id_required === "1"
        ) {
            query.$and.push({ company_id: req.usuario.company_id });
        }
        // Agregar filtro para usuarios activos o inactivos
        if (
            active === "true" ||
            active === "false" ||
            active == 1 ||
            active == 0
        ) {
            query.$and.push({ active });
        }
        // Agregar filtro para usuarios root
        if (root === "true" || root === "false" || root == 1 || root == 0) {
            query.$and.push({ root });
        }

        const [count, usuarios] = await Promise.all([
            Usuario.countDocuments(query),
            Usuario.find(query)
                .collation({ locale: "en" })
                .sort({
                    [order_field]: order
                })
                .skip(Number(from))
                .limit(Number(limit))
                .populate("created_by", "name")
                .populate("updated_by", "name"),
        ]);
        // await conn.deleteModel(/[\s\S]/g);
        // await conn.close();
        return res.status(200).json({
            ok: true,
            msg: `${count} users found`,
            msg_es: `Se encontraron ${count} usuarios`,
            count,
            users: usuarios,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: "An error occurred while getting users information",
            msg_es: "Ocurrio un error al obtener la información de los usuarios",
        });
    }
}

//Obtner total de usuarios habilitados en la base de datos
const totalUsers = async (req = request, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");
        let query = {
            $and: [{ status: true }]
        };
        const [count] = await Promise.all([
            Usuario.countDocuments(query)
        ]);
        return res.status(200).json({
            "total": count
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: "An error occurred while getting users information",
            msg_es: "Ocurrio un error al obtener la información de los usuarios",
        });
    }

}

// Obtener solo un usuario
const userGet = async (req = request, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");

        const { id } = req.params;
        const user = await Usuario.findById(id);
        // conn.close();
        return res.status(200).json({
            ok: true,
            msg: "User found",
            msg_es: "Usuario encontrado",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: "An error occurred while getting user information",
            msg_es: "Ocurrio un error al obtener la información del usuario",
        });
    }
}

// Obtener solo un usuario por old_id
const userGetByOld = async (req = request, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");

        const { id } = req.params;
        const user = await Usuario.findOne({ old_id: id });
        // conn.close();
        return res.status(200).json({
            msg: "User found",
            msg_es: "Usuario encontrado",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: "An error occurred while getting user information",
            msg_es: "Ocurrio un error al obtener la información del usuario",
        });
    }
}

// Agregar usuario
const userPost = async (req, res = response) => {
    let xtoken = req.header('x-token');
    let password_generated;
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");
        req.event_key = "userPost";
        const url = req.url
        const {
            old_id,
            company_id,
            branch_id,
            account_id,
            name,
            first_surname,
            second_surname,
            gender,
            user_name,
            password,
            root,
            permissions,
            profiles,
            active,
            captcha_id,
            captcha_text
        } = req.body;

        const user = new Usuario({
            old_id,
            company_id,
            branch_id,
            account_id,
            name,
            first_surname,
            second_surname,
            gender,
            user_name,
            password,
            validation_code: global.auth.validation_code_type == "long_code" ? crypto.randomBytes(20).toString("hex") : randomstring.generate({ length: 6, capitalization: "uppercase", charset: "alphanumeric" }),
            root,
            permissions,
            profiles,
            active,
            created_by: req.usuario ? req.usuario._id : null,
            updated_by: req.usuario ? req.usuario._id : null,
        });
        
        const user_response = {
            old_id,
            company_id,
            branch_id,
            account_id,
            name,
            first_surname,
            second_surname,
            gender,
            user_name,
            password,
            root,
            permissions,
            profiles,
            active,
            created_by: req.usuario ? req.usuario._id : null,
            updated_by: req.usuario ? req.usuario._id : null,
        }

        //Asignar password por defecto
        if (!password && global.auth.login_data == 'user_name_and_password') {
            password_generated = randomstring.generate({ length: global.auth.password_min_length, charset: "alphanumeric" })
            const salt = bcryptjs.genSaltSync();
            user.password = bcryptjs.hashSync(password_generated, salt);
        } else if (password) {
            // Encriptar la contraseña
            const salt = bcryptjs.genSaltSync();
            user.password = bcryptjs.hashSync(password, salt);
        }

        //Validar captcha
        if (global.captcha.enabled && url === "/register") {
            const captcha_valid = await validate_captcha(captcha_id, captcha_text);
            if (!captcha_valid) {
                return res.status(400).json({
                    ok: false,
                    msg: "Captcha not valid",
                    msg_es: "Captcha no valido",
                });
            }
        }

        // Guardar en BD
        user_id = await user.save();
        user_response._id = user_id._id;
        const header = global.mail_info.api_key ? {'api-key':global.mail_info.api_key}: {'x-token':xtoken};
        //Enviar correo de validación si la opción está activada
        if (global.auth.account_validation) {
            const validation_code = user.validation_code;
            const validation_href = global.auth.validation_route + "/" + validation_code;
            
            const mail_requests = await sendValidationEmail(name, user_name, validation_href,header);
            if (!mail_requests) {
                return res.status(400).json({
                    ok: false,
                    msg: "An error occurred while sending validation email",
                    msg_es: "Ocurrio un error al enviar el correo de validación",
                });
            }
        }

        if (password_generated && global.auth.user_name_type == 'email') {
            const mail_requests = await sendPasswordEmail(user, password_generated, header);
            if (!mail_requests) {
                return res.status(400).json({
                    ok: false,
                    msg: "An error occurred while sending password email",
                    msg_es: "Ocurrio un error al enviar el correo de validación",
                });
            }
        }

        // User by created
        user._doc.created_by_user = req.usuario ? req.usuario : null;

        // Evento de creado del usuario
        await redisEmit("userPost", user);

        // conn.close();
        return res.status(201).json({
            ok: true,
            msg: "User created successfully",
            msg_es: "Usuario creado exitosamente",
            user: user_response,
        });
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            ok: false,
            msg: "An error occurred while registering user information",
            msg_es: "Ocurrio un error al registrar la información del usuario",
            error: error
        });
    }
}

const sendValidationEmail = async (name, mail, validation_var, header) => {

    //Get the today date in dd/mm/yy format
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yy = String(today.getFullYear()).padStart(2, '0');
    const today_date = dd + '/' + mm + '/' + yy;

    data = {
        identity_name: global.mail_info.identity_name || 'Nuevo mensaje!',
        recipients: [mail],
        template: global.mail_info.validation.template,
        variables: { date: today_date, name: name }
    };

    if (global.auth.validation_code_type == "long_code") {
        data.variables.validation_href = validation_var;
    }

    if (global.auth.validation_code_type == "short_code") {
        data.variables.validation_code = validation_var;
    }

    //Make post request to mailer
    console.log("Sending email...");
    return await axios.post(
        `${global.mail_info.host}/notify-email`,
        data, { timeout: 15000, headers: header }
    )
        .then(() => {
            console.log('SENT');
            return true;
        })
        .catch((error) => {
            console.log('NOT SENT');
            return false;
        })

}

// Send a ppassword email
const sendPasswordEmail = async (user, password_generated, header) => {

    //Get the today date in dd/mm/yy format
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yy = String(today.getFullYear()).padStart(2, '0');
    const today_date = dd + '/' + mm + '/' + yy;

    data = {
        identity_name: global.mail_info.identity_name || 'Nuevo mensaje!',
        recipients: [user.user_name],
        template: global.mail_info.password.template,
        variables: {
            name: user.name,
            user_name: user.user_name,
            date: today_date,
            password: password_generated,
        }
    };
    //Make post request to mailer
    console.log("Sending email...");
    return await axios.post(
        `${global.mail_info.host}/notify-email`,
        data, { timeout: 15000, headers: header }
    )
        .then(() => {
            console.log('SENT');
            return true;
        })
        .catch((error) => {
            console.log('NOT SENT');
            return false;
        })

}

// Validar usuario
const userValidate = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");

        const { code } = req.params;
        let user = await Usuario.findOne({ validation_code: code });

        user = await Usuario.findByIdAndUpdate(
            user.id, { validated: true, validation_date: Date.now() }, { new: true }
        );

        // conn.close();
        return res.status(200).json({
            msg: "User validated",
            msg_es: "Usuario validado",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: "An error occurred while validatig user",
            msg_es: "Ocurrio un error al validar el usuario",
        });
    }
}

//Validar usuario GET
const userValidateGet = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");

        const { code } = req.params;
        let user = await Usuario.findOne({ validation_code: code });

        user = await Usuario.findByIdAndUpdate(
            user.id, { validated: true, validation_date: Date.now() }, { new: true }
        );

        // conn.close();
        return res.status(200).json(
            "Usuario validado"
        );
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: "An error occurred while valitating the user",
            msg_es: "Ocurrio un error al validar el usuario",
        });
    }
}

// Subir imagen de perfil de un usuario
const userUploadImage = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");

        if (!req.files ||
            Object.keys(req.files).length === 0 ||
            !req.files.image
        ) {
            // conn.close();
            return res.status(400).json({
                msg: "There is not file",
                msg_es: "No hay archivo",
            });
        }
        const { id } = req.params;

        // Buscar el usuario para guardar la ruta de la imagen y thumb actuales
        let user = await Usuario.findById(id);
        const imageOld = user.image;
        const thumbnailImageOld = user.thumbnail_image;

        const { image } = req.files;
        const nombreCortado = image.name.split(".");
        let extension = nombreCortado[nombreCortado.length - 1];

        // Validar extension
        const extensionesValidas = [
            "png",
            "PNG",
            "jpg",
            "JPG",
            "jpeg",
            "JPEG",
            "gif",
            "GIF",
        ];
        if (!extensionesValidas.includes(extension)) {
            // conn.close();
            return res.status(400).json({
                msg: `The extension ${extension} is not allowed, the following extensions are allowed: ${extensionesValidas}`,
                msg_es: `La extension ${extension} no es permitida, se permiten las siguientes extensiones: ${extensionesValidas}`,
            });
        }

        // Crear el nombre de la imagen
        const uuid = uuidv4();
        const nameImage = uuid + "." + extension;
        if (extension.toUpperCase() == "GIF") {
            //Si la imagen original es un gif, el thumb terminará siendo una imagen jpg
            extension = "jpg";
        }
        const nameImageThumb = uuid + "-thumb." + extension;

        // Validar si existe el directorio ../data/users, sino crearlo
        console.log(__dirname);
        if (!fs.existsSync(path.join(__dirname, "../data/users"))) {
            fs.mkdirSync(path.join(__dirname, "../data/users"), {
                recursive: true,
            });
        }

        // Mover imagen de usuario
        uploadPath = path.join(__dirname, "../data/users/", nameImage);
        uploadPathThumb = path.join(
            __dirname,
            "../data/users/",
            nameImageThumb
        );

        image.mv(uploadPath, async (error) => {
            if (error) {
                // conn.close();
                console.log(error);
                return res.status(400).json({
                    msg: `Failed to upload image`,
                    msg_es: `Ocurrio un error al subir la imagen`,
                });
            }

            sizeOf(uploadPath, async (err, dimensions) => {
                let offX = 0;
                let offY = 0;
                let size = 0;
                if (dimensions.width > dimensions.height) {
                    // IMAGEN HORIZONTAL
                    size = dimensions.height;
                    offX = Math.round(
                        (dimensions.width - dimensions.height) / 2
                    );
                } else if (dimensions.width < dimensions.height) {
                    // IMAGEN VERTICAL
                    size = dimensions.width;
                    offY = Math.round(
                        (dimensions.height - dimensions.width) / 2
                    );
                } else {
                    // IMAGEN CUADRADA, (NO SE RECORTA)
                    size = dimensions.width;
                }

                await sharp(uploadPath)
                    .extract({
                        width: size,
                        height: size,
                        left: offX,
                        top: offY,
                    })
                    .toBuffer()
                    .then(async (new_file) => {
                        await sharp(new_file)
                            .resize(100, 100)
                            .toFile(uploadPathThumb, (err, info) => { });
                    })
                    .catch((err) => {
                        console.log(error);
                        // conn.close();
                        return res.status(400).json({
                            msg: `Failed to upload user image`,
                            msg_es: `Ocurrio un error al subir la imagen del usuario`,
                        });
                    });
            });

            // Guardar la ruta de la imagen en la base de datos
            user = await Usuario.findByIdAndUpdate(
                id, {
                thumbnail_image_name: nameImageThumb,
                thumbnail_image_url: uploadPathThumb,
                image_name: nameImage,
                image_url: uploadPath,
            }, { new: true }
            );

            // Eliminar imagen anterior si es que existe
            if (imageOld !== null && fs.existsSync(imageOld)) {
                fs.unlinkSync(imageOld);
            }
            if (
                thumbnailImageOld !== null &&
                fs.existsSync(thumbnailImageOld)
            ) {
                fs.unlinkSync(thumbnailImageOld);
            }

            // Evento de actualización del usuario
            await redisEmit("userPatch", user);

            // conn.close();
            return res.status(200).json({
                msg: "Successfull image upload",
                msg_es: "La imagen se ha cargado exitosamente",
                user,
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: `Failed to upload user image`,
            msg_es: `Ocurrio un error al subir la imagen del usuario`,
        });
    }
}

// Eliminar imagen de perfil de un usuario
const userDeleteImage = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");

        const { id } = req.params;

        // Buscar el usuario para anular la ruta de la imagen y thumb
        let user = await Usuario.findById(id);
        const imageOld = user.image;
        const thumbnailImageOld = user.thumbnail_image;

        // Eliminar imagen anterior si es que existe
        if (imageOld !== null && fs.existsSync(imageOld)) {
            fs.unlinkSync(imageOld);
        }
        if (thumbnailImageOld !== null && fs.existsSync(thumbnailImageOld)) {
            fs.unlinkSync(thumbnailImageOld);
        }

        // Anular la ruta de la imagen en la base de datos
        user = await Usuario.findByIdAndUpdate(
            id, {
            image_name: null,
            thumbnail_image_name: null,
            image_url: null,
            thumbnail_image_url: null,
        }, { new: true }
        );

        // Evento de actualización del usuario
        await redisEmit("userPatch", user);

        // conn.close();
        return res.status(204).json();
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: `Failed to delete user image`,
            msg_es: `Ocurrio un error al eliminar la imagen del usuario`,
        });
    }
}

// Actualizar usuario
const userPatch = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");

        req.event_key = "userPatch";

        const { id } = req.params;
        const {
            default_user,
            old_id,
            _id,
            password,
            thumbnail_image_name,
            thumbnail_image_url,
            image_name,
            image_url,
            validation_code,
            validate,
            validation_date,
            reset_password_code,
            reset_password_expires,
            password_change_date,
            status,
            created_at,
            updated_at,
            deleted_at,
            last_login,
            session_expire,
            updated_by,
            created_by,
            ...usuario
        } = req.body;

        if (password) {
            // Encriptar la contraseña
            const salt = bcryptjs.genSaltSync();
            usuario.password = bcryptjs.hashSync(password, salt);
            usuario.password_change_date = Date.now();
        }

        const user_old = await Usuario.findById(id);

        usuario.updated_by = req.usuario ? req.usuario._id : null;
        const user = await Usuario.findByIdAndUpdate(id, usuario, {
            new: true,
        });

        // User old
        user._doc.old_user = user_old;

        // User by update
        user._doc.updated_by_user = req.usuario ? req.usuario : null;

        // Evento de actualización del usuario
        await redisEmit("userPatch", user);

        // conn.close();
        return res.status(200).json({
            ok: true,
            msg: "User updated",
            msg_es: "Usuario actualizado",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: "Failed to update user",
            msg_es: "Ocurrio un error al actualizar el usuario",
        });
    }
}

// 'Eliminar' usuario
const userDelete = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");

        req.event_key = "userDelete";

        const { id } = req.params;
        const user = await Usuario.findByIdAndUpdate(
            id, {
            status: false,
            deleted_at: Date.now(),
            updated_by: req.usuario ? req.usuario._id : null,
        }, { new: true }
        );

        // User by update
        user._doc.deleted_by_user = req.usuario ? req.usuario : null;

        // Evento de usuario eliminado
        await redisEmit("userDelete", user);

        // conn.close();
        return res.status(200).json({
            ok: true
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: "Failed to delete user",
            msg_es: "Ocurrio un error al eliminar el usuario",
        });
    }
}

// Obtener codigo de recuperación de contraseña
const userPassRecoveryCode = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");

        const { user_name, expires_in = 3600000 } = req.body;

        // Crear codigo y fecha/hora de expiración de codigo
        const code = crypto.randomBytes(20).toString("hex");
        const expire = Date.now() + expires_in;

        // Actualizar usuario con codigo y fecha de recuperación de contraseña
        const user = await Usuario.findOneAndUpdate({ $and: [{ user_name }, { status: true }] }, { reset_password_code: code, reset_password_expires: expire }, { new: true });

        // conn.close();
        return res.status(200).json({
            msg: "Generated password recovery code",
            msg_es: "Código de recuperación de contraseña generado",
            user,
            code,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: "Error getting recovery code",
            msg_es: "Ocurrio un error al obtener codigo de recuperación de contraseña",
        });
    }
}

// Validar si el usuario puede autorizar movimientos
const userAuthorizeValidator = async (req, res = response) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model("Usuario");

        let { authorize_code, permissions } = req.body;
        let user = await Usuario.findOne({
            $and: [{ authorize_code }, { status: true }],
        });

        if (!user) {
            return res.status(404).json({
                msg: `User not found`,
                msg_es: `No se encontró un usuario con el codigo ${authorize_code}`
            });
        }

        if (!user.authorize) {
            // conn.close();
            return res.status(403).json({
                msg: `Permission denied`,
                msg_es: `Permiso denegado`,
            });
        }
        if (user.root) {
            // conn.close();
            return res.status(200).json({
                msg: "Authorized user",
                msg_es: "Usuario autorizado",
                user: {
                    _id: user._id,
                    name: user.name,
                    first_surname: user.first_surname,
                    second_surname: user.second_surname,
                },
            });
        } else if (permissions !== "" && !user.root) {
            permissions = JSON.parse(permissions);
            if (typeof permissions === "string") {
                permissions = [permissions];
            }

            let userPermissions = user.permissions.map(
                (element) => element.alias
            );
            for (const profile of user.profiles) {
                userPermissions = userPermissions.concat(
                    profile.permissions.map((permission) => permission.alias)
                );
            };

            if (!permissions.every((alias) => userPermissions.includes(alias))) {
                return res.status(403).json({
                    msg: `Permission denied`,
                    msg_es: `Permiso denegado`,
                });
            }

            // conn.close();
            return res.status(200).json({
                msg: "Authorized user",
                msg_es: "Usuario autorizado",
                user: {
                    _id: user._id,
                    name: user.name,
                    first_surname: user.first_surname,
                    second_surname: user.second_surname,
                },
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: "An error occurred",
            msg_es: "Ocurrio un error",
        });
    }
}

// Funciones para actualizar usuarios mediante eventos
// Permiso actualizado
const PermissionUpdate = async (msg) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model("Usuario");

    const permissionUpdated = JSON.parse(msg[1][1]);

    // Buscar usuarios que tengan el permiso en permisos y perfiles
    let query = {
        $or: [
            { "permissions._id": permissionUpdated._id },
            {
                "profiles.permissions": {
                    $elemMatch: { _id: permissionUpdated._id },
                },
            },
        ],
    };

    const [users] = await Promise.all([
        Usuario.find(query).select({ _id: 1, permissions: 1, profiles: 1 }),
    ]);

    for (const user of users) {
        for (const permission of user.permissions) {
            if (permission._id == permissionUpdated._id) {
                permission.name = permissionUpdated.name;
                permission.alias = permissionUpdated.alias;
                permission.alias_id = permissionUpdated.alias_id;
            }
        };

        for (const profile of user.profiles) {
            for (const permission of profile.permissions) {
                if (permission._id == permissionUpdated._id) {
                    permission.name = permissionUpdated.name;
                    permission.alias = permissionUpdated.alias;
                    permission.alias_id = permissionUpdated.alias_id;
                }
            };
        };

        await Usuario.findByIdAndUpdate(
            user._id, { permissions: user.permissions, profiles: user.profiles }, { new: true }
        );
    };

    // conn.close();
}

// Permiso eliminado
const PermissionDelete = async (msg) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model("Usuario");

    const permissionDeleted = JSON.parse(msg[1][1]);

    // Buscar usuarios que tengan el permiso en permisos y perfiles
    let query = {
        $or: [
            { "permissions._id": permissionDeleted._id },
            {
                "profiles.permissions": {
                    $elemMatch: { _id: permissionDeleted._id },
                },
            },
        ],
    };

    const [users] = await Promise.all([
        Usuario.find(query).select({ _id: 1, permissions: 1, profiles: 1 }),
    ]);

    for (const user of users) {
        user.permissions = user.permissions.filter(
            (permission) => permission._id != permissionDeleted._id
        );

        for (const profile of user.profiles) {
            profile.permissions = profile.permissions.filter(
                (permission) => permission._id != permissionDeleted._id
            );
        };

        await Usuario.findByIdAndUpdate(
            user._id, { permissions: user.permissions, profiles: user.profiles }, { new: true }
        );
    };

    // conn.close();
}

// Perfil actualizado
const ProfileUpdate = async (msg) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model("Usuario");

    const profileUpdated = JSON.parse(msg[1][1]);

    // Buscar usuarios que tengan el perfil
    let query = {
        $or: [{ "profiles._id": profileUpdated._id }],
    };

    const [users] = await Promise.all([
        Usuario.find(query).select({ _id: 1, profiles: 1 }),
    ]);

    for (const user of users) {
        for (const profile of user.profiles) {
            if (profile._id == profileUpdated._id) {
                profile.enabled = profileUpdated.enabled;
                profile.name = profileUpdated.name;
                profile.permissions = profileUpdated.permissions;
            }
        };

        await Usuario.findByIdAndUpdate(
            user._id, { profiles: user.profiles }, { new: true }
        );
    };

    // conn.close();
}

// Perfil elimindo
const ProfileDelete = async (msg) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model("Usuario");

    const profileDeleted = JSON.parse(msg[1][1]);

    // Buscar usuarios que tengan el perfil
    let query = {
        $or: [{ "profiles._id": profileDeleted._id }],
    };

    const [users] = await Promise.all([
        Usuario.find(query).select({ _id: 1, profiles: 1 }),
    ]);

    for (const user of users) {
        user.profiles = user.profiles.filter(
            (profile) => profile._id != profileDeleted._id
        );

        await Usuario.findByIdAndUpdate(
            user._id, { profiles: user.profiles }, { new: true }
        );
    };

    // conn.close();
}

const validate_captcha = async (id, text) => {
    try {
        // const conn = await dbConnection();
        // const Captcha = conn.model('Captcha');

        const captcha_id = id;
        const captcha_text = text;


        if (!captcha_id) {
            return false;
        }
        const captcha = await Captcha.findById(captcha_id);

        //Validate captcha if its not expired or deleted from db
        if (captcha == null) {
            return false;
        }
        //Validate captcha if its not expired and the text is the same
        if (captcha.text === captcha_text && captcha.expires_at > new Date()) {
            console.log("Captcha validado");
            return true
        } else {
            return false;
        }

    } catch (error) {
        console.log(error);
        // conn.close();
        return false;
    }


}

module.exports = {
    usersGet,
    userGet,
    userGetByOld,
    totalUsers,
    userPost,
    userUploadImage,
    userDeleteImage,
    userPatch,
    userDelete,
    userPassRecoveryCode,
    userValidate,
    userValidateGet,
    userAuthorizeValidator,
    PermissionUpdate,
    PermissionDelete,
    ProfileUpdate,
    ProfileDelete,
    sendValidationEmail
};