const mongoose = require('mongoose');

const dbConnection = async() => {
    
    return await new Promise ( async (resolve, reject) => {
        try {
            await mongoose.connect(`mongodb${global.mongo.srv ? '+srv' : ''}://${((global.mongo.user !== '' && global.mongo.user !== undefined) ? global.mongo.user + ':' + ((global.mongo.pass !== '' && global.mongo.pass !== undefined) ? global.mongo.pass + '@' : '@') : '')}${global.mongo.host}${((!global.mongo.srv) ? ':' + global.mongo.port : '')}/${global.mongo.db}`, {
                autoIndex: true,
            }, (err) => {
                if (err) {
                    return reject({ msg: `Error connecting the database`, msg_es: `Error al conectar la base de datos` });
                }
                return resolve("ok")
            });
        } catch (error) {
            return reject({ msg: `Error connecting the database`, msg_es: `Error al conectar la base de datos` });
        }
    })
        // conn.model('Usuario', require('../models/usuarioModel'));
        // conn.model('CompanyConfig', require('../models/companyConfig'));
        // conn.model('Captcha', require('../models/captchaModel'));
        // resolve(conn);
}

module.exports = { dbConnection }