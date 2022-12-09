const fs = require('fs');
const v8 = require('v8');
const path_ = require("path");
const express = require('express');
const { check } = require('express-validator');
const { validarCampos, db_connection, validarJWT } = require('../middlewares');
const cors = require('cors');
const { startConfig, redisListen, existeUsuarioPorOldId, redisEmit } = require('../helpers');
const fileUpload = require('express-fileupload');
const redoc = require('redoc-express');
const { userNameDisponible } = require('../helpers');
const { response } = require('express');
const yaml = require('js-yaml');
const { dbConnection } = require('../database/config');
const { userGetByOld } = require('../controllers/usuariosCtrl');
const Usuario = require('../models/usuarioModel');
const bcryptjs = require('bcryptjs');

class Server {

    constructor() {

        console.clear();
        this.app = express();
        this.server = require('http').createServer(this.app);

        // Cargar la configuración
        this.cargarConfig();
    
    }

    async cargarConfig() {

        await startConfig();
        this.port = global.api.port;

        this.paths = {
            auth: '/auth',
            usuarios: '/users'
        }

        // Middlewares
        this.middlewares();

        // Rutas de la api
        this.routes();

        await this.conectarDB();

        await this.createDefaultUser();
    
    }

    async conectarDB() {

        try {
            await dbConnection();
        } catch (error) {
            console.log(error);
            await new Promise((resolve) => {
                setTimeout(resolve, 5000);
            });
            return this.conectarDB();
        }
        // Redis listen
        // await redisListen();
        // Listen
        this.listen();
    }

    async createDefaultUser() {
        if (global.auth.create_default_user) {
            const userDefault = await Usuario.findOne({ default_user: true });
            if (!userDefault) {
                const salt = bcryptjs.genSaltSync();

                let user = new Usuario({
                    default_user: true,
                    root: true,
                    name: global.auth.default_user.name,
                    user_name: global.auth.default_user.user_name,
                    password: bcryptjs.hashSync(global.auth.default_user.password, salt),
                    validated: true,
                    validation_date: Date.now(),
                });

                user = await user.save();
                await redisEmit("userPost", user);
            }
        }
    }

    middlewares() {
        // CORS
        this.app.use(cors());

        // Lectura del body
        this.app.use(express.json());

        // Fileupload
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/'
        }));
    }

    routes() {
        this.app.use(this.paths.auth, require('../routes/auth'));
        this.app.use(this.paths.usuarios, require('../routes/usuarios'));

        // Documentation
        this.app.get('/doc.yml', (req, res) => {
            return res.sendFile('doc.yml', { root: '.' });
        });

        // Serve REDOC
        this.app.get('/docs',
            redoc({
                title: 'Users api Docs',
                specUrl: 'doc.yml'
            })
        );

        // About API
        this.app.get('/about',
            (req, res = response) => {
                return res.status(200).json({
                    version: yaml.load(fs.readFileSync('./doc.yml', 'utf8')).info.version
                });
            }
        );

        // Ruta para validar si un nombre de usuario esta disponible
        this.app.get('/user-name-available', [
            check('user_name', { msg: `Username is required`, msg_es: `El nombre de usuario es obligatorio` }).notEmpty(),
            validarCampos,
            check('user_name').custom(userNameDisponible),
            validarCampos,
        ], (req, res = response) => {
            return res.status(200).json({
                msg: "OK",
                msg_es: "OK"
            })
        });

        // Ruta para obtener un usuario especifico con el old_id
        this.app.get('/by-old/user/:id', [
            db_connection,
            validarJWT,
            check('id', { msg: `Invalid user old_id`, msg_es: `El old_id de usuario no es válido` }).isNumeric(),
            check('id').custom(existeUsuarioPorOldId),
            validarCampos,
        ], userGetByOld);

    }

    listen() {
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto', this.port);
        });
    }
}

module.exports = Server;