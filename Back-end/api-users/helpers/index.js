const config = require('./start-config');
const dbValidators = require('./db-validators');
const generarJWT = require('./generar-jwt');
const authValidators = require('./auth-validators');
const busqueda = require('./busqueda');
const redisListen = require('./redis-listen');
const redisEmit = require('./redis-emit');
const usersValidators = require('./users-validators');
const clearJwtWhiteListUser = require('./helpers');

module.exports = {
    ...config,
    ...dbValidators,
    ...generarJWT,
    ...authValidators,
    ...busqueda,
    ...redisListen,
    ...redisEmit,
    ...usersValidators,
    ...clearJwtWhiteListUser
}