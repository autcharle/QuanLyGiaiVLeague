const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const Match = require("../models/matchModel");
const Ranking = require("../models/rankingModel");
const Season = require("../models/seasonModel");


// @desc    Create new match
// @route   POST /api/matches
// @access  Public
const createMatch = asyncHandler(async (req, res) => {
  // check input
  const { season, round, home_club, away_club, on_date } = req.body;
  if (!season || !round || !home_club|| !away_club|| !on_date) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  // check exist
  const existedMatchs = await Match.find({
    $and: [
      { season: new mongoose.Types.ObjectId(season) },
      { round: { _id: user } },
      { home_club: { $regex: ".*" + stadium + ".*" } },
      { away_club: { $regex: ".*" + stadium + ".*" } },
    ],
  });
  if (existedMatchs.length != 0) {
    // res.status(400);
    // throw new Error("Already created for this season");
    res
      .status(400)
      .json({
        message: "manager or name or stadium existed in other match",
        existedMatchs,
      });
    return;
  }
  const match = await Match.create({
    user: user,
    name: name,
    stadium: stadium,
  });

  res.status(200).json({ match });
});

// @desc    Get matches
// @route   GET /api/matches
// @access  Public
const getMatchs = asyncHandler(async (req, res) => {
  const matches = await Match.find();
  res.status(200).json(matches);
});

// @desc    Get seasons
// @route   GET /api/seasons/:id
// @access  Public
const getAMatch = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400);
    throw new Error("missng id");
  }

  res.status(200).json(await Match.findById(req.params.id));
});
// @desc    find seasons
// @route   POST /api/seasons/search
  // @access  Public
const findMatchs = asyncHandler(async (req, res) => {
  const { user, name, stadium } = req.body;
  if (!user || !name || !stadium) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  const existedMatchs = await Match.find({
    $or: [
      { name: { $regex: ".*" + name + ".*" } },
      { user: { _id: user } },
      { stadium: { $regex: ".*" + stadium + ".*" } },
    ],
  });
  res.status(200).json(existedMatchs);
});
// @desc    Update season
// @route   PUT /api/seasons:id
// @access  Public
const updateMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  
  if (!match) {
    res.status(400);
    throw new Error("Match not existed");
  }

  const updateValue ={
      user: req.body.user || match.user,
      name: req.body.name || match.name,
      stadium: req.body.stadium || match.stadium,
  }
  const updatedItem = await Match.findByIdAndUpdate(req.params.id, updateValue, {
    new: true,
  });
  res.status(200).json({ msg: "updateMatch" ,updatedItem});
});
// @desc    Delete season
// @route   DELETE /api/seasons:id
// @access  Public
const deleteMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) {
    res.status(400);
    throw new Error("Match not existed");
  }
  await match.remove();
  res.status(200).json({id : req.params.id });
});

module.exports = {
  createMatch,
  getMatchs,
  getAMatch,
  findMatchs,
  updateMatch,
  deleteMatch,
};
