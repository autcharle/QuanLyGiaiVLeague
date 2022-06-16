const asyncHandler = require("express-async-handler");

const Match = require("../models/matchModel");
const Player = require("../models/playerModel");
const Season = require("../models/seasonModel");
const Goal = require("../models/goalModel");
const Ranking = require("../models/rankingModel");
const mongoose = require("mongoose");

const { funcSeasonFind } = require("../services/seasonServices");
const { funcClubFind } = require("../services/clubServices");
const { funcPlayerFind} = require("../services/playerServices");

const populate_goal = [
  {
    $lookup: {
      from: "players",
      localField: "player",
      foreignField: "_id",
      as: "player",
    },
  },
  { $unwind: "$player" },
  { $addFields: { player: "$player._id", playername: "$player.name" } },

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

  {
    $lookup: {
      from: "seasons",
      localField: "season",
      foreignField: "_id",
      as: "season",
    },
  },
  { $unwind: "$season" },
  { $addFields: { season: "$season._id", seasonname: "$season.name" } }
]
// @desc: search goal
// @para :
// @return: goal list
const funcSearchGoal = asyncHandler(
  async (player, club, match, season, goal_minute, type) => {
    let conditions = [];
    let findPlayer = await funcPlayerFind(player)
    let findClub = await funcClubFind(club)
    let findSeason = await funcSeasonFind(season)

    if (findPlayer) conditions.push({ player: findPlayer._id });
    if (findClub) conditions.push({ club: findClub._id });
    if (mongoose.isValidObjectId(match)) conditions.push({ match: new mongoose.Types.ObjectId(match) });
    if (findSeason) conditions.push({ season: findSeason._id });
    if (Number(goal_minute)) {
      goal_minute = Number.parseInt(goal_minute);
      conditions.push({ goal_minute: goal_minute });
    }
    if (type) {
      conditions.push({ type: type });
    }
    // if (conditions.length <= 0) {
    //   return { error: "Empty field or invalid field" };
    //   // return await  await Match.find()
    // }
    let agg = [...populate_goal];
    if (conditions.length == 0) {
      // return await funcGetPlayers();
      return [];
    } else if (conditions.length == 1) {
      agg.unshift({ $match: conditions[0] });
    } else {
      agg.unshift({ $match: { $and: conditions } });
    }
   
    // const goals = await Goal.find({
    //   $and: conditions,
    // });
    const goals = await Goal.aggregate(agg)

    return goals;
  }
);
// @desc: search goal
// @para :
// @return: goal list

const funcCreateAGoal = asyncHandler(
  async (player, match, goal_minute, type) => {
    let findPlayer = await funcPlayerFind(player)
    if (
      !player ||
      !mongoose.isValidObjectId(match) ||
      !Number(goal_minute) ||
      !type
    ) {
      return { error: "Missing or Invalid input" };
    }
    player = new mongoose.Types.ObjectId(findPlayer._id)
    // check exist
    const existedMatch = await Match.findById(match);
    if (!existedMatch) return { error: "Match not existed" };

    // //check date
    // const current = new Date()
    // const on = Date.parse(existedMatch.on_date)
    // if (current.getTime() !=  on.getTime()){
    //   return { message: "can only create on date" };
    // }

    // const existedPlayer = await Player.findById(player);
    // if (!existedPlayer) return { error: "Player not existed" };
    // check valid

    const rule = await Season.findById(existedMatch.season);
    const age =new Date().getFullYear() - new Date(findPlayer.dob).getFullYear();

    if (
      age > rule.max_age ||
      age < rule.min_age ||
      (findPlayer.club.toString() != existedMatch.home_club.toString() &&
      findPlayer.club.toString() != existedMatch.away_club.toString())
    )
      return { error: "Invalid player" };
    goal_minute = Number.parseInt(goal_minute);
    if (goal_minute > rule.play_duration || goal_minute < 0) {
      return { error: "Invalid goal_minute" };
    }

    if (!rule.goal_type.includes(type)) {
      return { error: "Invalid type" };
    }

    let existedGoal = await funcSearchGoal(
      undefined,
      undefined,
      match,
      undefined,
      goal_minute,
      undefined
    );
    // existedGoal = existedGoal.filter((g) => {
    //   return g._id != match;
    // });
    console.log(existedGoal)

    if (existedGoal.length > 0) {
      return { error: "existed goal" ,existedGoal};
    }
    // create
    const goal = await Goal.create({
      player: player,
      club: findPlayer.club,
      match: match,
      season: existedMatch.season,
      goal_minute: goal_minute,
      type: type,
    });

    // add point to match
    const result = await funcCalculateMatchPoint(
      new mongoose.Types.ObjectId(match)
    );
    let agg = [...populate_goal];
    agg.unshift({$match:{_id:goal._id}})
    const g = await Goal.aggregate(agg)
    return { message: "new goal",goal: g[0]};
  }
);
// @desc: update a goal
// @para :
// @return: goal list

const funcUpdateAGoal = asyncHandler(async (id,player=undefined,match=undefined, goal_minute, type) => {
  if ( !Number(goal_minute) || !type) {
    return { error: "Missing or Invalid input" };
  }
  // check exists
  let goal = undefined;
  let findPlayer = await funcPlayerFind(player);
  let findMatch = await funcClubFind(match);

  if (mongoose.isValidObjectId(id)) {
    goal = await Goal.findById(new mongoose.Types.ObjectId(id));
  }
  if (!goal) {
    if (!findPlayer || !findMatch) {
      throw new Error("Missing or Invalid input");
      return { error: "Missing or Invalid input" };
    }
    goal = await Goal.findOne({
      player: findPlayer._id,
      match: findMatch._id,
    });
  }
  // const goal = await Goal.findById(id);
  if (!goal) {
    return { error: "goal not exist" };
  }

  // //check date
  // const match = await Match.findById(goal.match)
  // const current = new Date()
  // const on = Date.parse(match.on_date)
  // if (current.getTime() !=  on.getTime()){
  //   return { message: "can only update on date" };
  // }
  const rule = await Season.findById(goal.season);

  if (goal_minute > rule.play_duration || goal_minute < 0) {
    return { error: "Invalid goal_minute" };
  }
  if (!rule.goal_type.includes(type)) {
    return { error: "Invalid type" };
  }

  let existedGoal = await funcSearchGoal(
    goal.player,
    undefined,
    goal.match,
    undefined,
    goal_minute,
    undefined
  );
  existedGoal = existedGoal.filter((g) => {
    return g._id.toString() != goal._id.toString();
  });
  if (existedGoal.length > 0) {
    return { error: "existed goal" };
  }

  const UpdateItem = await Goal.findByIdAndUpdate(
    id,
    {
      goal_minute: goal_minute,
      type: type,
    },
    {
      new: true,
    }
  );
  let agg = [...populate_goal];
  agg.unshift({$match:{_id:UpdateItem._id}})
  const g = await Goal.aggregate(agg)
  return { message: "updated", goal: g[0] };
});
// @desc: delete a goal
// @para :
// @return: goal list
const funcDeleteAGoal = asyncHandler(async (id) => {
  const goal = await Goal.findById(id);

  if (!goal) return { message: "Goal not exists" };
  // //check date
  // const start = await Match.findById(goal.match)
  // const current = new Date()
  // const on = Date.parse(start.on_date)
  // if (current.getTime() !=  on.getTime()){
  //   return { message: "can only delete on date" };
  // }
  const match = goal.match;
  await goal.remove();
  const result = await funcCalculateMatchPoint(
    new mongoose.Types.ObjectId(match)
  );
  return { id: id };
});

// @desc: search goal
// @para :
// @return: goal list
const funcSumGoalOfAPlayer = asyncHandler(async (player, season) => {
  if (!mongoose.isValidObjectId(player) || !mongoose.isValidObjectId(season)) {
    return { error: "Missing or Invalid input" };
  }
  const goals = await Goal.aggregate([
    {
      $match: {
        $and: [
          { player: new mongoose.Types.ObjectId(player) },
          { season: new mongoose.Types.ObjectId(season) },
        ],
      },
    },
    { $group: { _id: "$player", count: { $sum: 1 } } },
  ]);
  return JSON.parse(JSON.stringify(goals));
});
// @desc: search goal
// @para :
// @return: goal list
const funcSumGoalOfPlayers = asyncHandler(async (season) => {
  if (!mongoose.isValidObjectId(season)) {
    return { error: "Missing or Invalid input" };
  }
  const goals = await Goal.aggregate([
    {
      $match: {
        season: new mongoose.Types.ObjectId(season),
      },
    },
    {
      $group: { _id: "$player", count: { $sum: 1 } },
    },
    { $sort: { count: -1 } },
    {
      $lookup: {
        from: "players",
        localField: "_id",
        foreignField: "_id",
        as: "player",
      },
    },
    { $unwind: "$player" },
    {
      $lookup: {
        from: "clubs",
        localField: "player.club",
        foreignField: "_id",
        as: "club",
      },
    },
    { $unwind: "$club" },
    {
      $project: {
        _id: 0,
        // "id": "$player._id",
        name: "$player.name",
        club: "$club._id",
        type: "$player.type",
        goals: "$count",
      },
    },
  ]);
  return JSON.parse(JSON.stringify(goals));
});
// calc Ranking GoalDiffence
const funcCalcRankingGoalDiffence = asyncHandler(async (id, season) => {
  // cal
  let goaldiff = await Match.aggregate([
    {
      $facet: {
        home_club: [
          { $match: { home_club: id } },
          {
            $group: {
              _id: "$home_club",
              self: { $sum: "$home_point" },
              other: { $sum: "$away_point" },
            },
          },
          {
            $project: {
              goaldiff: { $subtract: ["$self", "$other"] },
            },
          },
        ],
        away_club: [
          { $match: { away_club: id } },
          {
            $group: {
              _id: "$away_club",
              self: { $sum: "$away_point" },
              other: { $sum: "$home_point" },
            },
          },
          {
            $project: {
              goaldiff: { $subtract: ["$self", "$other"] },
            },
          },
        ],
      },
    },
    {
      $project: {
        home_club: {
          $cond: [
            { $eq: [{ $size: "$home_club" }, 0] },
            { $literal: [{ home_club: 0 }] },
            "$home_club",
          ],
        },
        away_club: {
          $cond: [
            { $eq: [{ $size: "$away_club" }, 0] },
            { $literal: [{ away_club: 0 }] },
            "$away_club",
          ],
        },
      },
    },
    {
      $project: {
        diff: {
          $sum: [
            { $arrayElemAt: ["$home_club.goaldiff", 0] },
            { $arrayElemAt: ["$away_club.goaldiff", 0] },
          ],
        },
      },
    },
  ]);
  return goaldiff[0].diff;
});
// calc win,lose,draw of a club
const funcCalcMatchResults = asyncHandler(async (id, season) => {
  // cal
  let club = await Match.aggregate([
    {
      $facet: {
        win: [{ $match: { win_club: id } }, { $count: "win" }],
        draw: [{ $match: { win_club: null } }, { $count: "draw" }],
        lose: [{ $match: { lose_club: id } }, { $count: "lose" }],
      },
    },
    {
      $project: {
        win: {
          $cond: [
            { $eq: [{ $size: "$win" }, 0] },
            { $literal: [{ win: 0 }] },
            "$win",
          ],
        },
        draw: {
          $cond: [
            { $eq: [{ $size: "$draw" }, 0] },
            { $literal: [{ draw: 0 }] },
            "$draw",
          ],
        },
        lose: {
          $cond: [
            { $eq: [{ $size: "$lose" }, 0] },
            { $literal: [{ lose: 0 }] },
            "$lose",
          ],
        },
      },
    },
    {
      $project: {
        win: { $arrayElemAt: ["$win.win", 0] },
        draw: { $arrayElemAt: ["$draw.draw", 0] },
        lose: { $arrayElemAt: ["$lose.lose", 0] },
      },
    },
  ]);
  club = club[0];
  season = new mongoose.Types.ObjectId(season);
  const s = await Season.findById(season);
  const point =
    club.win * s.win_point +
    club.draw * s.draw_point +
    club.lose * s.lose_point;
  let goal_difference = await funcCalcRankingGoalDiffence(id, season);
  // update
  const rank = await Ranking.findOne({
    club: new mongoose.Types.ObjectId(id),
    season: season,
  });
  const newRank = await Ranking.findByIdAndUpdate(
    rank._id,
    {
      win: club.win,
      draw: club.draw,
      lose: club.lose,
      point: point,
      goal_difference: goal_difference,
    },
    {
      new: true,
    }
  );
  return newRank;
});
// calc when update
const funcCalculateMatchPoint = asyncHandler(async (match) => {
  if (!mongoose.isValidObjectId(match)) {
    return { error: "Missing or Invalid input" };
  }
  const curMatch = await Match.findById(match);
  if (!curMatch) {
    return { error: "not existed match" };
  }
  // calc point
  const score = await Goal.aggregate([
    {
      $match: {
        match: new mongoose.Types.ObjectId(match),
      },
    },
    {
      $group: { _id: "$club", count: { $sum: 1 } },
    },
    {
      $project: {
        _id: 0,
        club: "$_id",
        score: "$count",
      },
    },
  ]);
  let homePoint = 0;
  let awayPoint = 0;
  let win = null;
  let lose = null;

  if (score.length == 2) {
    if (curMatch.home_club.toString() == score[0].club.toString()) {
      homePoint = score[0].score;
      awayPoint = score[1].score;
    } else {
      homePoint = score[1].score;
      awayPoint = score[0].score;
    }
  } else if (score.length == 1) {
    if (curMatch.home_club.toString() == score[0].club.toString()) {
      homePoint = score[0].score;
    } else {
      awayPoint = score[0].score;
    }
  }
  // update match
  if (homePoint > awayPoint) {
    win = new mongoose.Types.ObjectId(curMatch.home_club);
    lose = new mongoose.Types.ObjectId(curMatch.away_club);
  } else if (homePoint < awayPoint) {
    lose = new mongoose.Types.ObjectId(curMatch.home_club);
    win = new mongoose.Types.ObjectId(curMatch.away_club);
  }

  const updateMatch = await Match.findByIdAndUpdate(
    match,
    {
      home_point: homePoint,
      away_point: awayPoint,
      win_club: win,
      lose_club: lose,
    },
    {
      new: true,
    }
  );
  let rank1 = await funcCalcMatchResults(curMatch.home_club, curMatch.season);
  let rank2 = await funcCalcMatchResults(curMatch.away_club, curMatch.season);

  const rule = await Season.findById(curMatch.season);
  let order = {
    win: rule.win_rank,
    goal_difference: rule.goal_difference_rank,
    lose: rule.lose_rank,
    point: rule.point_rank,
    draw: rule.draw_rank,
  };
  order = Object.fromEntries(
    Object.entries(order).sort(([, a], [, b]) => a - b)
  );
  let sortvalue = {};
  let rank = 1;
  order = Object.keys(order).map((o) => {
    return (sortvalue[o] = -1);
  });
  const updaterank = await Ranking.find({ season: rule._id }).sort(sortvalue);
  for (let rank = 1; rank < updaterank.length + 1; rank++) {
    await Ranking.findByIdAndUpdate(
      updaterank[rank - 1]._id,
      { rank: rank },
      { new: true }
    );
  }

  return await Ranking.find();
});
module.exports = {
  funcSearchGoal,
  funcCreateAGoal,
  funcUpdateAGoal,
  funcDeleteAGoal,
  funcSumGoalOfAPlayer,
  funcSumGoalOfPlayers,

  funcCalculateMatchPoint,
  funcCalcRankingGoalDiffence,
};
