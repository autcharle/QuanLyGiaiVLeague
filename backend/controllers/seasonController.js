const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const Season = require("../models/seasonModel");

// @desc    Create new season
// @route   POST /api/season
// @access  Public
const createSeason = asyncHandler(async (req, res) => {
  // if (!req.body) {
  //   res.status(400);
  //   throw new Error("Please add a text field");
  // }
  console.log(req.body)
  const name = req.body.name || "Vleague " + new Date().getFullYear().toString();
  const seasonExist = await Season.findOne({ name });
  if (seasonExist) {
    // res.status(400);
    // throw new Error("Already created for this season");
    console.log(name)
    res.status(200).json({message:'Already created for this season',seasonExist})
    return;
  }

  const season = await Season.create({
    name: name,
    number_of_player: {
      min_player: req.body.min_player || 15,
      max_player: req.body.max_player || 22,
    },
    number_of_foreign_player: {
      min_player: req.body.min_foreign_player || 0,
      max_player: req.body.max_foreign_player || 3,
    },
    age: {
      min_age: req.body.min_age || 16,
      max_age: req.body.max_age || 40,
    },
    play_duration: req.body.play_duration || 96,
    start_date:  Date.parse(req.body.start_date) || null,
    end_date: Date.parse(req.body.end_date) || null,
    win_point: req.body.win_point || 3,
    draw_point: req.body.draw_point || 1,
    lose_point: req.body.lose_point || 0,
    goal_difference_rank: req.body.goal_difference_rank || 1,
    point_rank: req.body.point_rank || 2,
    win_rank: req.body.win_rank || 3,
    draw_rank: req.body.draw_rank || 4,
    lose_rank: req.body.lose_rank || 5,
    goal_type: req.body.goal_type || [
      A,
      B,
      C,
    ],
    player_type:req.body.player_type || [
      native,
      foreign
    ],
  });
  res.status(200).json(season);
});

// @desc    Get seasons
// @route   GET /api/seasons
// @access  Public
const getSeason = asyncHandler(async (req, res) => {
  const seasons = await Season.find();
  res.status(200).json(seasons);
});
// @desc    Get seasons
// @route   GET /api/seasons/:id
// @access  Public
const getASeason = asyncHandler(async (req, res) => {
  res.status(200).json(await Season.findById(req.params.id));
});
// @desc    find seasons
// @route   POST /api/seasons/search
// @access  Public
const findSeason = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    res.status(400);
    throw new Error("Please enter name field");
  }
  const seasons = await Season.find({name :  { $regex: '.*' + req.body.name + '.*' }});
  res.status(200).json(seasons);
});
// @desc    Update season
// @route   PUT /api/seasons:id
// @access  Public
const updateSeason = asyncHandler(async (req, res) => {
  const season = await Season.findById(req.params.id);
  if (!season){
    res.status(400);
    throw new Error("Season not exists");
  }

  const updateValue = {
    name: req.body.name || season.name,
    number_of_player: {
      min_player: req.body.min_player || season.number_of_player.min_player,
      max_player: req.body.max_player || season.number_of_player.max_player,
    },
    number_of_foreign_player: {
      min_player: req.body.min_foreign_player || season.number_of_foreign_player.min_player,
      max_player: req.body.max_foreign_player || season.number_of_foreign_player.max_player,
    },
    age: {
      min_age: req.body.min_age || season.age.min_age,
      max_age: req.body.max_age || season.age.max_age,
    },
    play_duration: req.body.play_duration || season.play_duration,
    start_date:  Date.parse(req.body.start_date) || season.start_date,
    end_date: Date.parse(req.body.end_date) || season.end_date,
    win_point: req.body.win_point || season.win_point,
    draw_point: req.body.draw_point || season.draw_point,
    lose_point: req.body.lose_point || season.lose_point,
    goal_difference_rank: req.body.goal_difference_rank || season.goal_difference_rank,
    point_rank: req.body.point_rank || season.point_rank ,
    win_rank: req.body.win_rank || season.win_rank,
    draw_rank: req.body.draw_rank || season.draw_rank,
    lose_rank: req.body.lose_rank || season.lose_rank,
    goal_type: req.body.goal_type || season.goal_type,
    player_type:req.body.player_type || season.player_type,
  }
  const updatedSeason = await Season.findByIdAndUpdate(req.params.id, updateValue, {
    new: true,
  });
  res.status(200).json({ msg: "updateSeason" ,updatedSeason});
});
// @desc    Delete season
// @route   DELETE /api/seasons:id
// @access  Public
const deleteSeason = asyncHandler(async (req, res) => {
  const season = await Season.findById(req.params.id);
  if (!season){
    res.status(400);
    throw new Error("Season not exists");
  }
  await season.remove();
  res.status(200).json({id : req.params.id });
});

module.exports = {
  createSeason,
  getSeason,
  getASeason,
  findSeason,
  updateSeason,
  deleteSeason,
};
