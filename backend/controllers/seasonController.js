const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const {
  funcFindSeasonExists,
  funcCreateASeason,
  funcGetAllSeasons,
  funcGetASeason,
  funcSearchSeasons,
  funcUpdateASeason,
  funcDeleteASeason,
  funcSeasonFind,
} = require("../services/seasonServices");

const {
  funcSearchRanking,
  CreateARanking,
  funcDeleteARanking,
  GetValidatePlayer,
  GetValidateClubWithPlayer,
} = require('../services/rankingServices')

const {
  funcSearchMatch,
  funcCreateMatch,
  funcUpdateAMatch,
  funcDeleteAMatch,
  funcGetAMatch,
  
} = require("../services/matchServices");

// ------ @desc    Create new season
// @route   POST /api/season
// @access  Public
const createSeason = asyncHandler(async (req, res) => {
  // if (!req.body) {
  //   res.status(400);
  //   throw new Error("Please add a text field");
  // }

  const name = req.body.name
    ? req.body.name
    : "Vleague " + new Date().getFullYear().toString();
  const seasonExist = await funcFindSeasonExists(name);
  if (seasonExist.length > 0) {
    res
      .status(400)
      .json({ error: "Already created for this season", seasonExist });
    return;
  }
  const item = {
    name: name,

    min_player:
      typeof req.body.min_player !== "undefined" ? req.body.min_player : 15,

    max_player:
      typeof req.body.max_player !== "undefined" ? req.body.max_player : 22,

    min_foreign_player:
      typeof req.body.min_foreign_player !== "undefined"
        ? req.body.min_foreign_player
        : 0,

    max_foreign_player:
      typeof req.body.max_foreign_player !== "undefined"
        ? req.body.max_foreign_player
        : 3,

    min_age: typeof req.body.min_age !== "undefined" ? req.body.min_age : 16,

    max_age: typeof req.body.max_age !== "undefined" ? req.body.max_age : 40,

    play_duration:
      typeof req.body.play_duration !== "undefined"
        ? req.body.play_duration
        : 96,

    start_date: req.body.start_date ? Date.parse(req.body.start_date) : null,

    end_date: req.body.end_date ? Date.parse(req.body.end_date) : null,

    win_point:
      typeof req.body.win_point !== "undefined" ? req.body.win_point : 3,

    draw_point:
      typeof req.body.draw_point !== "undefined" ? req.body.draw_point : 1,

    lose_point:
      typeof req.body.lose_point !== "undefined" ? req.body.lose_point : 0,

    goal_difference_rank: req.body.goal_difference_rank
      ? req.body.goal_difference_rank
      : 1,

    point_rank:
      typeof req.body.point_rank !== "undefined" ? req.body.point_rank : 2,

    win_rank: typeof req.body.win_rank !== "undefined" ? req.body.win_rank : 3,

    draw_rank:
      typeof req.body.draw_rank !== "undefined" ? req.body.draw_rank : 4,

    lose_rank:
      typeof req.body.lose_rank !== "undefined" ? req.body.lose_rank : 5,

    goal_type:
      Array.isArray(req.body.goal_type) && req.body.goal_type.length != 0
        ? req.body.goal_type
        : ["A", "B", "C"],
  };
  // const season = await Season.create();
  const season = await funcCreateASeason(item);
  res.status(200).json(season);
});

// @desc    Get seasons
// @route   GET /api/seasons
// @access  Public
const getSeason = asyncHandler(async (req, res) => {
  const seasons = await funcGetAllSeasons();
  res.status(200).json(seasons);
});

// @desc    Get seasons
// @route   GET /api/seasons/:id
// @access  Public
const getASeason = asyncHandler(async (req, res) => {
  res.status(200).json(await funcGetASeason(req.params.id));
});

// @desc    find seasons
// @route   POST /api/seasons/search
// @access  Public
const findSeason = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    res.status(400);
    throw new Error("Please enter name field");
  }
  const seasons = await funcSearchSeasons(req.body.name);
  res.status(200).json(seasons);
});

// @desc    Update season
// @route   PUT /api/seasons/:id | /api/seasons/
// @access  Public
const updateSeason = asyncHandler(async (req, res) => {
  const seasonname = req.body.id ? req.body.id : req.body.name
  let id = req.params.id ? req.params.id : seasonname
  if (!id)
  {
    res.status(400).json({ error: "missing input"});
    throw new Error("missing input")
  }
  // check exists
  const season = await funcSeasonFind(id);
  if (!season) {
    res.status(400);
    throw new Error("Season not exists");
  }
  id = season._id
  // get input
  const updateValue = {
    name: req.body.name ? req.body.name : season.name,

    min_player:
      typeof req.body.min_player !== "undefined"
        ? req.body.min_player
        : season.min_player,

    max_player:
      typeof req.body.max_player !== "undefined"
        ? req.body.max_player
        : season.max_player,

    min_foreign_player:
      typeof req.body.min_foreign_player !== "undefined"
        ? req.body.min_foreign_player
        : season.min_foreign_player,

    max_foreign_player:
      typeof req.body.max_foreign_player !== "undefined"
        ? req.body.max_foreign_player
        : season.max_foreign_player,

    min_age:
      typeof req.body.min_age !== "undefined"
        ? req.body.min_age
        : season.age.min_age,

    max_age:
      typeof req.body.max_age !== "undefined"
        ? req.body.max_age
        : season.age.max_age,

    play_duration:
      typeof req.body.play_duration !== "undefined"
        ? req.body.play_duration
        : season.play_duration,

    start_date: req.body.start_date
      ? Date.parse(req.body.start_date)
      : season.start_date,

    end_date: req.body.end_date
      ? Date.parse(req.body.end_date)
      : season.end_date,

    win_point:
      typeof req.body.win_point !== "undefined"
        ? req.body.win_point
        : season.win_point,

    draw_point:
      typeof req.body.draw_point !== "undefined"
        ? req.body.draw_point
        : season.draw_point,

    lose_point:
      typeof req.body.lose_point !== "undefined"
        ? req.body.lose_point
        : season.lose_point,

    goal_difference_rank:
      typeof req.body.goal_difference_rank !== "undefined"
        ? req.body.goal_difference_rank
        : season.goal_difference_rank,

    point_rank:
      typeof req.body.point_rank !== "undefined"
        ? req.body.point_rank
        : season.point_rank,

    win_rank:
      typeof req.body.win_rank !== "undefined"
        ? req.body.win_rank
        : season.win_rank,

    draw_rank:
      typeof req.body.draw_rank !== "undefined"
        ? req.body.draw_rank
        : season.draw_rank,

    lose_rank:
      typeof req.body.lose_rank !== "undefined"
        ? req.body.lose_rank
        : season.lose_rank,

    goal_type:
      Array.isArray(req.body.goal_type) && req.body.goal_type.length != 0
        ? req.body.goal_type
        : season.goal_type,
  };
  // check input value
  const existedValue = await funcSearchSeasons(updateValue.name);
  const existed = existedValue.filter((i) => {
    return season._id.toString() != i._id.toString();
  });
  if (existed.length > 0) {
    res.status(400).json({ error: "name existed",existed})
    return;
}
  // update
  const updatedSeason = await funcUpdateASeason(id, updateValue);
  res.status(200).json({ message: "updateSeason", season:updatedSeason });
});
// @desc    Delete season
// @route   DELETE /api/seasons/:id | /api/seasons
// @access  Public
const deleteSeason = asyncHandler(async (req, res) => {
  const seasonname = req.body.id ? req.body.id : req.body.name
  const id = req.params.id ? req.params.id : seasonname
  if (!id)
  {
    res.status(400).json({ error: "missing input", existed });
    throw new Error("missing input")
  }
  const result = await funcDeleteASeason(id);
  res.status(200).json(result);
});

//// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ranking {
// @desc    get Valid club that can join, result in isValid attribute of json 
// @route   GET /api/seasons/:id/register/validate/valid
// @access  Private
const getValidClubs = asyncHandler(async (req, res) => {
  const season = req.params.id
  let result = await GetValidateClubWithPlayer(season)
  if (result.error) {
    res.status(400);
    // throw new Error(result.error)
  } else {
    res.status(200);
    result = result.filter((r)=>{return r.isValid == true})
  }
  res.json(result);
});

// @desc    get Validate club table that can join, result in isValid attribute of json 
// @route   GET /api/seasons/:id/register/validate/
// @access  Private
const getValidateClubs = asyncHandler(async (req, res) => {
  const season = req.params.id
  const result = await GetValidateClubWithPlayer(season)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
// @desc    Validate player in club that can join, result in isValid attribute of json 
// @route   GET /api/seasons/:id/register/validate/:clubId
// @access  Private
const getValidatePlayerInClub = asyncHandler(async (req, res) => {
  const season = req.params.id;
  const club = req.params.clubId;

  const result = await GetValidatePlayer(season,club)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
// @desc    resgister club
// @route   GET /api/seasons/:id/register
// @access  Private
const registerClub = asyncHandler(async (req, res) => {
  const season = req.params.id;
  const club = req.params.clubId;
  const result = await CreateARanking(season,club)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
// @desc    delete a  register
// @route   DELETE /api/seasons/:id/register/:clubId
// @access  Private
const deleteRegisterClub = asyncHandler(async (req, res) => {
  const season = req.params.id;
  const club = req.params.clubId;
  const ranking = await funcSearchRanking(season,club,undefined)
  
  if (ranking.length <= 0){
    res.json({error:"Register not existed"})
    return;
  }
  const rankingId = ranking[0]._id
  const result = await funcDeleteARanking(rankingId)
  if (result.error) {
    res.status(200);
    // throw new Error(result.error)
  } else {
    res.status(200);
  }
  res.json(result);

});
// @desc    get registers, ranking
// @route   Get /api/seasons/:id/register
// @access  Private
const getRankings = asyncHandler(async (req, res) => {
  const season = req.params.id;
  const result = await funcSearchRanking(season,undefined,undefined)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
//// } ranking <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

//// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> match {
// @desc    search matches
// @route   GET /api/seasons/:id/matches/
// @access  Private
const searchMatches = asyncHandler(async (req, res) => {
  const season = req.params.id;
  const { round, home_club, away_club, on_date } = req.body;
  const result = await funcSearchMatch(season, round, home_club, away_club, on_date )

  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});
// @desc    create a matche
// @route   POST /api/seasons/:id/matches/
// @access  Private
const createAMatch = asyncHandler(async (req, res) => {
  const season = req.params.id;
  const { round, home_club, away_club, on_date } = req.body;
  const result = await funcCreateMatch(
    season,
    round,
    home_club,
    away_club,
    on_date
  );

  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});

// @desc    delete a match
// @route   DELETE /api/seasons/:id/matches/:matchId
// @access  Private
const deleteAMatch = asyncHandler(async (req, res) => {
  const id = req.params.matchId ? req.params.matchId : req.body.match ;
  const {season,home_club,away_club} = req.body
  const result = await funcDeleteAMatch(id,season,home_club,away_club)
  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});

// @desc    update a match
// @route   PUT /api/seasons/:id/matches/:matchId
// @access  Private
const updateAMatch = asyncHandler(async (req, res) => {
  const id = req.params.matchId ? req.params.matchId :  req.body.match;
  const { round, home_club, away_club, on_date } = req.body;
  const result = await funcUpdateAMatch(
    id,
    undefined,
    round,
    home_club,
    away_club,
    on_date
  );

  if (result.error) {
    res.status(400).json(result);
    throw new Error(result.error)
  }
  res.status(200).json(result);
});

//// } match <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
module.exports = {
  createSeason,
  getSeason,
  getASeason,
  findSeason,
  updateSeason,
  deleteSeason,

  getValidClubs,
  getValidateClubs,
  getValidatePlayerInClub,
  registerClub,
  deleteRegisterClub,
  getRankings,

  searchMatches,
  createAMatch,
  deleteAMatch,
  updateAMatch  
};
