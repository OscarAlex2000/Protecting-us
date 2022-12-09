const jwt = require('jsonwebtoken');

// const { dbConnection } = require('../database/config');
const Usuario = require('../models/usuarioModel');


const generarJWT = async (_id = '', req = null, keep_logged = false) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');
    let host = null;
    let agent = null;
    if (req !== null) {
        agent = req.headers['user-agent'];
        host = req.headers.host;
    }

    return new Promise((resolve, reject) => {
        const payload = { _id, host, agent };
        jwt.sign(payload, global.auth.jwt_secret_key, {
            expiresIn: keep_logged == false ? global.auth.jwt_exipire_time : '365d'
        }, async (error, token) => {
            if (error) {
                console.log(error);
                reject({ msg: `Error generating the JWT`, msg_es: `Error generando el JWT` })
            } else {
                // Guardar fecha de vigencia del token en el documento del usuario
                const { exp } = jwt.verify(token, global.auth.jwt_secret_key);
                await Usuario.findByIdAndUpdate(_id, { session_expire: exp * 1000 }, { new: true })
                // conn.close();
                resolve(token);
            }
        })
    })
}

module.exports = {
    generarJWT
}