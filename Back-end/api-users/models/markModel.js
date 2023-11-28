const { Schema, model } = require('mongoose');

const MarkSchema = Schema({
    color: {
        type: String,
        default: null
    },
    centro: {
        type: [],
        default: []
    },
    info: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: true
    },
    created_by: {
        type: [
            {
                _id: Schema.Types.ObjectId,
                name: String,
                first_lastname: String,
                second_lastname: String,
                user_name: String
            }
        ],
        default: null,
        ref: 'Usuario'
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_by: {
        type: [
            {
                _id: Schema.Types.ObjectId,
                name: String,
                first_lastname: String,
                second_lastname: String,
                user_name: String
            }
        ],
        default: null,
        ref: 'Usuario'
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }, 
    deleted_at: {
        type: Date,
        default: null
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'marks' });

MarkSchema.index({ color: 'index' });

module.exports = model('Marcador', MarkSchema);