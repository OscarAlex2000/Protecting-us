const { response, request } = require("express");

const axios = require("axios");

const Marcadores = require('../models/markModel');

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
                const markUP = await Marcadores.findByIdAndUpdate(marks[i].id, ObjMark, {
                    new: true,
                });
            }

            mark_response = {
                id: marks[i].id !== '' ? marks[i].id : mark_id._id,   
                color: marks[i].color,
                centro: marks[i].centro,
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
        const { marks } = req.body;

        return res.status(200).json({
            ok: true,
            msg: "Mark(s) update successfully",
            msg_es: "Marcador(es) actualizado exitosamente"
            // mark: marks_arr_resp
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

module.exports = {
    markPost
};