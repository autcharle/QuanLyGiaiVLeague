const asyncHandler = require("express-async-handler");

const Match = require("../models/matchModel");
const Ranking = require("../models/rankingModel");
const Season = require("../models/seasonModel");
const Club = require("../models/clubModel");
const mongoose = require("mongoose");
// @desc: search Match
// @para : season id , round, home_club id , away_club id , on_date
// @return: match list
const funcSearchMatch = asyncHandler(
  async (season, round, home_club, away_club, on_date) => {
    let conditions = [];
    if (mongoose.isValidObjectId(season)) conditions.push({ season: season });
    if (mongoose.isValidObjectId(home_club))
      conditions.push({ home_club: home_club });
    if (mongoose.isValidObjectId(away_club))
      conditions.push({ away_club: away_club });
    if (Number(round)) {
      round = Number.parseInt(round);
      conditions.push({ round: round });
    }
    on_date = new Date(on_date);
    if (on_date != "Invalid Date") {
      conditions.push({ on_date: on_date });
    }
    if (conditions.length <= 0) {
      return { error: "Empty field or invalid field" };
      // return await  await Match.find()
    }

    const matches = await Match.find({
      $and: conditions,
    });
    return matches;
  }
);

// @desc: Create a match
// @para : season id , round, home_club id , away_club id , on_date
// @return: new match or error message
const funcCreateMatch = asyncHandler(
  async (season, round, home_club, away_club, on_date) => {
    // check input
    if (
      !mongoose.isValidObjectId(season) ||
      !Number(round) ||
      !mongoose.isValidObjectId(home_club) ||
      !mongoose.isValidObjectId(away_club) ||
      new Date(on_date) == "Invalid Date"
    ) {
      return { error: "Missing or Invalid input" };
    }
    // check club in seasons
    const home = await Ranking.findOne({ season, club: home_club });
    if (!home) return { error: "Home club not in season" };
    const away = await Ranking.findOne({ season, club: away_club });
    if (!away) return { error: "Away club not in season" };

    // check exist
    const existedMatch = await funcSearchMatch(
      season,
      undefined,
      home_club,
      away_club,
      undefined
    );
    if (existedMatch.length > 0) {
      return { error: "Existed match in season",existedMatch };
    }
    round = Number.parseInt(round);
    on_date = new Date(on_date);
    const match = await Match.create({
      season:season,
      round:round,
      home_club:home_club,
      away_club:away_club,
      on_date:on_date,
    });
    return { message: "new match", match };
    // return match;
  }
);
// @desc: update a match
// @para : match id, season id , round, home_club id , away_club id , on_date
// @return: new match or error message
const funcUpdateAMatch = asyncHandler(
  async (id, season, round, home_club, away_club, on_date) => {
    if (
      !mongoose.isValidObjectId(id) &&
      ((season && !mongoose.isValidObjectId(season)) ||
        (home_club && !mongoose.isValidObjectId(home_club)) ||
        (away_club && !mongoose.isValidObjectId(away_club)) ||
        (round && !Number(round)) ||
        (on_date && new Date(on_date) == "Invalid Date"))
    ) {
      return { error: "Missing or Invalid input" };
    }
    // Get match and check exit
    const match = await Match.findById(id);
    if (!match) return { error: "Match not exists" };
    // Picking value
    const updateValue = {
      season: season ? season : match.season,
      round: round ? round : match.round,
      home_club: home_club ? home_club : match.home_club,
      away_club: away_club ? away_club : match.away_club,
      on_date: on_date ? on_date : match.on_date,
    };
    // Check exist match

    const existedMatch = (
      await funcSearchMatch(
        updateValue.season,
        undefined,
        updateValue.home_club,
        updateValue.away_club,
        undefined
      )
    ).filter((m) => {
      return m._id.toString() != id.toString();
    });

    if (existedMatch.length > 0) {
      return { error: "Existed match in season" };
    }
    // update
    const updatedItem = await Match.findByIdAndUpdate(id, updateValue, {
      new: true,
    });
    return { message: "updateMatch", match: updatedItem };
  }
);
// @desc: update a match
// @para : match id, season id , round, home_club id , away_club id , on_date
// @return: new match or error message
const funcDeleteAMatch = asyncHandler(async (id) => {
  const match = await Match.findById(id);
  if (!match) return { message: "Match not exists" };
  await match.remove();
  return { id: id };
});
const funcGetAMatch = asyncHandler(async (id) => {
  const match = await Match.findById(id);
  return match;
});
module.exports = {
  funcSearchMatch,
  funcCreateMatch,
  funcUpdateAMatch,
  funcDeleteAMatch,
  funcGetAMatch,
};
