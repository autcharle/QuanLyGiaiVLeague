const asyncHandler = require("express-async-handler");
const Club = require("../models/clubModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const { type } = require("express/lib/response");
const { funcUserFind } = require("../services/userServices");

const populate_user = [
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    },
  },
  { $unwind: "$user" },
  { $addFields: { user: "$user._id", username: "$user.name" } },
];

const funcClubFind = asyncHandler(async (id) => {
  if (!id) return undefined;
  let byid = undefined;
  let byname = undefined;
  if (!mongoose.isValidObjectId(id) && typeof id != "string")
    throw new Error("Invalid input for search");
  if (mongoose.isValidObjectId(id)) {
    newid = new mongoose.Types.ObjectId(id);
    byid = await Club.findById(newid);
  }
  if (typeof id == "string") {
    byname = await Club.findOne({ name: { $regex: id, $options: "i" } });
  }
  if (byid) return byid;
  if (byname) return byname;
  return undefined;
});

// @desc: search club
// @para : manager-userId, name of the stadium
// @return: list of clubs
const funcSearchExistClub = asyncHandler(async (userId, name, stadium) => {
  let id = await funcUserFind(userId);
  let conditions = [
    { name: { $regex: ".*" + name + ".*" } },
    { stadium: { $regex: ".*" + stadium + ".*" } },
  ];
  if (id) {
    conditions.push({ user: { _id: id._id } });
  }
  let agg = [...populate_user];
  agg.unshift({ $match: { $or: conditions } });
  const clubs = await Club.aggregate(agg);
  return clubs;
});

// @desc: Create a club
// @para : manager-userId, name of the stadium
// @return: created club
const funcCreateAClub = asyncHandler(async (userId, name, stadium) => {
  let id = await funcUserFind(userId);
  if (!id) {
    throw Error("InValid input");
  }
  userId = id._id;
  const club = await Club.create({
    user: userId,
    name: name,
    stadium: stadium,
  });

  let agg = [...populate_user];
  agg.unshift({ $match: { _id: club._id } });
  const result = await Club.aggregate(agg);
  return result;
});

// @desc: Get all clubs
// @para : none
// @return: list of clubs
const funcGetAllClubs = asyncHandler(async () => {
  // const clubs = await Club.aggregate([
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "user",
  //       foreignField: "_id",
  //       as: "user",
  //     },
  //   },
  //   { $unwind: "$user" },
  //   { $addFields: { user: "$user._id", username: "$user.name" } },
  // ]);
  const clubs = await Club.aggregate(populate_user);
  return clubs;
});

// @desc: Get a club by Id
// @para : club's id
// @return: object with club's model attr
const funcGetAClub = asyncHandler(async (id) => {
  const find = await funcClubFind(id);
  if (!find) {
    throw new Error("club not exist");
    return { error: "club not exist" };
  }
  let result = [...populate_user];
  result.unshift({ $match: { _id: find._id } });
  const club = await Club.aggregate(result);

  // const club = await Club.findById(id)
  // const club = await Club.aggregate([
  //   {
  //     $match: { _id: new mongoose.Types.ObjectId(id) },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "user",
  //       foreignField: "_id",
  //       as: "user",
  //     },
  //   },
  //   { $unwind: "$user" },
  //   { $addFields: { user: "$user._id", username: "$user.name" } },
  // ]);

  return club[0];
});

// @desc: Update a club (search by Id)
// @para : club's id, update value (object with club's model attr)
// @return: updated club
const funcUpdateAClub = asyncHandler(async (id, value) => {
  const find = await funcClubFind(id);
  if (!find) {
    throw new Error("Club not exist");
  }

  const club = await Club.findByIdAndUpdate(find._id, value, {
    new: true,
  });
  let result = [...populate_user];
  result.unshift({ $match: { _id: club._id } });
  return await Club.aggregate(result);
});

// @desc: Delete a club (search by Id)
// @para : club's id
// @return: object result
const funcDeleteAClub = asyncHandler(async (id) => {
  const club = await funcClubFind(id);
  if (!club) return { message: "Club not exists" };
  id = club._id;
  await club.remove();
  return { id: id };
});

// @desc: seach clubs (search by Id)
// @para : club's id
// @return: object result (if there is no para return all)
const SearchClub = asyncHandler(async (userId, name, stadium) => {
  let condition = [];
  let find = await funcUserFind(userId);
  userId = undefined;
  if (find) {
    userId = find._id;
  }
  if (userId) {
    {
      condition.push({
        user: new mongoose.Types.ObjectId(userId),
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
  let agg = [...populate_user];
  if (condition.length == 0) {
    // return await funcGetAllClubs();
    return [];
  } else if (condition.length == 1) {
    agg.unshift({ $match: condition[0] });
  } else {
    agg.unshift({ $match: { $and: condition } });
  }
  const clubs = await Club.aggregate(agg);
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
  funcClubFind,
};
