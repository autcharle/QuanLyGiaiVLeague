const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const Ranking = require("../models/rankingModel");
const Season = require("../models/seasonModel");
const Club = require("../models/clubModel");
const Player = require("../models/playerModel");
const Match = require("../models/matchModel");
const { findOne } = require("../models/rankingModel");

const { funcSeasonFind } = require("../services/seasonServices");
const { funcClubFind } = require("../services/clubServices");
const populate_ranking = [
  {
    $lookup: {
      from: "seasons",
      localField: "season",
      foreignField: "_id",
      as: "season",
    },
  },
  { $unwind: "$season" },
  { $addFields: { season: "$season._id", seasonname: "$season.name" } },
  {
    $lookup: {
      from: "clubs",
      localField: "club",
      foreignField: "_id",
      as: "club",
    },
  },
  { $unwind: "$club" },
  { $addFields: { club: "$club._id", clubname: "$club.name" } },
  { $sort: { rank: 1 } },
];

// @desc    Create validate table of club that can join a precific season
// para:    Season Id
// return   json with club's (id, name), number of valid player and valid foreign player, valid and invalid players and isValid
const Validate = asyncHandler(async (seasonID) => {
  const findSeason = await funcSeasonFind(seasonID)
  // const season = await Season.findById(seasonID);
  const clubs= await Club.find();
  if (!findSeason) {
    throw new Error("Invalid input");
  }
  seasonID = findSeason._id
  let list = [];
  for (let i = 0; i < clubs.length; i++) {
    const item = await ValidateClub(seasonID, clubs[i]._id);
    list.push(item);
  }
  return JSON.parse(JSON.stringify(list));
});

// @desc    Create validate table of player in a precific club and season
// para:    Season Id, clubID
// return   json list of player with model attr and add attr age,isValid
const ValidatePlayerInClub = asyncHandler(async (seasonID, clubID) => {
  let season = await funcSeasonFind(seasonID)
  let club =  await funcClubFind(clubID)
  if (!season || !club){
    throw new Error("Invalid input")
    return {error:"Invalid input"}
  }
  clubID = club._id
  // const season = await Season.findById(seasonID);
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
  // const season = await Season.findById(seasonID);
  // c = await Club.findById(clubID);

  let season = await funcSeasonFind(seasonID)
  let c =  await funcClubFind(clubID)
  if (!season || !c){
    throw new Error("Invalid input")
    return {error:"Invalid input"}
  }
  let player = await ValidatePlayerInClub(season._id, c._id);

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
// @desc: check exist for ranking
// @para : ranking id and
// @return: true/fasle
const funcExistSeasonAndClub = asyncHandler(async (seasonId, clubId) => {
  // const season = await Season.findById(seasonId);
  // const clubs = await Club.findById(clubId);
  const season = await funcSeasonFind(seasonId);
  const clubs = await funcClubFind(clubId);
  if (!season || !clubs) {
    return false;
  }
  return true;
});

// @desc: check if ranking exists
// @para : ranking id and
// @return: ranking/ object result

const funcSearchRanking = asyncHandler(async (seasonId, clubId, rank) => {
  const season = await funcSeasonFind(seasonId);
  const club = await funcClubFind(clubId);

  let conditions = [];
  if (season) {
    conditions.push({ season: season._id });
  }
  if (club) {
    conditions.push({ club: club._id });
  }
  if (Number(rank)) {
    conditions.push({ rank: Number.parseInt(rank) });
  }

  let agg = [...populate_ranking];
  if (conditions.length == 0) {
    // return await funcGetPlayers();
    return [];
  } else if (conditions.length == 1) {
    agg.unshift({ $match: conditions[0] });
  } else {
    agg.unshift({ $match: { $and: conditions } });
  }
  const rankings = await Ranking.aggregate(agg);
  return rankings;

  // const ranks = Ranking.find({ $and: conditions }).sort("rank");
  // return ranks;
});

// @desc: delete a ranking exists
// @para : ranking id
// @return: ranking/ object result
const funcDeleteARanking = asyncHandler(async (id) => {
  if (!id) {
    return { error: "missing Ranking id" };
  }
  const ranking = await Ranking.findById(id);
  // check exist
  if (!ranking) return { message: "Ranking/Register not exists" };
  const existMatch = await Match.findOne({
    season: new mongoose.Types.ObjectId(ranking.season),
  });
  if (existMatch) {
    return { error: "Season has start" };
  }
  await ranking.remove();
  return { id: id };
});

// @desc: create a ranking/ register
// @para : ranking id and
// @return:  object result
const CreateARanking = asyncHandler(async (seasonId, clubId) => {
  const season = await funcSeasonFind(seasonId);
  const club = await funcClubFind(clubId);
  if (!season || !club) {
    return { error: "Not existed season or clubs" };
  }
  seasonId = new mongoose.Types.ObjectId(season._id)
  clubId = new mongoose.Types.ObjectId(club._id)
  // check exist
  const existMatch = await Match.findOne({
    season: new mongoose.Types.ObjectId(seasonId),
  });
  if (existMatch) {
    return { error: "Season has start" };
  }
  // const existsSC = await funcExistSeasonAndClub(seasonId, clubId);
  // if (!existsSC) {
  //   return { error: "Not existed season or clubs", existedRanking };
  // }
  const existedRanking = await funcSearchRanking(seasonId, clubId);
  if (existedRanking.length > 0) {
    return { error: "Existed ranking", existedRanking };
  }

  // Check valid:
  const validate = await ValidateClub(seasonId, clubId);
  const isValid = validate.isValid;
  if (!isValid) {
    return { error: "Club is not valid for the season" };
  }

  const ranking = await Ranking.create({
    season: seasonId,
    club: clubId,
  });

  return { message: "New register", ranking };
  // return ranking
});

// @desc:  Get validate table of player that can join a specific season in a club
// @para : seasonId, clubId
// @return:  object result
const GetValidatePlayer = asyncHandler(async (seasonId, clubId) => {
  // check input
  if (!seasonId && !clubId) {
    return { error: "Please fill text field " };
  }
  // if (
  //   !mongoose.isValidObjectId(seasonId) ||
  //   !mongoose.isValidObjectId(clubId)
  // ) {
  //   return { error: "Season and club need to be ObjectId" };
  // }

  // check exist
  const existsSC = await funcExistSeasonAndClub(seasonId, clubId);
  if (!existsSC) {
    return { error: "Not existed season or clubs", existedRanking };
  }
  const season = await funcSeasonFind(seasonId);
  const club = await funcClubFind(clubId);
  seasonId = season._id
  clubId = club._id

  const validate_data = await ValidatePlayerInClub(seasonId, clubId);

  return validate_data;
});

// @desc:  Get validate table of player that can join a specific season in a club
// @para : seasonId, clubId
// @return:  object result
const GetValidateClubWithPlayer = asyncHandler(async (seasonId) => {
  // check input
  if (!seasonId) {
    return { error: "Please fill text field " };
  }
  // if (!mongoose.isValidObjectId(seasonId)) {
  //   return { error: "Season and club need to be ObjectId" };
  // }
  // check exist
  // const season = await Season.findById(seasonId);
  const season = await funcSeasonFind(seasonId)
  if (!season) {
    throw new Error("Not existed season")
    return { error: "Not existed season" };
  }
  const validate_data = await Validate(season._id);

  return validate_data;
});

module.exports = {
  funcSearchRanking,
  CreateARanking,
  Validate,
  ValidatePlayerInClub,
  ValidateClub,
  funcDeleteARanking,
  GetValidatePlayer,
  GetValidateClubWithPlayer,
};
