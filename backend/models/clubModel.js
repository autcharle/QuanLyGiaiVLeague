const mongoose = require('mongoose')

const clubSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    stadium:{
        type: String,
        required: [true, 'Please add a stadium']
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('Club', clubSchema)