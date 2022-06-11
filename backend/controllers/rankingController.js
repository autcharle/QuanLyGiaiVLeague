const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const Ranking = require("../models/rankingModel");
const Season = require("../models/seasonModel");
const Club = require("../models/clubModel");
const Player = require("../models/playerModel");

// @desc    Create new ranking
// @route   POST /api/rankings/
// @access  Public
const createRanking = asyncHandler(async (req, res) => {
  // Check input
  const { club, season } = req.body;
  if (!club || !season) {
    res.status(400);
    throw new Error("Please add a text field");
  }

  // Check existence
  // Check existence
  const existedRankings = await Ranking.find({
    $and: [
      { club: new mongoose.Types.ObjectId(club) },
      { season: new mongoose.Types.ObjectId(season) },
    ],
  });
  if (existedRankings.length != 0) {
    // res.status(400);
    // throw new Error("Already created for this season");
    res.status(400).json({
      message: "club is already join this season",
      existedRankings,
    });
    return;
  }
  // Check valid:
  const validate = await ValidateClub(season, club);
  const isValid = validate.isValid;
  if (!isValid) {
    res.status(400);
    throw new Error("Club is not valid");
  }

  // create
  const ranking = await Ranking.create({
    club: club,
    season: season,
  });

  res.status(200).json({ ranking });
});

// @desc    Create new ranking of a season
// @route   POST /api/rankings/:seasonId
// @access  Public
const createRankingForASeason = asyncHandler(async (req, res) => {
  const club = req.body.club;
  const season = req.params.seasonId;

  // Check input
  if (!club) {
    res.status(400);
    throw new Error("Please add a text field a");
  }

  // Check existence
  const existedRankings = await Ranking.find({
    $and: [
      { club: new mongoose.Types.ObjectId(club) },
      { season: new mongoose.Types.ObjectId(season) },
    ],
  });
  if (existedRankings.length != 0) {
    // res.status(400);
    // throw new Error("Already created for this season");
    res.status(400).json({
      message: "club is already join this season",
      existedRankings,
    });
    return;
  }
  // Check valid:
  const validate = await ValidateClub(season, club);
  const isValid = validate.isValid;
  if (!isValid) {
    res.status(400);
    throw new Error("Club is not valid");
  }
  // Create
  const ranking = await Ranking.create({
    club: club,
    season: season,
  });

  res.status(200).json({ ranking });
});

// @desc    Get rankings of a season
// @route   GET /api/rankings/:seasonId
// @access  Public
const getRankingOfASeason = asyncHandler(async (req, res) => {
  const rankings = await Ranking.find({ season: req.params.seasonId }).sort('rank');
  res.status(200).json(rankings);
});

// @desc    find rankings
// @route   POST /api/rankings/search
// @access  Public
const findRankings = asyncHandler(async (req, res) => {
  const { club, season } = req.body;
  if (!club && !season) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  // Check existence
  const existedRankings = await Ranking.find({
    $or: [
      { club: new mongoose.Types.ObjectId(club) },
      { season: new mongoose.Types.ObjectId(season) },
    ],
  });
  res.status(200).json(existedRankings);
});

// @desc    Delete a ranking for a club of a seasons
// @route   DELETE /api/seasons:id
// @access  Public
const deleteAClubRanking = asyncHandler(async (req, res) => {
  const ranking = await Ranking.findById(req.params.id);
  if (!ranking) {
    res.status(400);
    throw new Error("Ranking not existed");
  }
  await ranking.remove();
  res.status(200).json({ id: req.params.id });
});
// ------------------------->> For register << //

// @desc    Get validate table of player that can join a specific season in a club
// @route   POST /api/rankings/register/:seasonId/:clubId"
// @access  Public
const getValidatePlayer = asyncHandler(async (req, res) => {
  const season = await Season.findById(req.params.seasonId);
  const clubs = await Club.findById(req.params.clubId);
  if (!season || !clubs) {
    res.status(400);
    throw new Error("Not existed season or clubs");
  }
  res
    .status(200)
    .json(await ValidatePlayerInClub(req.params.seasonId, req.params.clubId));
});

// @desc    Get validate table of club that can join a specific season
// @route   POST /api/seasons:id
// @access  Public
const getValidate = asyncHandler(async (req, res) => {
  const season = await Season.findById(req.params.seasonId);
  if (!season) {
    res.status(400);
    throw new Error("Not existed seasonpty ID");
  }
  res.status(200).json(await Validate(req.params.seasonId));
});

// ---- Helper Funciton {

// @desc    Create validate table of club that can join a precific season
// para:    Season Id
// return   json with club's (id, name), number of valid player and valid foreign player, valid and invalid players and isValid
const Validate = asyncHandler(async (seasonID) => {
  const season = await Season.findById(seasonID);
  const clubs = await Club.find();
  if (!season) {
    throw new Error("Empty Season ID");
  }
  let list = [];
  for (let i = 0; i < clubs.length; i++) {
    const item = await ValidateClub(seasonID, clubs[i]);
    /*
    //   c = clubs[i]
    //   let player = await ValidatePlayerInClub(seasonID, c._id);
    //   let valid = player.filter((p) => {
    //     return p.isValid === true;
    //   });
    //   let invalid = player.filter((p) => {
    //     return p.isValid === false;
    //   });
    //   let foreign = valid.filter((key) => key.type == "foreign").length;

    //   let InValidReason = [];
    //   if (invalid.length > 0) {
    //     InValidReason.push("Has invalid player");
    //   }
    //   if (
    //     valid.length < season.min_player ||
    //     valid.length > season.max_player
    //   ) {
    //     InValidReason.push("Invalid number of valid player");
    //   }
    //   if (
    //     foreign < season.min_foreign_player ||
    //     foreign > season.max_foreign_player
    //   ) {
    //     InValidReason.push("Invalid number of foreign player");
    //   }
    //   let isValid = InValidReason.length == 0 ? true : false;
    //   const item = {
    //     clubID: c._id,
    //     clubName: c.name,
    //     numberOfValidPlayer: valid.length,
    //     foreign,
    //     valid,
    //     invalid,
    //     isValid,
    //   };*/
    list.push(item);
  }
  return JSON.parse(JSON.stringify(list));
});

// @desc    Create validate table of player in a precific club and season
// para:    Season Id, clubID
// return   json list of player with model attr and add attr age,isValid
const ValidatePlayerInClub = asyncHandler(async (seasonID, clubID) => {
  const season = await Season.findById(seasonID);
  const players = await Player.aggregate([
    {
      $match: { club: new mongoose.Types.ObjectId(clubID) },
    },
    {
      $addFields: {
        age: {
          $dateDiff: { startDate: "$dob", endDate: "$$NOW", unit: "year" },
        },
      },
    },
    {
      $addFields: {
        isValid: {
          $cond: [
            {
              $and: [
                { $gte: ["$age", season.min_age] },
                { $lte: ["$age", season.max_age] },
              ],
            },
            true,
            false,
          ],
        },
      },
    },
  ]);
  return JSON.parse(JSON.stringify(players));
});
// @desc    Validate a club a specific club and season
// para:    Season Id, clubID
// return   josn : a club's (id, name), number of valid player and valid foreign player, valid and invalid players and isValid
const ValidateClub = asyncHandler(async (seasonID, clubID) => {
  const season = await Season.findById(seasonID);
  c = await Club.findById(clubID);
  let player = await ValidatePlayerInClub(seasonID, c._id);
  let valid = player.filter((p) => {
    return p.isValid === true;
  });
  let invalid = player.filter((p) => {
    return p.isValid === false;
  });
  let foreign = valid.filter((key) => key.type == "foreign").length;

  let InValidReason = [];
  if (valid.length < season.min_player || valid.length > season.max_player) {
    InValidReason.push("Invalid number of valid player");
  }
  if (
    foreign < season.min_foreign_player ||
    foreign > season.max_foreign_player
  ) {
    InValidReason.push("Invalid number of foreign player");
  }
  let isValid = InValidReason.length == 0 ? true : false;
  const item = {
    clubID: c._id,
    clubName: c.name,
    numberOfValidPlayer: valid.length,
    foreign,
    valid,
    invalid,
    isValid,
  };
  return item;
});
//  } end of Helper Funciton -----------------------------------------

module.exports = {
  createRanking,
  createRankingForASeason,

  getRankingOfASeason,
  findRankings,
  deleteAClubRanking,

  getValidate,
  getValidatePlayer,
  //   getValid,
  //   getInvalid,
};
