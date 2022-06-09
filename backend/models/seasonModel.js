const mongoose = require("mongoose");

const seasonSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    min_player: {
      type: Number,
      default: 15,
    },
    max_player: {
      type: Number,
      default: 22,
    },
    min_foreign_player: {
      type: Number,
      default: 0,
    },
    max_foreign_player: {
      type: Number,
      default: 3,
    },
    min_age: {
      type: Number,
      default: 16,
    },
    max_age: {
      type: Number,
      default: 40,
    },
    play_duration: {
      type: Number,
      default: 96,
    },
    play_duration: {
      type: Number,
      default: 96,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    win_point: {
      type: Number,
      default: 3,
    },
    draw_point: {
      type: Number,
      default: 1,
    },
    lose_point: {
      type: Number,
      default: 0,
    },
    goal_difference_rank: {
      type: Number,
      default: 1,
    },
    point_rank: {
      type: Number,
      default: 2,
    },
    win_rank: {
      type: Number,
      default: 3,
    },
    draw_rank: {
      type: Number,
      default: 4,
    },
    lose_rank: {
      type: Number,
      default: 5,
    },
    goal_type: {
      type: [String],
      default: ["A", "B", "C"],
    },
    // player_type:{
    //     type: [String],
    //     default: ['native','foreign']
    // }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Season", seasonSchema);
