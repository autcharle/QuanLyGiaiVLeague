const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const Player = require("../models/playerModel");
const mongoose = require("mongoose")
// @desc    Create new player
// @route   POST /api/players
// @access  Public
const createPlayer = asyncHandler(async (req, res) => {
  const { club, name, dob, note, type } = req.body;
  if (!club || !name || !dob || !type) {
    res.status(400);
    throw new Error("Please add a text field");
  }

  const existedPlayers = await Player.find({
    $and: [{ name: { $regex: ".*" + name + ".*" } }, { dob: dob }],
  });

  if (existedPlayers.length != 0) {
    res.status(400).json({
      message: "player existed in other club",
      existedPlayers,
    });
    return;
    // const activePlayer = existedPlayers.find((o) => o.status === "active");
    // if (activePlayer.length != 0) {
    //   res.status(400).json({
    //     message: "manager or name or stadium existed in other player",
    //     existedPlayers,
    //   });
    //   return;
    // }
    // const inactivePlayerInClub = existedPlayers.find(
    //   (o) => o.club === club && o.status === "inactive"
    // );
    // if (inactivePlayerInClub.length != 0) {
    //   const player = await Player.findByIdAndUpdate(inactivePlayerInClub._id, {
    //     status: "active",
    //   });
    //   return res.status(200).json({ player });
    // }
  }
  const player = await Player.create({
    club: club,
    name: name,
    dob: Date.parse(dob),
    note: note,
    type: type,
  });

  res.status(200).json({ player });
});

// @desc    Get players
// @route   GET /api/players
// @access  Public
const getPlayers = asyncHandler(async (req, res) => {
  const players = await Player.find();
  res.status(200).json(players);
});

// @desc    Get players
// @route   GET /api/players/:id
// @access  Public
const getAPlayer = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400);
    throw new Error("missng id");
  }

  res.status(200).json(await Player.findById(req.params.id));
});
// @desc    find players
// @route   POST /api/players/search
// @access  Public
const findPlayers = asyncHandler(async (req, res) => {
  const { club, name, dob, note, type } = req.body;
  if (!club && !name && !dob && !type) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  if (!mongoose.isValidObjectId(club)){
    res.status(400);
    throw new Error("club need to be id");
  }
  const existedPlayers = await Player.find({
    $or: [
      { club: club },
      { name: { $regex: ".*" + name + ".*" } },
      { dob:  dob },
      { type: type },
    ],
  });
  res.status(200).json(existedPlayers);
});

// @desc    Update player
// @route   PUT /api/players:id
// @access  Public
const updatePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);

  if (!player) {
    res.status(400);
    throw new Error("Player not existed");
  }

  const updateValue = {
    club: req.body.club || player.club,
    name: req.body.name || player.name,
    dob: Date.parse(req.body.dob) || player.dob,
    note: req.body.note || player.note,
    type: req.body.type || player.type,
  };
  const updatedItem = await Player.findByIdAndUpdate(
    req.params.id,
    updateValue,
    {
      new: true,
    }
  );
  res.status(200).json({ msg: "updatePlayer", updatedItem });
});

// @desc    Delete player
// @route   DELETE /api/players:id
// @access  Public
const deletePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (!player) {
    res.status(400);
    throw new Error("Player not existed");
  }
  await player.remove();
  res.status(200).json({ id: req.params.id });
});

module.exports = {
  createPlayer,
  getPlayers,
  getAPlayer,
  findPlayers,
  updatePlayer,
  deletePlayer,
};
