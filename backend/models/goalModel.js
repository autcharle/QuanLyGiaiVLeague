const mongoose = require('mongoose')

const goalSchema = mongoose.Schema({
    player:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, 'please add player'],
        ref: 'Player',
    },
    club:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, 'please add player'],
        ref: 'Club',
    },
    match:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, 'please add player'],
        ref: 'Match',
    },
    season:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, 'please add player'],
        ref: 'Season',
    },
    goal_minute:{
        type: Number,
        required:[true, 'please add goal_minute'],
    },
    type: {
        type: String,
        required:[true, 'please add type'],
    },
}, {
    timestamps: true,
})

module.exports = mongoose.model('Goal', goalSchema)