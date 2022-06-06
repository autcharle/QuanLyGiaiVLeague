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
  if (existedClubs) {
    // res.status(400);
    // throw new Error("Already created for this season");
    console.log(name);
    res
      .status(200)
      .json({
        message: "manager or name or stadium existed in other club",
        seasonExist,
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
  // if (!req.params.id) {
  //   res.status(400);
  //   throw new Error("missng id");
  // }
  // const seasons = await Season.find({name :  { $regex: '.*' + req.body.name + '.*' }});

  //   res.status(200).json(await Season.findById(req.params.id));
  res.status(200).json({ mesg: "test" });
});
// @desc    find seasons
// @route   POST /api/seasons/search
  // @access  Public
const findClubs = asyncHandler(async (req, res) => {
  //   if (!req.body.name) {
  //     res.status(400);
  //     throw new Error("Please enter name field");
  //   }
  //   const seasons = await Season.find({name :  { $regex: '.*' + req.body.name + '.*' }});

  //   res.status(200).json(seasons);
  res.status(200).json({ mesg: "test" });
});
// @desc    Update season
// @route   PUT /api/seasons:id
// @access  Public
const updateClub = asyncHandler(async (req, res) => {
  //   const season = await Season.findById(req.params.id);
  //   if (!season){
  //     res.status(400);
  //     throw new Error("Season not exists");
  //   }

  //   const updateValue = {
  //     name: req.body.name || season.name,
  //     number_of_player: {
  //       min_player: req.body.min_player || season.number_of_player.min_player,
  //       max_player: req.body.max_player || season.number_of_player.max_player,
  //     },
  //     number_of_foreign_player: {
  //       min_player: req.body.min_foreign_player || season.number_of_foreign_player.min_player,
  //       max_player: req.body.max_foreign_player || season.number_of_foreign_player.max_player,
  //     },
  //     age: {
  //       min_age: req.body.min_age || season.age.min_age,
  //       max_age: req.body.max_age || season.age.max_age,
  //     },
  //     play_duration: req.body.play_duration || season.play_duration,
  //     start_date:  Date.parse(req.body.start_date) || season.start_date,
  //     end_date: Date.parse(req.body.end_date) || season.end_date,
  //   }
  //   const updatedSeason = await Season.findByIdAndUpdate(req.params.id, updateValue, {
  //     new: true,
  //   });
  //   res.status(200).json({ msg: "updateSeason" ,updatedSeason});
  res.status(200).json({ mesg: "test" });
});
// @desc    Delete season
// @route   DELETE /api/seasons:id
// @access  Public
const deleteClub = asyncHandler(async (req, res) => {
  //   const season = await Season.findById(req.params.id);
  //   if (!season){
  //     res.status(400);
  //     throw new Error("Season not exists");
  //   }
  //   await season.remove();
  //   res.status(200).json({id : req.params.id });
  res.status(200).json({ mesg: "test" });
});

module.exports = {
  createClub,
  getClubs,
  getAClub,
  findClubs,
  updateClub,
  deleteClub,
};
