const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const Club = require("../models/clubModel");

// @desc    Create new club
// @route   POST /api/clubs
// @access  Public
const createClub = asyncHandler(async (req, res) => {
  const { user, name, stadium } = req.body;
  if (!user || !name || !stadium) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  const existedClubs = await Club.find({
    $or: [
      { name: { $regex: ".*" + name + ".*" } },
      { user: { _id: user } },
      { stadium: { $regex: ".*" + stadium + ".*" } },
    ],
  });
  if (existedClubs.length != 0) {
    // res.status(400);
    // throw new Error("Already created for this season");
    res
      .status(400)
      .json({
        message: "manager or name or stadium existed in other club",
        existedClubs,
      });
    return;
  }
  const club = await Club.create({
    user: user,
    name: name,
    stadium: stadium,
  });

  res.status(200).json({ club });
});

// @desc    Get clubs
// @route   GET /api/clubs
// @access  Public
const getClubs = asyncHandler(async (req, res) => {
  const clubs = await Club.find();
  res.status(200).json(clubs);
});

// @desc    Get seasons
// @route   GET /api/seasons/:id
// @access  Public
const getAClub = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400);
    throw new Error("missng id");
  }

  res.status(200).json(await Club.findById(req.params.id));
});
// @desc    find seasons
// @route   POST /api/seasons/search
  // @access  Public
const findClubs = asyncHandler(async (req, res) => {
  const { user, name, stadium } = req.body;
  if (!user || !name || !stadium) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  const existedClubs = await Club.find({
    $or: [
      { name: { $regex: ".*" + name + ".*" } },
      { user: { _id: user } },
      { stadium: { $regex: ".*" + stadium + ".*" } },
    ],
  });
  res.status(200).json(existedClubs);
});
// @desc    Update season
// @route   PUT /api/seasons:id
// @access  Public
const updateClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  
  if (!club) {
    res.status(400);
    throw new Error("Club not existed");
  }

  const updateValue ={
      user: req.body.user || club.user,
      name: req.body.name || club.name,
      stadium: req.body.stadium || club.stadium,
  }
  const updatedItem = await Club.findByIdAndUpdate(req.params.id, updateValue, {
    new: true,
  });
  res.status(200).json({ msg: "updateClub" ,updatedItem});
});
// @desc    Delete season
// @route   DELETE /api/seasons:id
// @access  Public
const deleteClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) {
    res.status(400);
    throw new Error("Club not existed");
  }
  await club.remove();
  res.status(200).json({id : req.params.id });
});

module.exports = {
  createClub,
  getClubs,
  getAClub,
  findClubs,
  updateClub,
  deleteClub,
};
