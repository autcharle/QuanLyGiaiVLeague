const asyncHandler = require("express-async-handler");

const Match = require("../models/matchModel");
const Ranking = require("../models/rankingModel");
const Season = require("../models/seasonModel");
const Club = require("../models/clubModel");
const mongoose = require("mongoose");

const { funcSeasonFind } = require("../services/seasonServices");
const { funcClubFind } = require("../services/clubServices");

const populate_match = [
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
      localField: "home_club",
      foreignField: "_id",
      as: "home_club",
    },
  },
  { $unwind: "$home_club" },
  { $addFields: { home_club: "$home_club._id", homename: "$home_club.name" } },

  {
    $lookup: {
      from: "clubs",
      localField: "away_club",
      foreignField: "_id",
      as: "away_club",
    },
  },
  { $unwind: "$away_club" },
  { $addFields: { away_club: "$away_club._id", awayname: "$away_club.name" } },
];

// @desc: search Match
// @para : season id , round, home_club id , away_club id , on_date
// @return: match list
const funcSearchMatch = asyncHandler(
  async (season, round, home_club, away_club, on_date) => {
    let conditions = [];

    let findSeason = await funcSeasonFind(season);
    if (findSeason) conditions.push({ season: findSeason._id });

    let findHome = await funcClubFind(home_club);
    if (findHome) conditions.push({ home_club: findHome._id });

    let findaway = await funcClubFind(away_club);
    if (findaway) conditions.push({ away_club: findaway._id });

    if (Number(round)) {
      round = Number.parseInt(round);
      conditions.push({ round: round });
    }

    on_date = new Date(on_date);
    if (on_date != "Invalid Date") {
      let start = new Date(on_date);
      let end = new Date(on_date);
      end.setDate(end.getDate() + 1);
      conditions.push({
        on_date: {
          $gte: start,
          $lt: end,
        },
      });
      // conditions.push({ on_date: on_date });
    }

    // if (conditions.length <= 0) {
    //   return { error: "Empty field or invalid field" };
    //   // return await  await Match.find()
    // }

    // const matches = await Match.find({
    //   $and: conditions,
    // });
    let agg = [...populate_match];
    if (conditions.length == 0) {
      // return await funcGetPlayers();
      return [];
    } else if (conditions.length == 1) {
      agg.unshift({ $match: conditions[0] });
    } else {
      agg.unshift({ $match: { $and: conditions } });
    }

    const matches = await Match.aggregate(agg);
    return matches;
  }
);

// @desc: Create a match
// @para : season id , round, home_club id , away_club id , on_date
// @return: new match or error message
const funcCreateMatch = asyncHandler(
  async (season, round, home_club, away_club, on_date) => {
    let findSeason = await funcSeasonFind(season);
    let findHome = await funcClubFind(home_club);
    let findaway = await funcClubFind(away_club);

    // check input
    if (
      !findSeason ||
      !Number(round) ||
      !findHome ||
      !findaway ||
      new Date(on_date) == "Invalid Date" ||
      findHome._id.toString() == findaway._id.toString()
    ) {
      return { error: "Missing or Invalid input" };
    }

    round = Number.parseInt(round);
    on_date = new Date(on_date);
    if (on_date <= findSeason.start_date) {
      return { error: "match date must greater than season start date" };
    }
    season = new mongoose.Types.ObjectId(findSeason._id);
    home_club = new mongoose.Types.ObjectId(findHome._id);
    away_club = new mongoose.Types.ObjectId(findaway._id);
    const register = await Ranking.find({
      season: season,
    });
    if (register.length % 2 != 0) {
      return { error: "Need even resgister" };
    }
    // check club in seasons
    const home = await Ranking.findOne({ season, club: home_club });
    if (!home) return { error: "Home club not in season" };
    const away = await Ranking.findOne({ season, club: away_club });
    if (!away) return { error: "Away club not in season" };
    // home_club = new mongoose.Types.ObjectId(home_club);
    // away_club = new mongoose.Types.ObjectId(away_club);
    // check exist
    // const existedMatch = await Match.find({
    //   $and: [
    //     { season: new mongoose.Types.ObjectId(season) },
    //     {
    //       $or: [
    //         {
    //           $and: [
    //             { round: round },
    //             { $or: [{ home_club: away_club }, { away_club: home_club }] },
    //           ],
    //         },
    //         {
    //           $and: [{ home_club: home_club }, { away_club: away_club }],
    //         },
    //       ],
    //     },
    //   ],
    // });
    let conditions = {
      $match: {
        $and: [
          { season: new mongoose.Types.ObjectId(season) },
          {
            $or: [
              {
                $and: [
                  { round: round },
                  { $or: [{ home_club: away_club }, { away_club: home_club }] },
                ],
              },
              {
                $and: [{ home_club: home_club }, { away_club: away_club }],
              },
            ],
          },
        ],
      },
    };
    let agg = [...populate_match];
    agg.unshift(conditions);
    const existedMatch = await Match.aggregate(agg);
    if (existedMatch.length > 0) {
      return { err: "match existed", existedMatch };
    }
    const match = await Match.create({
      season: season,
      round: round,
      home_club: home_club,
      away_club: away_club,
      on_date: on_date,
    });
    const answer = await funcSearchMatch(
      match.season,
      match.round,
      match.home_club,
      match.away_club,
      match.on_date
    );

    return { message: "new match", match: answer[0] };
    // return match;
  }
);
// @desc: update a match
// @para : match id, season id , round, home_club id , away_club id , on_date
// @return: new match or error message
const funcUpdateAMatch = asyncHandler(
  async (id, season, round, home_club, away_club, on_date) => {
    if (
      (round && !Number(round)) ||
      (on_date && new Date(on_date) == "Invalid Date")
    ) {
      throw new Error("Missing or Invalid input");
      return { error: "Missing or Invalid input" };
    }
    on_date = new Date(on_date);

    round = Number.parseInt(round);
    let match = undefined;
    let findSeason = await funcSeasonFind(season);
    let findHome = await funcClubFind(home_club);
    let findAway = await funcClubFind(away_club);

    if (mongoose.isValidObjectId(id)) {
      match = await Match.findById(new mongoose.Types.ObjectId(id));
    }
    if (!match) {
      if (!findSeason || !findHome || !findAway) {
        throw new Error("Missing or Invalid input");
        return { error: "Missing or Invalid input" };
      }
      match = await Match.findOne({
        season: findSeason._id,
        home_club: findHome._id,
        away_club: findAway._id,
      });
    }
    // Get match and check exit
    // const match = await Match.findById(id);
    if (!match) {
      throw new Error("Match not exists");
      return { error: "Match not exists" };
    }
    if (on_date <= findSeason.start_date) {
      return { error: "match date must greater than season start date" };
    }
    id = new mongoose.Types.ObjectId(match._id);
    const current = new Date();
    const on = Date.parse(match.on_date);
    if (current > on) {
      return { message: "Match has started" };
    }
    // Picking value
    const updateValue = {
      season: findSeason._id ? findSeason._id : match.season,
      round: round ? Number.parseInt(round) : match.round,
      home_club: findHome._id ? findHome._id : match.home_club,
      away_club: findAway._id ? findAway._id : match.away_club,
      on_date: on_date ? Date.parse(on_date) : match.on_date,
    };
    season = updateValue.season
    home_club = updateValue .home_club
    away_club = updateValue.away_club
    // check club in seasons
    const home = await Ranking.findOne({ season, club: home_club });
    if (!home) return { error: "Home club not in season" };
    const away = await Ranking.findOne({ season, club: away_club });
    if (!away) return { error: "Away club not in season" };

    // Check exist match

    let conditions = {
      $match: {
        $and: [
          { season: new mongoose.Types.ObjectId(season) },
          {
            $or: [
              {
                $and: [
                  { round: round },
                  { $or: [{ home_club: away_club }, { away_club: home_club }] },
                ],
              },
              {
                $and: [{ home_club: home_club }, { away_club: away_club }],
              },
            ],
          },
        ],
      },
    };
    let agg = [...populate_match];
    agg.unshift(conditions);
    let existedMatch = await Match.aggregate(agg);
    existedMatch = existedMatch.filter((m) => {
      return m._id.toString() != id.toString();
    });
    if (existedMatch.length > 0) {
      return { err: "match existed", existedMatch };
    }
    // update

    const updatedItem = await Match.findByIdAndUpdate(id, updateValue, {
      new: true,
    });

    const update = await funcGetAMatch(id);
    return { message: "updateMatch", match: update };
  }
);
// @desc: update a match
// @para : match id, season id , round, home_club id , away_club id , on_date
// @return: new match or error message
const funcDeleteAMatch = asyncHandler(
  async (id, season, home_club, away_club) => {
    let match = undefined;
    let findSeason = await funcSeasonFind(season);
    let findHome = await funcClubFind(home_club);
    let findAway = await funcClubFind(away_club);
    if (mongoose.isValidObjectId(id)) {
      match = await Match.findById(new mongoose.Types.ObjectId(id));
    }
    if (!match) {
      if (!findSeason || !findHome || !findAway) {
        throw new Error("Missing or Invalid input");
        return { error: "Missing or Invalid input" };
      }
      match = await Match.findOne({
        season: findSeason._id,
        home_club: findHome._id,
        away_club: findAway._id,
      });
    }

    // Get match and check exit
    // const match = await Match.findById(id);

    // const match = await Match.findById(id);
    if (!match) return { message: "Match not exists" };
    id = match.id
    const current = new Date();
    const on_date = Date.parse(match.on_date);
    if (current > on_date) {
      return { message: "Match has started" };
    }
    await match.remove();
    return { id: id };
  }
);
const funcGetAMatch = asyncHandler(async (id) => {
  // const match = await Match.findById(id);
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid input to search");
  }
  let agg = [...populate_match];
  agg.unshift({ $match: { _id: new mongoose.Types.ObjectId(id) } });
  const match = Match.aggregate(agg);
  return match;
});
module.exports = {
  funcSearchMatch,
  funcCreateMatch,
  funcUpdateAMatch,
  funcDeleteAMatch,
  funcGetAMatch,
};
