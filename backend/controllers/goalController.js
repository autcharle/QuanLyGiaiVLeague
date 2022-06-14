const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const {
  funcSearchGoal,
  funcCreateAGoal,
  funcUpdateAGoal,
  funcDeleteAGoal,
  funcCalculateMatchPoint,
  funcCalcRankingGoalDiffence,
} = require("../services/goalServices");

// @desc    Create new a goal
// @route   POST /api/goals
// @access  Private
const createAGoal = asyncHandler(async (req, res) => {
  // check input
  const { player, match, goal_minute, type } = req.body;
  const result = await funcCreateAGoal(player, match, goal_minute, type);

  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// @desc    Search goals
// @route   GET /api/goals/search
// @access  Public

const searchGoals = asyncHandler(async (req, res) => {
  const { player, club, match, season, goal_minute, type } = req.body;
  const result = await funcSearchGoal(
    player,
    club,
    match,
    season,
    goal_minute,
    type
  );
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Public

const updateAGoal = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { goal_minute, type } = req.body;
  const result = await funcUpdateAGoal(id, goal_minute, type);

  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});
// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Public

const deleteAGoal = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await funcDeleteAGoal(id);
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// // @desc    Test
// // @route   DELETE /api/goals/test
// // @access  Public
const test = asyncHandler(async (req, res) => {
  let {match,season,id} = req.body;
  match = new mongoose.Types.ObjectId(match)
  season = new mongoose.Types.ObjectId(season)
  id = new mongoose.Types.ObjectId(id)
  const result = await funcCalculateMatchPoint(match);
  // const result = await funcCalcRankingGoalDiffence(id,season)
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});
module.exports = {
  createAGoal,
  searchGoals,
  updateAGoal,
  deleteAGoal,
  test,
};
