const mongoose = require('mongoose');
// const { dbConnection } = require('../database/config');
mongoose instanceof mongoose.Mongoose;

const db_connection = async (req, res, next) => {
    try {

        if(mongoose.connection.readyState ==  1){
            next();

        }else{
            return res.status(400).json({ msg: `Error connecting the database`, msg_es: `Error al conectar la base de datos` });
        }
        // const conn = await dbConnection();
        // conn.close();
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
}

module.exports = { db_connection }