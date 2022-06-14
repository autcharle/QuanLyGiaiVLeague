const asyncHandler = require("express-async-handler");

const Match = require("../models/matchModel");
const Player = require("../models/playerModel");
const Season = require("../models/seasonModel");
const Goal = require("../models/goalModel");
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
    let GoalClub = null;
    let point = 0;
    if (existedPlayer.club.toString() == existedMatch.home_club.toString()) {
      point = existedMatch.home_point + 1;
      GoalClub = await Match.findByIdAndUpdate(
        match,
        {
          home_point: point,
        },
        {
          new: true,
        }
      );
    } else {
      point = existedMatch.away_point + 1;
      GoalClub = await Match.findByIdAndUpdate(
        match,
        {
          home_point: point,
        },
        {
          new: true,
        }
      );
    }
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
  return {message:'updated',goal:UpdateItem};
});
// @desc: delete a goal
// @para :
// @return: goal list
const funcDeleteAGoal = asyncHandler(async (id) => {
  const goal = await Goal.findById(id);
  if (!goal) return { message: "Match not exists" };
  await goal.remove();
  const match = await Match.findById(goal.match);
  let GoalClub = null;
  let point = 0;
  if (goal.club.toString() == match.home_club.toString()) {
    point = match.home_point - 1 < 0 ? 0 : match.home_point - 1 ;
    GoalClub = await Match.findByIdAndUpdate(
      match,
      {
        home_point: point,
      },
      {
        new: true,
      }
    );
  } else {
    point = match.away_point - 1 < 0 ? 0 : match.away_point - 1;
    GoalClub = await Match.findByIdAndUpdate(
      match,
      {
        home_point: point,
      },
      {
        new: true,
      }
    );
  }
  return { id: id };
});

// @desc: search goal
// @para :
// @return: goal list
const funcSumGoalOfAPlayer = asyncHandler(async (player, season) => {
  if (!mongoose.isValidObjectId(player)) {
    return { error: "Missing or Invalid input" };
  }
  const goals = await Goal.aggregate([
    {
      $match: {
        $and: [{ player: player }, { season: season }],
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
  const goals = await Goal.aggregate([
    {
      $match: {
        season: season,
      },
    },
    { $group: { _id: "$player", count: { $sum: 1 } } },
  ]);
  return JSON.parse(JSON.stringify(goals));
});

module.exports = {
  funcSearchGoal,
  funcCreateAGoal,
  funcUpdateAGoal,
  funcDeleteAGoal,
  funcSumGoalOfAPlayer,
  funcSumGoalOfPlayers,
};
