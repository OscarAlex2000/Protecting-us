const { Schema, model } = require('mongoose');

const CaptchaSchema = new Schema({
    captcha_id: {
        type: Schema.Types.ObjectId,
    },
    text: {
        type: String
    },
    expires_at: {
        type: Date
    }
}, { timestamps: { createdAt: 'created_at'}, collection: 'captchas' });

CaptchaSchema.methods.toJSON = function() {
    const { __v, ...data } = this.toObject();
    return data;
}

module.exports =  model('Captcha', CaptchaSchema); 

