const asyncHandler = require("express-async-handler");

const Match = require("../models/matchModel");
const Player = require("../models/playerModel");
const Season = require("../models/seasonModel");
const Goal = require("../models/goalModel");
const Ranking = require("../models/rankingModel");
const mongoose = require("mongoose");

// @desc: search goal
// @para :
// @return: goal list
const funcSearchGoal = asyncHandler(
  async (player, club, match, season, goal_minute, type) => {
    let conditions = [];
    if (mongoose.isValidObjectId(player)) conditions.push({ player: player });
    if (mongoose.isValidObjectId(club)) conditions.push({ club: club });
    if (mongoose.isValidObjectId(match)) conditions.push({ match: match });
    if (mongoose.isValidObjectId(season)) conditions.push({ season: season });
    if (Number(goal_minute)) {
      goal_minute = Number.parseInt(goal_minute);
      conditions.push({ goal_minute: goal_minute });
    }
    if (type) {
      conditions.push({ type: type });
    }
    if (conditions.length <= 0) {
      return { error: "Empty field or invalid field" };
      // return await  await Match.find()
    }

    const goals = await Goal.find({
      $and: conditions,
    });
    return goals;
  }
);
// @desc: search goal
// @para :
// @return: goal list

const funcCreateAGoal = asyncHandler(
  async (player, match, goal_minute, type) => {
    if (
      !mongoose.isValidObjectId(player) ||
      !mongoose.isValidObjectId(match) ||
      !Number(goal_minute) ||
      !type
    ) {
      return { error: "Missing or Invalid input" };
    }

    // check exist
    const existedMatch = await Match.findById(match);
    if (!existedMatch) return { error: "Match not existed" };
    const existedPlayer = await Player.findById(player);
    if (!existedPlayer) return { error: "Player not existed" };
    // check valid

    const rule = await Season.findById(existedMatch.season);
    const age =
      new Date().getFullYear() - new Date(existedPlayer.dob).getFullYear();

    if (
      age > rule.max_age ||
      age < rule.min_age ||
      (existedPlayer.club.toString() != existedMatch.home_club.toString() &&
        existedPlayer.club.toString() != existedMatch.away_club.toString())
    )
      return { error: "Invalid player" };
    goal_minute = Number.parseInt(goal_minute);
    if (goal_minute > rule.play_duration) {
      return { error: "Invalid goal_minute" };
    }
    if (goal_minute > rule.play_duration) {
      return { error: "Invalid goal_minute" };
    }

    if (!rule.goal_type.includes(type)) {
      return { error: "Invalid type" };
    }

    let existedGoal = await funcSearchGoal(
      player,
      undefined,
      match,
      undefined,
      goal_minute,
      undefined
    );
    // existedGoal = existedGoal.filter((g) => {
    //   return g._id != match;
    // });
    if (existedGoal.length > 0) {
      return { error: "existed goal" };
    }
    // create
    const goal = await Goal.create({
      player: player,
      club: existedPlayer.club,
      match: match,
      season: existedMatch.season,
      goal_minute: goal_minute,
      type: type,
    });

    // add point to match
    const result = await funcCalculateMatchPoint(
      new mongoose.Types.ObjectId(match)
    );
    return goal;
  }
);
// @desc: update a goal
// @para :
// @return: goal list

const funcUpdateAGoal = asyncHandler(async (id, goal_minute, type) => {
  if (!mongoose.isValidObjectId(id) || !Number(goal_minute) || !type) {
    return { error: "Missing or Invalid input" };
  }
  // check exists
  const goal = await Goal.findById(id);
  if (!goal) {
    return { error: "goal not exist" };
  }

  const rule = await Season.findById(goal.season);

  if (goal_minute > rule.play_duration) {
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
  return { message: "updated", goal: UpdateItem };
});
// @desc: delete a goal
// @para :
// @return: goal list
const funcDeleteAGoal = asyncHandler(async (id) => {
  const goal = await Goal.findById(id);

  if (!goal) return { message: "Goal not exists" };
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
  if (!curMatch){
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

  if (score.length == 2)
  {
    if (curMatch.home_club.toString() == score[0].club.toString()) {
      homePoint = score[0].score;
      awayPoint = score[1].score;
    } else {
      homePoint = score[1].score;
      awayPoint = score[0].score;
    }
  } else if (score.length == 1){
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
