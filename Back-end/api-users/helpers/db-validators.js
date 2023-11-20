
// const { dbConnection } = require('../database/config');
const Usuario = require('../models/usuarioModel');

const userNameDisponible = async (user_name = '') => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el nombre de usuario esta disponible
    if (user_name !== '' && user_name !== null && user_name !== undefined) {
        const existeUserName = await Usuario.findOne(
            { $and: [{ user_name: user_name.toLowerCase() }, { status: true }] }
        );
        if (existeUserName) {
            throw ({ msg: `The username ${user_name} is not available`, msg_es: `El nombre de usuario ${user_name} no esta disponible` });
        }
    }
    // conn.close();
}

const userNameDisponiblePatch = async (user_name = '', { req: Request }) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el nombre de usuario esta disponible
    if (user_name !== '' && user_name !== null && user_name !== undefined) {
        const existeUserName = await Usuario.findOne(
            { $and: [{ user_name }, { status: true }, { _id: { $not: { $eq: Object(Request.params.id) } } }] }
        );
        if (existeUserName) {
            throw ({ msg: `The username ${user_name} is not available`, msg_es: `El nombre de usuario ${user_name} no esta disponible` });
        }
    }
    // conn.close();
}

const AuthorizeCodeDisponible = async (authorize_code = '') => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el codigo de autorizacion esta disponible
    if (authorize_code !== '' && authorize_code !== null && authorize_code !== undefined) {
        const existeUserName = await Usuario.findOne(
            { $and: [{ authorize_code }, { status: true }] }
        );
        if (existeUserName) {
            throw ({ msg: `The authorize code ${authorize_code} is not available`, msg_es: `El codigo de autorizacion ${authorize_code} no esta disponible` });
        }
    }
    // conn.close();
}


const AuthorizeCodeDisponiblePatch = async (authorize_code = '', { req: Request }) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el codigo de autorizacion esta disponible
    if (authorize_code !== '' && authorize_code !== null && authorize_code !== undefined) {
        const existeUserName = await Usuario.findOne(
            // { $and: [{ authorize_code }, { status: true }] }
            { $and: [{ authorize_code }, { status: true }, { _id: { $not: { $eq: Object(Request.params.id) } } }] }
        );

        if (existeUserName) {
            throw ({ msg: `The authorize code ${authorize_code} is not available`, msg_es: `El codigo de autorizacion ${authorize_code} no esta disponible` });
        }
    }
    // conn.close();
}

const userNameExiste = async (authorize_code = '') => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el nombre de usuario existe
    if (user_name !== '' && user_name !== null && user_name !== undefined) {
        const existeUserName = await Usuario.findOne({ $and: [{ user_name }, { status: true }] }, { strict: true });
        if (!existeUserName) {
            throw ({ msg: `The user with the username ${user_name} was not found`, msg_es: `No se encontró el nombre de usuario ${user_name}` });
        }
    }
    // conn.close();
}

const AuthorizeCodeExiste = async (authorize_code = '') => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el codigo de autorizacion de usuario existe
    if (authorize_code !== '' && authorize_code !== null && authorize_code !== undefined) {
        const User = await Usuario.findOne({ $and: [{ authorize_code }, { status: true }] }, { strict: true });
        if (!User) {
            throw ({ msg: `The user with the authorize code ${authorize_code} was not found`, msg_es: `No se encontró el usuario con el codigo de autorización ${authorize_code}` });
        }
    } else {
        throw ({ msg: `The user with the authorize code ${authorize_code} was not found`, msg_es: `No se encontró el usuario con el codigo de autorización ${authorize_code}` });
    }
    // conn.close();
}

const existeUsuarioPorId = async (id) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el usuario con el id existe
    const existeUsuario = await Usuario.findById(id);
    if (!existeUsuario) {
        throw ({ msg: `The user with the id ${id} was not found`, msg_es: `No se encontró un usuario con el id ${id}` });
    }
    // conn.close();
}

const existeUsuarioPorOldId = async (old_id) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el usuario con el old_id existe
    const existeUsuario = await Usuario.findOne({ old_id });
    if (!existeUsuario) {
        throw ({ msg: `The user with the old_id ${old_id} was not found`, msg_es: `No se encontró un usuario con el old_id ${old_id}` });
    }
    // conn.close();
}

const esUsuarioEliminado = async (id) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el usuario con el id existe
    const User = await Usuario.findById(id);
    if (!User) {
        throw ({ msg: `The user with the id ${id} was not found`, msg_es: `No se encontró un usuario con el id ${id}` });
    }
    if (!User.status) {
        throw ({ msg: `User has been deleted`, msg_es: `El usuario ha sido eliminado` });
    }
    // conn.close();
}

const existeCodigoRecuperacion = async (reset_password_code) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el usuario con el codigo de recuperacion existe
    const User = await Usuario.findOne({ reset_password_code });
    if (!User) {
        throw ({ msg: `No user found with recovery code ${reset_password_code}`, msg_es: `No se encontró un usuario con el codigo de recuperación ${reset_password_code}` });
    } else {
        if (User.reset_password_expires <= Date.now()) {
            throw ({ msg: `Recovery code ${reset_password_code} expired`, msg_es: `El codigo de recuperación ${reset_password_code} ya no es vigente` });
        }
    }
    // conn.close();
}

const existeCodigoValidacion = async (validation_code) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el usuario con el codigo de validación existe
    const existeUsuario = await Usuario.findOne({ validation_code });
    if (!existeUsuario) {
        throw ({ msg: `No user found with validation code ${validation_code}`, msg_es: `No se encontró un usuario con el codigo de validación ${validation_code}` });
    }
    // conn.close();
}

const oldidDisponible = async (old_id) => {
    // const conn = await dbConnection();
    // const Usuario = conn.model('Usuario');

    // Verificar si el usuario con el codigo de validación existe
    const existeOldId = await Usuario.findOne({ old_id });
    if (existeOldId) {
        throw ({ msg: `The old_id ${old_id} is not available`, msg_es: `El old_id ${old_id} no esta disponible` });
    }
    // conn.close();
}

const esPosibleDesactivarUsuario = async (id, { req: Request }) => {
    const user = await Usuario.findById(id);
    let query = {
        $and: [{ _id: { $not: { $eq: Object(Request.params.id) } } }, { status: true, active: true }],
    };

    if (user.root) {
        query.$and.push({ root: true });
    }

    // Agregar filtro de COMPANY ID
    if (global.api.company_id_required === 'true' || global.api.company_id_required === '1') {
        query.$and.push({ company_id: user.company_id });
    }
    const UsersCount = await Usuario.countDocuments(query);
    if (UsersCount <= 0) {
        if (user.root) {
            throw ({ msg: `There is only one active root user, you cant't inactive it`, msg_es: `Solo existe un superusuario activo, no es posible deshabilitarlo` });
        } else {
            throw ({ msg: `There is only one active user, you cant't inactive it`, msg_es: `Solo existe un usuario activo, no es posible deshabilitarlo` });
        }
    }
}

const esPosibleEliminarUsuario = async (id, { req: Request }) => {
    const user = await Usuario.findById(id);
    let query = {
        $and: [{ _id: { $not: { $eq: Object(Request.params.id) } } }, { status: true, active: true }],
    };

    if (user.root) {
        query.$and.push({ root: true });
    }

    // Agregar filtro de COMPANY ID
    if (global.api.company_id_required === 'true' || global.api.company_id_required === '1') {
        query.$and.push({ company_id: user.company_id });
    }
    const UsersCount = await Usuario.countDocuments(query);
    if (UsersCount <= 0) {
        if (user.root) {
            throw ({ msg: `There is only one root user, you cant't delete it`, msg_es: `Solo existe un superusuario, no es posible eliminarlo` });
        } else {
            throw ({ msg: `There is only one user, you cant't delete it`, msg_es: `Solo existe un usuario, no es posible eliminarlo` });
        }
    }
}

module.exports = {
    userNameDisponible,
    userNameDisponiblePatch,
    AuthorizeCodeDisponible,
    AuthorizeCodeDisponiblePatch,
    userNameExiste,
    AuthorizeCodeExiste,
    existeUsuarioPorId,
    existeUsuarioPorOldId,
    existeCodigoRecuperacion,
    existeCodigoValidacion,
    esUsuarioEliminado,
    oldidDisponible,
    esPosibleDesactivarUsuario,
    esPosibleEliminarUsuario,
}