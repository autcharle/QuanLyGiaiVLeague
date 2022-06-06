const mongoose = require('mongoose')

const seasonSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    number_of_player:{
        min_player:{
            type: Number,
            default: 15
        },
        max_player:{
            type: Number,
            default: 22
        },
    },
    number_of_foreign_player:{
        min_player:{
            type: Number,
            default: 0
        },
        max_player:{
            type: Number,
            default: 3
        },
    },
    age:{
        min_age:{
            type: Number,
            default: 16
        },
        max_age:{
            type: Number,
            default: 40
        },
    },
    play_duration:{
        type: Number,
        default: 96
    },
    play_duration:{
        type: Number,
        default: 96
    },
    start_date:{
        type: Date,
    },
    end_date: {
        type: Date,
    },
}, {
    timestamps: true,
})

module.exports = mongoose.model('Season', seasonSchema)