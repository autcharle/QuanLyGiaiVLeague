const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum:['manager','admin'],
        required: true,
    },
    status: {
        type: String,
        enum:['active','inactive'],
        default:'inactive',
        required: true,
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('User', userSchema)