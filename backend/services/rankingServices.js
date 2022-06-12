const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const Ranking = require("../models/rankingModel");
const Season = require("../models/seasonModel");
const Club = require("../models/clubModel");
const Player = require("../models/playerModel");

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
// @desc: check exist for ranking
// @para : ranking id and
// @return: true/fasle
const funcExistSeasonAndClub = asyncHandler(async (seasonId, clubId) => {
    const season = await Season.findById(seasonId);
    const clubs = await Club.findById(clubId);
    if (!season || !clubs) {
      return false
    }
    return true
});

// @desc: check if ranking exists
// @para : ranking id and
// @return: ranking/ object result

const funcSearchRanking = asyncHandler(async (seasonId, clubId) => {
  if (
    !mongoose.isValidObjectId(seasonId) &&
    !mongoose.isValidObjectId(clubId)
  ) {
    return { error: "Season and club need to be ObjectId" };
  }
  let conditions = [];
  if (seasonId) {
    conditions.push({ season: seasonId });
  }
  if (clubId) {
    conditions.push({ club: clubId });
  }
  const ranks = Ranking.find({ $and: conditions }).sort('rank');
  return ranks;
});

// @desc: delete a ranking exists
// @para : ranking id 
// @return: ranking/ object result
const funcDeleteARanking = asyncHandler(async (id) => {
    if (!id){return {error:"missing Ranking id"}}
    const ranking = await Ranking.findById(id);
    if (!ranking)
        return {message: 'Ranking/Register not exists'}
    await ranking.remove();
    return { id: id }
  });

// @desc: create a ranking/ register
// @para : ranking id and
// @return:  object result
const CreateARanking = asyncHandler(async (seasonId, clubId) => {
  // check input
  if (
    !mongoose.isValidObjectId(seasonId) ||
    !mongoose.isValidObjectId(clubId)
  ) {
    return { error: "Season and club need to be ObjectId" };
  }
  
  // check exist
  const existsSC = await funcExistSeasonAndClub(seasonId, clubId)
  if (!existsSC){
    return {error: "Not existed season or clubs", existedRanking};
  }
  const existedRanking = await funcSearchRanking(seasonId, clubId);
  if (existedRanking.length > 0) {
      return {error: "Existed ranking", existedRanking};
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
  return { message: "New register" ,ranking }
});

// @desc:  Get validate table of player that can join a specific season in a club
// @para : seasonId, clubId
// @return:  object result
const GetValidatePlayer = asyncHandler(async (seasonId, clubId) => {
    // check input
    if (!seasonId && !clubId) {
      return { error: "Please fill text field " };
    }
    if (
      !mongoose.isValidObjectId(seasonId) ||
      !mongoose.isValidObjectId(clubId)
    ) {
      return { error: "Season and club need to be ObjectId" };
    }
    // check exist
    const existsSC = await funcExistSeasonAndClub(seasonId, clubId)
    if (!existsSC){
      return {error: "Not existed season or clubs", existedRanking};
    }
    
    const validate_data = await ValidatePlayerInClub(seasonId, clubId)

    return validate_data
  });

// @desc:  Get validate table of player that can join a specific season in a club
// @para : seasonId, clubId
// @return:  object result
const GetValidateClubWithPlayer = asyncHandler(async (seasonId) => {
    // check input
    if (!seasonId) {
      return { error: "Please fill text field " };
    }
    if (
      !mongoose.isValidObjectId(seasonId)
    ) {
      return { error: "Season and club need to be ObjectId" };
    }
    // check exist
    const season = await Season.findById(seasonId);
    if (!season) {
        return { error: "Not existed season" };
    }
    
    const validate_data = await Validate(seasonId)

    return validate_data
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
