const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const Ranking = require("../models/rankingModel");
const Season = require("../models/seasonModel");
const Club = require("../models/clubModel");
const Player = require("../models/playerModel");

// @desc    Create new ranking
// @route   POST /api/rankings
// @access  Public
const createRanking = asyncHandler(async (req, res) => {
  const {club , season }  = req.body;
  if (!club || !season) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  const existedRankings = await Ranking.find({
  });
  console.log(existedRankings.length);
  if (existedRankings.length != 0) {
    // res.status(400);
    // throw new Error("Already created for this season");
    res.status(400).json({
      message: "manager or name or stadium existed in other ranking",
      existedRankings,
    });
    return;
  }
  const ranking = await Ranking.create({
    user: user,
    name: name,
    stadium: stadium,
  });

  res.status(200).json({ ranking });
});

// @desc    Get rankings
// @route   GET /api/rankings
// @access  Public
const getRankings = asyncHandler(async (req, res) => {
  const rankings = await Ranking.find();
  res.status(200).json(rankings);
});

// @desc    Get Rankings
// @route   GET /api/ranking/:id
// @access  Public
const getARanking = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400);
    throw new Error("missng id");
  }

  res.status(200).json(await Ranking.findById(req.params.id));
});
// @desc    find rankings
// @route   POST /api/rankings/search
// @access  Public
const findRankings = asyncHandler(async (req, res) => {
  const { user, name, stadium } = req.body;
  if (!user || !name || !stadium) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  const existedRankings = await Ranking.find({
    $or: [
      { name: { $regex: ".*" + name + ".*" } },
      { user: { _id: user } },
      { stadium: { $regex: ".*" + stadium + ".*" } },
    ],
  });
  res.status(200).json(existedRankings);
});
// << X >>
// @desc    Update ranking
// @route   PUT /api/seasons:id
// @access  Public
const updateRanking = asyncHandler(async (req, res) => {
  const ranking = await Ranking.findById(req.params.id);

  if (!ranking) {
    res.status(400);
    throw new Error("Ranking not existed");
  }

  const updateValue = {
    user: req.body.user || ranking.user,
    name: req.body.name || ranking.name,
    stadium: req.body.stadium || ranking.stadium,
  };
  const updatedItem = await Ranking.findByIdAndUpdate(
    req.params.id,
    updateValue,
    {
      new: true,
    }
  );
  res.status(200).json({ msg: "updateRanking", updatedItem });
});
// @desc    Delete season
// @route   DELETE /api/seasons:id
// @access  Public
const deleteRanking = asyncHandler(async (req, res) => {
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
  res
    .status(200)
    .json(await ValidatePlayerInClub(req.params.seasonId, req.params.clubId));
});

// @desc    Get validate table of club that can join a specific season
// @route   POST /api/seasons:id
// @access  Public
const getValidate = asyncHandler(async (req, res) => {
  res.status(200).json(await Validate(req.params.id));
});

// ---- Helper Funciton {

// @desc    Create validate table of club that can join a precific season
// para:    Season Id
// return   json with club's (id, name), number of valid player and valid foreign player, valid and invalid players and isValid
const Validate = asyncHandler(async (seasonID) => {
  const season = await Season.findById(seasonID);
  const clubs = await Club.find();
  let list = [];
  for(let i = 0; i < clubs.length;i++){
    const item = await ValidateClub(seasonID,clubs[i])
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
    c = await Club.findById(clubID)
    let player = await ValidatePlayerInClub(seasonID, c._id);
    let valid = player.filter((p) => {
      return p.isValid === true;
    });
    let invalid = player.filter((p) => {
      return p.isValid === false;
    });
    let foreign = valid.filter((key) => key.type == "foreign").length;

    let InValidReason = [];
    if (
      valid.length < season.min_player ||
      valid.length > season.max_player
    ) {
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
  getRankings,
  getARanking,
  findRankings,
  updateRanking,
  deleteRanking,

  getValidate,
  getValidatePlayer,
  //   getValid,
  //   getInvalid,
};
