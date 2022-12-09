const { Schema, model } = require('mongoose');

const ConfigSchema = Schema({
    company_id: {
        type: Schema.Types.ObjectId,
        default: null
    },
    multiple_sessions: {
        type: Boolean,
        default: true
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'companies_config' });

module.exports = model('CompanyConfig',ConfigSchema);