const mongoose = require('mongoose')

const matchSchema = mongoose.Schema({
    season:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, 'please add season'],
        ref: 'Season',
    },
    round:{
        type: Number,
        default: 0,
    },
    home_club:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, 'please add club'],
        ref: 'Club',
    },
    away_club:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, 'please add club'],
        ref: 'Club',
    },
    home_point:{
        type: Number,
        default: 0,
    },
    away_point:{
        type: Number,
        default: 0,
    },
    on_date:{
        type: Date,
        required:[true, 'please add date'],
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model('Match', matchSchema)