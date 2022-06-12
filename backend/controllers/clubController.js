const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const Club = require("../models/clubModel");
const {
  funcSearchExistClub,
  funcCreateAClub,
  funcGetAllClubs,
  funcGetAClub,
  funcUpdateAClub,
  funcDeleteAClub,

  SearchClub,
} = require("../services/clubServices");

const {
  funcGetPlayers,
  funcGetAPlayer,
  funcDeleteAPlayer,

  AddPlayer,
  SearchPlayer,
  UpdateAPlayer,
} = require("../services/playerServices");

const mongoose = require("mongoose");

// >>>>>>>>>>>>>>>>>>>>> Pure club {

// @desc    Create new club
// @route   POST /api/clubs
// @access  Public
const createClub = asyncHandler(async (req, res) => {
  // Get and check input
  const { user, name, stadium } = req.body;
  if (!user || !name || !stadium) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  // check exists
  const existedClubs = await funcSearchExistClub(user, name, stadium);
  if (existedClubs.length != 0) {
    res.status(400).json({
      message: "manager or name or stadium existed in other club",
      existedClubs,
    });
    return;
  }
  // create club
  const club = await funcCreateAClub(user, name, stadium);
  res.status(200).json({ club });
});

// @desc    Get clubs
// @route   GET /api/clubs
// @access  Public
const getClubs = asyncHandler(async (req, res) => {
  const clubs = await funcGetAllClubs();
  res.status(200).json(clubs);
});

// @desc    Get clubs
// @route   GET /api/clubs/:id
// @access  Public
const getAClub = asyncHandler(async (req, res) => {
  const club = await funcGetAClub(req.params.id);
  res.status(200).json(club);
});

// @desc    find seasons
// @route   POST /api/seasons/search
// @access  Public
const findClubs = asyncHandler(async (req, res) => {
  const { user, name, stadium } = req.body;
  if (!user && !name && !stadium) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  const existedClubs = await SearchClub(user, name, stadium);
  res.status(200).json(existedClubs);
});
// @desc    Update season
// @route   PUT /api/seasons:id
// @access  Public
const updateClub = asyncHandler(async (req, res) => {
  // check exist
  const club = await funcGetAClub(req.params.id);
  if (!club) {
    res.status(400);
    throw new Error("Club not existed");
  }
  const { user, name, stadium } = req.body;
  if (!user) {
    user = club.user;
  }
  if (!name) {
    user = club.name;
  }
  if (!stadium) {
    user = club.stadium;
  }
  // check input value
  const existedValue = await funcSearchExistClub(user, name, stadium);
  const existed = existedValue.filter((i) => {
    return club._id.toString() != i._id.toString();
  });

  if (existed.length > 0) {
    res.status(400).json({ message: "value existed", existed });
    return;
  }
  // update
  const updateValue = {
    user: user,
    name: name,
    stadium: stadium,
  };
  const updatedItem = await funcUpdateAClub(req.params.id, updateValue);
  res.status(200).json({ message: "updateClub", updatedItem });
});
// @desc    Delete season
// @route   DELETE /api/seasons:id
// @access  Public
const deleteClub = asyncHandler(async (req, res) => {
  const result = await funcDeleteAClub(req.params.id);
  res.status(200).json(result);
});
// } Pure club <<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>> Player in club {
// @desc    Get players in a club
// @route   GET /:id/players
// @access  Public
const getPlayersInClub = asyncHandler(async (req, res) => {
  const club = req.params.id;
  const { name, dob, type } = req.body;
  const result = await SearchPlayer(club, undefined, undefined, undefined);
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// @desc    create a new player in a club
// @route   POST /:id/players
// @access  Public
const addAPlayerToClub = asyncHandler(async (req, res) => {
  const club = req.params.id;
  const { name, dob, note, type } = req.body;
  const result = await AddPlayer(club, name, dob, note, type);
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});

// @desc    Get a new player in a club by Id
// @route   GET /:id/players/:playerId
// @access  Public
const getAPlayerInClub = asyncHandler(async (req, res) => {
  console.log('asa')
  const player = await funcGetAPlayer(req.params.playerId);
  res.status(200).json(player);
});
// @desc    Update a player in a club by Id
// @route   Put /:id/players/:playerId
// @access  Public
const updateAPlayerInClub = asyncHandler(async (req, res) => {
  const { name, dob, note, type } = req.body;
  const playerId = req.params.playerId;
  const club = req.params.id;
  const result = await UpdateAPlayer(playerId, club, name, note, dob, type);
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});
// @desc    Delete a player in a club by Id
// @route   Put /:id/players/:playerId
// @access  Public
const deleteAPlayerInClub = asyncHandler(async (req, res) => {
  const result = await funcDeleteAPlayer(req.params.playerId);
  res.status(200).json(result);
});

// @desc    Search players in a club by Id
// @route   Put /:id/players/search
// @access  Public
const searchAPlayerInClub = asyncHandler(async (req, res) => {
  const club = req.params.id;
  const { name, dob, type } = req.body;
  const result = await SearchPlayer(club, name, dob, type);
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);
});
// } <<<<<<<<<<<<<<<<<<<<<<<<<<

module.exports = {
  createClub,
  getClubs,
  getAClub,
  findClubs,
  updateClub,
  deleteClub,

  getPlayersInClub,
  addAPlayerToClub,
  getAPlayerInClub,
  updateAPlayerInClub,
  deleteAPlayerInClub,
  searchAPlayerInClub,
};
