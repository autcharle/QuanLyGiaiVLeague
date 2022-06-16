const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const {
  funcSearchMatch,
  funcCreateMatch,
  funcUpdateAMatch,
  funcDeleteAMatch,
  funcGetAMatch,
} = require("../services/matchServices");

const {
  funcSearchGoal,
  funcCreateAGoal,
  funcUpdateAGoal,
  funcDeleteAGoal,
} = require("../services/goalServices");
// @desc    Create new match
// @route   POST /api/matches
// @access  Public
const createAMatch = asyncHandler(async (req, res) => {
  // check input
  const { season, round, home_club, away_club, on_date } = req.body;
  const result = await funcCreateMatch(
    season,
    round,
    home_club,
    away_club,
    on_date
  );

  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});

// @desc    Get a match
// @route   GET /api/match/:id
// @access  Public
const getAMatch = asyncHandler(async (req, res) => {
  const result = await funcGetAMatch(req.params.id)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
// @desc    find matches
// @route   POST /api/matches/search
// @access  Public
const searchMatches = asyncHandler(async (req, res) => {
  const { season, round, home_club, away_club, on_date } = req.body;
  const result = await funcSearchMatch(season, round, home_club, away_club, on_date )

  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
// @desc    Update a match
// @route   PUT /api/matches/:id
// @access  Public
const updateAMatch = asyncHandler(async (req, res) => {
  const id = req.params.id ? req.params.id : req.body.id;
  const { season, round, home_club, away_club, on_date } = req.body;
  const result = await funcUpdateAMatch(
    id,
    season,
    round,
    home_club,
    away_club,
    on_date
  );

  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
// @desc    Delete  a match
// @route   DELETE /api/matches/:id
// @access  Public
const deleteAMatch = asyncHandler(async (req, res) => {
  const id = req.params.id ? req.params.id : req.body.id;
  const {season,home_club,away_club} = req.body
  const result = await funcDeleteAMatch(id,season,home_club,away_club)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
// >>>>>>>>>>>>>>>>>>>>>>> goals{
// @desc    Create new a goal
// @route   POST /api/goals
// @access  Private
const createAGoal = asyncHandler(async (req, res) => {
  // check input
  const match = req.params.id
  const { player, goal_minute, type } = req.body;
  const result = await funcCreateAGoal(player, match, goal_minute, type);

  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
  res.json(result);
});

// @desc    Search goals
// @route   GET /api/goals/search
// @access  Public

const getGoals = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await funcSearchGoal(
    undefined,
    undefined,
    id,
    undefined,
    undefined,
    undefined
  );
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Public

const updateAGoal = asyncHandler(async (req, res) => {
  const id = req.params.goalId;
  const { goal_minute, type } = req.body;
  const result = await funcUpdateAGoal(id, goal_minute, type);

  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Public

const deleteAGoal = asyncHandler(async (req, res) => {
  const id = req.params.goalId;
  const result = await funcDeleteAGoal(id);
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
// } goals <<<<<<<<<<<<<<<<<<<<<<<<<<< 
module.exports = {
  createAMatch,
  searchMatches,
  getAMatch,
  updateAMatch,
  deleteAMatch,

  getGoals,
  createAGoal,
  updateAGoal,
  deleteAGoal,
};
