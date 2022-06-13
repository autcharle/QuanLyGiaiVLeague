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
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// @desc    Get seasons
// @route   GET /api/seasons/:id
// @access  Public
const getAMatch = asyncHandler(async (req, res) => {
  const result = await funcGetAMatch(req.params.id)
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});
// @desc    find seasons
// @route   POST /api/seasons/search
// @access  Public
const searchMatches = asyncHandler(async (req, res) => {
  const { season, round, home_club, away_club, on_date } = req.body;
  const result = await funcSearchMatch(season, round, home_club, away_club, on_date )

  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});
// @desc    Update season
// @route   PUT /api/seasons:id
// @access  Public
const updateAMatch = asyncHandler(async (req, res) => {
  const id = req.params.id;
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
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});
// @desc    Delete season
// @route   DELETE /api/seasons:id
// @access  Public
const deleteAMatch = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await funcDeleteAMatch(id)
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

module.exports = {
  createAMatch,
  searchMatches,
  getAMatch,
  updateAMatch,
  deleteAMatch,
};
