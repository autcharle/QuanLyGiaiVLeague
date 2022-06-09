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

  const name = req.body.name
    ? req.body.name
    : "Vleague " + new Date().getFullYear().toString();
  const seasonExist = await Season.findOne({ name });
  if (seasonExist) {
    // res.status(400);
    // throw new Error("Already created for this season");
    res
      .status(200)
      .json({ message: "Already created for this season", seasonExist });
    return;
  }

  const season = await Season.create({
    name: name,

    min_player:
      typeof req.body.min_player !== "undefined" ? req.body.min_player : 15,

    max_player:
      typeof req.body.max_player !== "undefined" ? req.body.max_player : 22,

    min_foreign_player:
      typeof req.body.min_foreign_player !== "undefined"
        ? req.body.min_foreign_player
        : 0,

    max_foreign_player:
      typeof req.body.max_foreign_player !== "undefined"
        ? req.body.max_foreign_player
        : 3,

    min_age: typeof req.body.min_age !== "undefined" ? req.body.min_age : 16,

    max_age: typeof req.body.max_age !== "undefined" ? req.body.max_age : 40,

    play_duration:
      typeof req.body.play_duration !== "undefined"
        ? req.body.play_duration
        : 96,

    start_date:
      req.body.start_date
        ? Date.parse(req.body.start_date)
        : null,

    end_date:
      req.body.end_date ? Date.parse(req.body.end_date) : null,

    win_point:
      typeof req.body.win_point !== "undefined" ? req.body.win_point : 3,

    draw_point:
      typeof req.body.draw_point !== "undefined" ? req.body.draw_point : 1,

    lose_point:
      typeof req.body.lose_point !== "undefined" ? req.body.lose_point : 0,

    goal_difference_rank: req.body.goal_difference_rank
      ? req.body.goal_difference_rank
      : 1,

    point_rank:
      typeof req.body.point_rank !== "undefined" ? req.body.point_rank : 2,

    win_rank: typeof req.body.win_rank !== "undefined" ? req.body.win_rank : 3,

    draw_rank:
      typeof req.body.draw_rank !== "undefined" ? req.body.draw_rank : 4,

    lose_rank:
      typeof req.body.lose_rank !== "undefined" ? req.body.lose_rank : 5,

    goal_type:
    Array.isArray(req.body.goal_type) && req.body.goal_type.length != 0
        ? req.body.goal_type
        : ["A", "B", "C"],
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
  const seasons = await Season.find({
    name: { $regex: ".*" + req.body.name + ".*" },
  });
  res.status(200).json(seasons);
});
// @desc    Update season
// @route   PUT /api/seasons:id
// @access  Public
const updateSeason = asyncHandler(async (req, res) => {
  const season = await Season.findById(req.params.id);
  if (!season) {
    res.status(400);
    throw new Error("Season not exists");
  }

  const updateValue = {
    name: req.body.name ? req.body.name : season.name,

    min_player:
      typeof req.body.min_player !== "undefined"
        ? req.body.min_player
        : season.min_player,

    max_player:
      typeof req.body.max_player !== "undefined"
        ? req.body.max_player
        : season.max_player,

    min_foreign_player:
      typeof req.body.min_foreign_player !== "undefined"
        ? req.body.min_foreign_player
        : season.min_foreign_player,

    max_foreign_player:
      typeof req.body.max_foreign_player !== "undefined"
        ? req.body.max_foreign_player
        : season.max_foreign_player,

    min_age:
      typeof req.body.min_age !== "undefined"
        ? req.body.min_age
        : season.age.min_age,

    max_age:
      typeof req.body.max_age !== "undefined"
        ? req.body.max_age
        : season.age.max_age,

    play_duration:
      typeof req.body.play_duration !== "undefined"
        ? req.body.play_duration
        : season.play_duration,

    start_date: req.body.start_date
      ? Date.parse(req.body.start_date)
      : season.start_date,

    end_date: req.body.end_date
      ? Date.parse(req.body.end_date)
      : season.end_date,

    win_point:
      typeof req.body.win_point !== "undefined"
        ? req.body.win_point
        : season.win_point,

    draw_point:
      typeof req.body.draw_point !== "undefined"
        ? req.body.draw_point
        : season.draw_point,

    lose_point:
      typeof req.body.lose_point !== "undefined"
        ? req.body.lose_point
        : season.lose_point,

    goal_difference_rank:
      typeof req.body.goal_difference_rank !== "undefined"
        ? req.body.goal_difference_rank
        : season.goal_difference_rank,

    point_rank:
      typeof req.body.point_rank !== "undefined"
        ? req.body.point_rank
        : season.point_rank,

    win_rank:
      typeof req.body.win_rank !== "undefined"
        ? req.body.win_rank
        : season.win_rank,

    draw_rank:
      typeof req.body.draw_rank !== "undefined"
        ? req.body.draw_rank
        : season.draw_rank,

    lose_rank:
      typeof req.body.lose_rank !== "undefined"
        ? req.body.lose_rank
        : season.lose_rank,

    goal_type:
      Array.isArray(req.body.goal_type) && req.body.goal_type.length !=0
        ? req.body.goal_type
        : season.goal_type,
  };
  const updatedSeason = await Season.findByIdAndUpdate(
    req.params.id,
    updateValue,
    {
      new: true,
    }
  );
  res.status(200).json({ msg: "updateSeason", updatedSeason });
});
// @desc    Delete season
// @route   DELETE /api/seasons:id
// @access  Public
const deleteSeason = asyncHandler(async (req, res) => {
  const season = await Season.findById(req.params.id);
  if (!season) {
    res.status(400);
    throw new Error("Season not exists");
  }
  await season.remove();
  res.status(200).json({ id: req.params.id });
});

module.exports = {
  createSeason,
  getSeason,
  getASeason,
  findSeason,
  updateSeason,
  deleteSeason,
};
