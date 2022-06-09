const mongoose = require('mongoose')

const rankingSchema = mongoose.Schema({
    club:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, 'please add club'],
        ref: 'Club',
    },
    season:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, 'please add season'],
        ref: 'Season',
    },
    rank: {
        type: Number,
        default: 0,
    },
    win:{
        type: Number,
        default: 0,
    },
    draw: {
        type: Number,
        default: 0,
    },
    lose: {
        type: Number,
        default: 0,
    },    
    goal_difference :
    {
        type: Number,
        default: 0,
    },  
    point:{
        type: Number,
        default: 0,
    }

}, {
    timestamps: true,
})

module.exports = mongoose.model('Ranking', rankingSchema)