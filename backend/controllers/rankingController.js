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

const {
  funcSumGoalOfPlayers
} = require('../services/goalServices')
// @desc    Create a rankings/ register 
// @route   POST /api/rankings/
// @access  Public
const createARanking = asyncHandler(async (req, res) => {
  const season = req.body.season;
  const club = req.body.club;
  const result = await CreateARanking(season,club)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});

// @desc    Get rankings of a season
// @route   GET /api/rankings/
// @access  Public
const getRankingOfASeason = asyncHandler(async (req, res) => {
  const season = req.body.season;
  const result = await funcSearchRanking(season,undefined,undefined)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});

// @desc    find rankings
// @route   POST /api/rankings/search
// @access  Public
const findRankings = asyncHandler(async (req, res) => {
  const {  season, club , rank } = req.body;
  const result = await funcSearchRanking(season,club,rank)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});

// @desc    Delete a ranking for a club of a seasons
// @route   DELETE /api/id
// @access  Public
const deleteAClubRanking = asyncHandler(async (req, res) => {
  
  let id = req.params.id ? req.params.id : req.body.id
  if (!id){
    const {season,club} = req.body
    if (!season || !club){
      res.status(400).json("missing select input");
      throw new Error("missing select input")
    }
    const finds = await funcSearchRanking(season,club,undefined)
    if (finds.length > 1){
      res.status(400).json("logic system error");
      throw new Error("logic system error")
    } else if (finds.length < 1){
      res.status(400).json("ranking/register not found");
      throw new Error("ranking/register not found")
    }
    id = new mongoose.Types.ObjectId(finds[0]._id)
  }
  const result = await funcDeleteARanking(id)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
// ------------------------->> For register << //

// @desc    Get validate table of player that can join a specific season in a club
// @route   POST /api/rankings/register/:seasonId/:clubId"
// @access  Public
const getValidatePlayer = asyncHandler(async (req, res) => {
  const season = req.params.seasonId ? req.params.seasonId : req.body.season
  const club =  req.params.clubId ? req.params.clubId : req.body.club;

  // const season = req.params.seasonId;
  // const club = req.params.clubId;

  const result = await GetValidatePlayer(season,club)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);

});

// @desc    Get validate table of club that can join a specific season
// @route   POST /api/:id/seasons
// @access  Public
const getValidate = asyncHandler(async (req, res) => {
  const season = req.params.seasonId ? req.params.seasonId : req.body.season
  const result = await GetValidateClubWithPlayer(season)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
//  For register <<------------------------- //

// ------------------------->> For Goals ranking << //

// @desc    Get validate table of player that can join a specific season in a club
// @route   POST /api/rankings/register/:seasonId/:clubId"
// @access  Public
const getPlayerGoals = asyncHandler(async (req, res) => {
  const season = req.params.seasonId;

  const result = await funcSumGoalOfPlayers(season)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);

});

//  For register <<------------------------- //
module.exports = {
  createARanking,

  getRankingOfASeason,
  findRankings,
  deleteAClubRanking,

  getValidate,
  getValidatePlayer,

  getPlayerGoals,
};
