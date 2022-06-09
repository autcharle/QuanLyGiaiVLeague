const mongoose = require('mongoose')

const playerSchema = mongoose.Schema({
    club:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, 'please add club'],
        ref: 'Club',
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    dob:{
        type: Date,
        required: [true, 'Please add a date']
    },
    note: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        enum: ['native','foreign'],
        require:  [true, 'Please add a player type'],
    },
    // status: {
    //     type: String,
    //     enum:['active','inactive'],
    //     default:'active',
    //     required: true,
    // }
}, {
    timestamps: true,
})

module.exports = mongoose.model('Player', playerSchema)