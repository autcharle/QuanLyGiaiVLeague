const asyncHandler = require("express-async-handler");
const Season = require("../models/seasonModel");

// @desc: check if season exists
// @para : name of the season
// @return: lists of seasons
const funcFindSeasonExists = asyncHandler(async (name) => {
  const seasons = await Season.find({ name: name });
  return seasons;
});

// @desc: create a new season
// @para : attr of season model
// @return: created season
const funcCreateASeason = asyncHandler(async (item) => {
  const season = await Season.create(item);
  return season;
});

// @desc: get all seasons in database
// @para : none
// @return: lists of seasons
const funcGetAllSeasons = asyncHandler(async () => {
  return await Season.find();
});

// @desc: get a season by id
// @para : id of the season
// @return: season
const funcGetASeason = asyncHandler(async (id) => {
  return await Season.findById(id);
});

// @desc: search a season (similer is enough, use or for attr)
// @para : name of the season
// @return: list of seasons
const funcSearchSeasons = asyncHandler(async (name) => {
  return await Season.find({
    name: { $regex: ".*" + name + ".*" },
  });
});

// @desc: update a season 
// @para : season's id and update value
// @return: updated season
const funcUpdateASeason = asyncHandler(async (id, value) => {
  const updated = await Season.findByIdAndUpdate(id, value, {
    new: true,
  });
  return updated;
});

// @desc: delete a season 
// @para : season's id 
// @return: object result
const funcDeleteASeason = asyncHandler(async (id) => {
    const season = await Season.findById(id);
    if (!season)
        return {message: 'Season not exists'}
    await season.remove();
    return { id: id }
  });
  
module.exports = {
  funcFindSeasonExists,
  funcCreateASeason,
  funcGetAllSeasons,
  funcGetASeason,
  funcSearchSeasons,
  funcUpdateASeason,
  funcDeleteASeason,
};
