const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const {
  funcGetPlayers,
  funcGetAPlayer,
  funcDeleteAPlayer,

  AddPlayer,
  SearchPlayer,
  UpdateAPlayer,
} = require("../services/playerServices");

// @desc    Create new player
// @route   POST /api/players
// @access  Public
const createPlayer = asyncHandler(async (req, res) => {
  const { club, name, dob, note, type } = req.body;
  if (!club || !name || !dob || !type) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  const result = await AddPlayer(club, name, dob, note, type);
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// @desc    Get players
// @route   GET /api/players
// @access  Public
const getPlayers = asyncHandler(async (req, res) => {
  const players = await funcGetPlayers();
  res.status(200).json(players);
});

// @desc    Get players
// @route   GET /api/players/:id
// @access  Public
const getAPlayer = asyncHandler(async (req, res) => {
  const player = await funcGetAPlayer(req.params.id);
  res.status(200).json(player);
});

// @desc    find players
// @route   POST /api/players/search
// @access  Public
const findPlayers = asyncHandler(async (req, res) => {
  const { club, name, dob, type } = req.body;
  const result = await SearchPlayer(club, name, dob, type);
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// @desc    Update player
// @route   PUT /api/players:id
// @access  Public
const updatePlayer = asyncHandler(async (req, res) => {
  const { club, name, dob, note, type } = req.body;
  const playerId = req.params.id;

  const result = await UpdateAPlayer(playerId, club, name, note, dob, type);
  if (result.error) {
    res.status(400);
  } else {
    res.status(200);
    // throw new Error(result.error)
  }
  res.json(result);
});
// @desc    Delete player
// @route   DELETE /api/players:id
// @access  Public
const deletePlayer = asyncHandler(async (req, res) => {
  const result = await funcDeleteAPlayer(req.params.id);
  res.status(200).json(result);
});

module.exports = {
  createPlayer,
  getPlayers,
  getAPlayer,
  findPlayers,
  updatePlayer,
  deletePlayer,
};
