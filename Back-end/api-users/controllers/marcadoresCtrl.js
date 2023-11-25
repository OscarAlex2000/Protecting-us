const { response, request } = require("express");

const axios = require("axios");

const Marcadores = require('../models/markModel');

// Obtener todos los marcadores - Paginado
const marksGet = async (req = request, res = response) => {
    try {
        let {
            limit = 20,
            from = 0,
            search_fields = JSON.stringify([
                "color"
            ]),
            search = "",
            order_field = "created_at",
            order = "asc",
            complete = false,
        } = req.query;
        
        let query = ( !complete  || complete === 'false' ) ?  { status: true } : {};

        const [count, marcadores] = await Promise.all([
            Marcadores.countDocuments(query),
            Marcadores.find(query)
                .collation({ locale: "en" })
                .sort({
                    [order_field]: order
                })
                .skip(Number(from))
                .limit(Number(limit))
        ]);

        return res.status(200).json({
            ok: true,
            msg: `${count} marks found`,
            msg_es: `Se encontraron ${count} marcadores`,
            count,
            marks: marcadores,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: "An error occurred while getting marks information",
            msg_es: "Ocurrio un error al obtener la información de los marcadores",
        });
    }
}

// Agregar marcador
const markPost = async (req, res = response) => {
    try {
        // Variable que lleva todos los marcadores
        const { marks } = req.body;
        let marks_arr_resp = [];
        let mark_response = [];

        //  Revisar si ya esta esta en BD
        // Sino agregarlo
        for (let i = 0; i < marks.length; i++) {
            // Armar objeto para crear o actualizar marcvador
            let ObjMark = {
                color: marks[i].color,
                centro: marks[i].centro,
                location: marks[i].location,
                // created_by: req.usuario ? req.usuario : null,
                updated_by: req.usuario ? req.usuario : null,
            };

            if ( marks[i].id === "" ){
                ObjMark.created_by = req.usuario ? req.usuario : null;
                const mark = new Marcadores(ObjMark);
                
                // Guardar en BD
                mark_id = await mark.save();
            } else {
                ObjMark.updated_by = req.usuario ? req.usuario : null;
                ObjMark.updated_at = Date.now();
                await Marcadores.findByIdAndUpdate(marks[i].id, ObjMark, {
                    new: true,
                });
            }

            mark_response = {
                id: marks[i].id !== '' ? marks[i].id : mark_id._id,   
                color: marks[i].color,
                centro: marks[i].centro,
                location: marks[i].location,
                created_by: {
                    _id: req.usuario ? req.usuario._id : null,
                    name: req.usuario ? req.usuario.name : '',
                    first_lastname: req.usuario ? req.usuario.first_surname : '',
                    second_lastname: req.usuario ? req.usuario.second_surname : '',
                    user_name: req.usuario ? req.usuario.user_name : '',
                },
                updated_by: {
                    _id: req.usuario ? req.usuario._id : null,
                    name: req.usuario ? req.usuario.name : '',
                    first_lastname: req.usuario ? req.usuario.first_surname : '',
                    second_lastname: req.usuario ? req.usuario.second_surname : '',
                    user_name: req.usuario ? req.usuario.user_name : '',
                },
            }

            marks_arr_resp.push(mark_response);
        };

        return res.status(200).json({
            ok: true,
            msg: "Mark(s) register successfully",
            msg_es: "Marcador(es) registrados exitosamente",
            mark: marks_arr_resp
        });
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            ok: false,
            msg: "An error occurred while registering mark information",
            msg_es: "Ocurrio un error al registrar la información del marcador",
            error: error
        });
    }
}

const markDelete = async (req, res = response) => {
    try {
        // Variable que lleva todos los marcadores
        const { id } = req.params;

        await Marcadores.findByIdAndUpdate(
            id, {
                status: false,
                deleted_at: Date.now(),
                updated_by: {
                    _id: req.usuario ? req.usuario._id : null,
                    name: req.usuario ? req.usuario.name : '',
                    first_lastname: req.usuario ? req.usuario.first_surname : '',
                    second_lastname: req.usuario ? req.usuario.second_surname : '',
                    user_name: req.usuario ? req.usuario.user_name : ''
                }
            }, { new: true }
        );

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

module.exports = {
    marksGet,
    markPost,
    markDelete
};