const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

// const { dbConnection } = require('../database/config');

const validarJWT = async (req = request, res = response, next) => {
    try {
        // const conn = await dbConnection();
        // const Usuario = conn.model('Usuario');

        const token = req.header('x-token');

        if (!token) {
            // await conn.close();
            return res.status(401).json({
                msg: 'There is no token in the request',
                msg_es: `No hay token en la petición`
            });
        }

        let { permissions = '' } = req.query;
        const { _id } = jwt.verify(token, global.auth.jwt_secret_key);

        // Buscar el usuario correspondiente al _id que esta en el JWT
        // const usuario = await Usuario.findById(_id);
        let usuario = await Usuario.findById(_id);
        if (!usuario) {
            // conn.close();
            return res.status(404).json({
                msg: `User not found`,
                msg_es: `Usuario no encontrado`
            });
        }

        // Buscar que el usuario tenga el token en su lista blanca de tokens
        if (!usuario.jwt_white_list.includes(token)) {
            // conn.close();
            return res.status(401).json({
                msg: `Jwt expired`,
                msg_es: `El token ha expirado`
            });
        }

        // Validar que el usuario esté activo
        if (!usuario.active) {
            // conn.close();
            return res.status(401).json({
                msg: `Inactive user`,
                msg_es: `Usuario inactivo`
            });
        }

        // Validar que el usuario no este eliminado
        if (!usuario.status) {
            // await conn.close();
            return res.status(410).json({
                msg: `User deleted`,
                msg_es: `Usuario eliminado`
            });
        }

        if (permissions !== '' && !usuario.root) {
            permissions = JSON.parse(permissions);
            if (typeof permissions === 'string') {
                permissions = [permissions];
            }

            let userPermissions = usuario.permissions.map(element => element.alias);
            usuario.profiles.filter(p => p.enabled).forEach(profile => {
                userPermissions = userPermissions.concat(profile.permissions.map(permission => permission.alias));
            });

            if (!permissions.every(alias => userPermissions.includes(alias))) {
                // await conn.close();
                return res.status(403).json({
                    msg: `Permission denied`,
                    msg_es: `Permiso denegado`
                });
            }
        }

        req.usuario = usuario;
        usuario = undefined;
        // await conn.deleteModel(/[\s\S]/g);
        // await conn.close();
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            msg: 'An error occurred while validating the token and permissions',
            msg_es: `Ocurrio un error mientras se validaba el token y los permisos`
        })
    }
}

module.exports = {
    validarJWT
}