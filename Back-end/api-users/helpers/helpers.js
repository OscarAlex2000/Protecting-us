const jwt = require('jsonwebtoken');
// const { dbConnection } = require('../database/config');
const Usuario = require('../models/usuarioModel');

const clearJwtWhiteListUser = async (_id, clear_all = false) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    const usuario = await Usuario.findById(_id).select({ _id: 1, jwt_white_list: 1 });
    let tokens = [];
    
    if (!clear_all) {
        tokens = usuario.jwt_white_list;
    
        tokens.forEach(token => {
            try {
                jwt.verify(token, global.auth.jwt_secret_key);
            } catch (error) {
                tokens = tokens.filter((element) => {
                    return element !== token;
                });
            }
        });
    }

    await Usuario.findByIdAndUpdate(_id, { jwt_white_list: tokens });
    // conn.close();
}

module.exports = {
    clearJwtWhiteListUser
}