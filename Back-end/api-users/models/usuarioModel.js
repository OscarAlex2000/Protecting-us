const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    default_user: {
        type: Boolean,
        default: false
    },
    old_id: {
        type: Number
    },
    company_id: {
        type: Schema.Types.ObjectId,
        default: null
    },
    branch_id: {
        type: Schema.Types.ObjectId,
        default: null
    },
    account_id: {
        type: Schema.Types.ObjectId,
        default: null
    },
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    first_surname: {
        type: String,
        default: null
    },
    second_surname: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        default: null
    },
    user_name: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio']
    },
    password: {
        type: String,
        default: null
    },
    thumbnail_image_name: {
        type: String,
        default: null
    },
    thumbnail_image_url: {
        type: String,
        default: null
    },
    image_name: {
        type: String,
        default: null
    },
    image_url: {
        type: String,
        default: null
    },
    validation_code: {
        type: String,
        default: null
    },
    validated: {
        type: Boolean,
        default: false
    },
    validation_date: {
        type: Date,
        default: null
    },
    reset_password_code: {
        type: String,
        default: null
    },
    reset_password_expires: {
        type: Date,
        default: null
    },
    password_change_date: {
        type: Date,
        default: null
    },
    root: {
        type: Boolean,
        default: false
    },
    permissions: {
        type: [
            {
                _id: { type: Schema.Types.ObjectId },
                name: { type: String, default: '' },
                alias_id: { type: Number, default: null },
                alias: { type: String, default: '' }
            }
        ],
        default: []
    },
    profiles: {
        type: [{
            _id: { type: Schema.Types.ObjectId },
            name: { type: String, default: '' },
            enabled: { type: Boolean, default: true },
            permissions: {
                type: [{
                    _id: { type: Schema.Types.ObjectId },
                    name: { type: String, default: '' },
                    alias_id: { type: Number, default: null },
                    alias: { type: String, default: '' }
                }]
            }
        }],
        default: []
    },
    active: {
        type: Boolean,
        default: true
    },
    status: {
        type: Boolean,
        default: true
    },
    deleted_at: {
        type: Date,
        default: null
    },
    last_login: {
        type: Date,
        default: null
    },
    penultimate_login: {
        type: Date,
    },
    session_expire: {
        type: Date,
        default: null
    },
    created_by: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: 'Usuario'
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: 'Usuario'
    },
    jwt_white_list: {
        type: Array,
        default: []
    },
    authorize: {
        type: Boolean,
        default: false
    },
    authorize_code: {
        type: String,
        default: ''
    },
    check_in_require: {
        type: Boolean,
        default: false
    },
    last_check_in: {
        type: Date,
        default: null
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'users' });

UserSchema.index({ name: 'index' });

UserSchema.index(
    { user_name: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: true } }
)

UserSchema.methods.toJSON = function () {
    const { __v, password, status, reset_password_code, reset_password_expires, jwt_white_list, ...user } = this.toObject();
    global.api.show_user_name === "false" || global.api.show_user_name === "0" || global.api.show_user_name == false ? user.user_name = null : '';

    user.all_permissions = user.permissions.map(element => element.alias);
    for (const profile of user.profiles.filter(p => p.enabled)) {
        user.all_permissions = [...new Set([...user.all_permissions, ...profile.permissions.map(permission => permission.alias)])]
    }

    return user;
}

module.exports = model('Usuario', UserSchema);