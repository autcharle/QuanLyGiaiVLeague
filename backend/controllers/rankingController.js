const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const Ranking = require("../models/rankingModel");
const Season = require("../models/seasonModel");
const Club = require("../models/clubModel");
const Player = require("../models/playerModel");
const {
  funcSearchRanking,
  CreateARanking,
  funcDeleteARanking,
  GetValidatePlayer,
  GetValidateClubWithPlayer,
} = require('../services/rankingServices')

// @desc    Create a rankings/ register 
// @route   POST /api/rankings/
// @access  Public
const createARanking = asyncHandler(async (req, res) => {
  const season = req.body.season;
  const club = req.body.club;
  const result = await CreateARanking(season,club)
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// @desc    Get rankings of a season
// @route   GET /api/rankings/
// @access  Public
const getRankingOfASeason = asyncHandler(async (req, res) => {
  const season = req.body.season;
  const result = await funcSearchRanking(season,undefined)
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// @desc    find rankings
// @route   POST /api/rankings/search
// @access  Public
const findRankings = asyncHandler(async (req, res) => {
  const {  season, club } = req.body;
  const result = await funcSearchRanking(season,club)
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// @desc    Delete a ranking for a club of a seasons
// @route   DELETE /api/id
// @access  Public
const deleteAClubRanking = asyncHandler(async (req, res) => {
  const id = req.params.id
  const result = await funcDeleteARanking(id)
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});
// ------------------------->> For register << //

// @desc    Get validate table of player that can join a specific season in a club
// @route   POST /api/rankings/register/:seasonId/:clubId"
// @access  Public
const getValidatePlayer = asyncHandler(async (req, res) => {
  const season = req.params.seasonId;
  const club = req.params.clubId;

  const result = await GetValidatePlayer(season,club)
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);

});

// @desc    Get validate table of club that can join a specific season
// @route   POST /api/:id/seasons
// @access  Public
const getValidate = asyncHandler(async (req, res) => {
  const season = req.params.seasonId
  const result = await GetValidateClubWithPlayer(season)
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// ---- Helper Funciton {


//  } end of Helper Funciton -----------------------------------------

module.exports = {
  createARanking,

  getRankingOfASeason,
  findRankings,
  deleteAClubRanking,

  getValidate,
  getValidatePlayer,
};
