const asyncHandler = require("express-async-handler");
const Club = require("../models/clubModel");
const mongoose = require("mongoose");

// @desc: search club
// @para : manager-userId, name of the stadium
// @return: list of clubs
const funcSearchExistClub = asyncHandler(async (userId, name, stadium) => {
  const clubs = await Club.find({
    $or: [
      { name: { $regex: ".*" + name + ".*" } },
      { user: { _id: new mongoose.Types.ObjectId(userId) } },
      { stadium: { $regex: ".*" + stadium + ".*" } },
    ],
  });
  return clubs;
});

// @desc: Create a club
// @para : manager-userId, name of the stadium
// @return: created club
const funcCreateAClub = asyncHandler(async (userId, name, stadium) => {
  const club = await Club.create({
    user: userId,
    name: name,
    stadium: stadium,
  });
  return club;
});

// @desc: Get all clubs
// @para : none
// @return: list of clubs
const funcGetAllClubs = asyncHandler(async (userId, name, stadium) => {
  const clubs = await Club.find();
  return clubs;
});

// @desc: Get a club by Id
// @para : club's id
// @return: object with club's model attr
const funcGetAClub = asyncHandler(async (id) => {
  const club = await Club.findById(id);
  return club;
});

// @desc: Update a club (search by Id)
// @para : club's id, update value (object with club's model attr)
// @return: updated club
const funcUpdateAClub = asyncHandler(async (id, value) => {
  const club = await Club.findByIdAndUpdate(id, value, {
    new: true,
  });
  return club;
});

// @desc: Delete a club (search by Id)
// @para : club's id
// @return: object result
const funcDeleteAClub = asyncHandler(async (id) => {
  const club = await Club.findById(id);
  if (!club) return { message: "Club not exists" };
  await club.remove();
  return { id: id };
});

// @desc: Delete a club (search by Id)
// @para : club's id
// @return: object result (if there is no para return all)
const SearchClub = asyncHandler(async (userId, name, stadium) => {
  let condition = [];
  if (userId) {
    {
      condition.push({
        user: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      });
    }
  }
  if (name) {
    {
      condition.push({
        name: {
          $regex: ".*" + name + ".*",
        },
      });
    }
  }
  if (stadium) {
    {
      condition.push({
        stadium: {
          $regex: ".*" + stadium + ".*",
        },
      });
    }
  }
  if (condition.length == 0) {
    return await Club.find();
  }
  const clubs = await Club.find({
    $and: condition,
  });
  return clubs;
});

module.exports = {
  funcSearchExistClub,
  funcCreateAClub,
  funcGetAllClubs,
  funcGetAClub,
  funcUpdateAClub,
  funcDeleteAClub,

  SearchClub,
};
