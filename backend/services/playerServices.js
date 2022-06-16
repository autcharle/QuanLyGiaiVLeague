const asyncHandler = require("express-async-handler");
const Player = require("../models/playerModel");
const mongoose = require("mongoose");
const { funcClubFind } = require("../services/clubServices");

const populate_club = [
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
];

const funcPlayerFind = asyncHandler(async (id) => {
  if (!id) return undefined;
  let byid = undefined;
  let byname = undefined;
  if (!mongoose.isValidObjectId(id) && typeof id != "string")
    throw new Error("Invalid input for search");
  if (mongoose.isValidObjectId(id)) {
    newid = new mongoose.Types.ObjectId(id);
    byid = await Player.findById(newid);
  }
  if (typeof id == "string") {
    byname = await Player.findOne({ name: { $regex: id, $options: "i" } });
  }
  if (byid) return byid;
  if (byname) return byname;
  return undefined;
});

// @desc: check if player exists
// @para : name,dob of the player
// @return: lists of players
const funcFindPlayerExists = asyncHandler(async (name, dob) => {
  const existedPlayers = await Player.find({
    $and: [{ name: { $regex: ".*" + name + ".*" } }, { dob: dob }],
  });
  return existedPlayers;
});

// @desc: create a player
// @para : object conatain player attr
// @return: created player
const funcCreateAPlayer = asyncHandler(async (item) => {
  const newplayer = await Player.create(item);
  let agg = [...populate_club];
  agg.unshift({$match:{_id:newplayer._id}})
  const player = await Player.aggregate(agg);
  return player;
});

// @desc: Get all players
// @para : none
// @return: list of players
const funcGetPlayers = asyncHandler(async () => {
  // const players = await Player.find();
  const players = await Player.aggregate(populate_club);
  return players;
});

// @desc: Get a player by id
// @para : player's id
// @return: player
const funcGetAPlayer = asyncHandler(async (id) => {
  // const player = await Player.findById(id);
  let find = await funcPlayerFind(id)
  if (!find){
    return null
  }
  let agg = [...populate_club];
  agg.unshift({$match:{_id:find._id}})
  const player = await Player.aggregate(agg);
  return player[0];
});

// @desc: Search player
// @para :  club, name, dob, type
// @return: player
const funcSearchPlayer = asyncHandler(async (club, name, dob, type) => {
  let conditions = [];
  if (club) {
    let find = await funcClubFind(club);
    if (find) conditions.push({ club: find._id });
  }
  if (name) {
    conditions.push({ name: { $regex: ".*" + name + ".*" } });
  }
  if (dob && new Date(dob) != "Invalid Date") {
    let start = new Date(dob);
    let end = new Date(dob);
    end.setDate(end.getDate() + 1);
    conditions.push({
      dob: {
        $gte: start,
        $lt: end,
      },
    });
  }
  if (type) {
    conditions.push({ type: type });
  }
  // const players = await Player.find({
  //   $and: conditions,
  // });
  let agg = [...populate_club];
  if (conditions.length == 0) {
    // return await funcGetPlayers();
    return [];
  } else if (conditions.length == 1) {
    agg.unshift({ $match: conditions[0] });
  } else {
    agg.unshift({ $match: { $and: conditions } });
  }
  const players = await Player.aggregate(agg);
  return players;
});

// @desc: update a player (by id)
// @para :  player's id and object that contain player model attr
// @return: update player
const funcUpdateAPlayer = asyncHandler(async (id, value) => {
  const find = await funcPlayerFind(id)
  if (!find){
    return {error:"player not exists"}
  }
  const update = await Player.findByIdAndUpdate(find._id, value, {
    new: true,
  });
  let agg = [...populate_club];
  agg.unshift({$match:{_id:find._id}})
  const player = await Player.aggregate(agg);
  return player;
});

// @desc: delete a player (by id)
// @para : player's id
// @return: object result
const funcDeleteAPlayer = asyncHandler(async (id) => {
  const player = await funcPlayerFind(id)
  if (!player) return { message: "Player not exists" };
  id = player._id
  await player.remove();
  return { id: id };
});

// @desc:  Create new player
// @para : club (id), name, dob, note, type ([native,foreign])
// @return: object result
const AddPlayer = asyncHandler(async (club, name, dob, note, type) => {
  // Check input
  if (!club || !name || !dob || !type) {
    return { error: "Empty field, Please add a text field" };
  }

  // Check exists
  if (
    (type != "native" &&
    type != "foreign") ||
    new Date(dob) == "Invalid Date"
  ) {
    return { error: "Invalid input" };
  }
  let find = await funcClubFind(club);
  if (!find) {
    return {
      error: "club not existed",
    };
  }
  club = new mongoose.Types.ObjectId(find._id);

  const existedPlayers = await funcFindPlayerExists(name, dob);
  if (existedPlayers.length != 0) {
    return {
      error: "player existed in other club",
      existedPlayers,
    };
  }
  // create item
  const item = {
    club: club,
    name: name,
    dob: Date.parse(dob),
    note: note,
    type: type,
  };
  const player = await funcCreateAPlayer(item);
  return player;
});

// @desc:  Search player
// @para : club (id), name, dob, type ([native,foreign])
// @return: object result
const SearchPlayer = asyncHandler(async (club, name, dob, type) => {
  // Check input
  if (!club && !name && !dob && !type) {
    return { error: "Empty field, Please add a text field" };
  }
  // if (club && !mongoose.isValidObjectId(club)) {
  //   return { error: "Club need to be id" };
  // }
  let find = await funcClubFind(club);
  club = undefined;
  if (find) {
    club = new mongoose.Types.ObjectId(find._id);
  }

  const players = await funcSearchPlayer(club, name, dob, type);
  return players;
});

// @desc:  Update player
// @para : player id,club (id), name, dob, type ([native,foreign])
// @return: object result
const UpdateAPlayer = asyncHandler(async (id, club, name, note, dob, type) => {
  // check exist
  const player = await funcGetAPlayer(id);
  if (!player) {
    return { error: "Player not existed" };
  }
  // check input
  if (!club) {
    club = player.club;
  }
  if (!name) {
    name = player.name;
  }
  if (!dob) {
    dob = player.dob;
  }
  if (!note) {
    note = player.note;
  }
  if (!type) {
    type = player.type;
  }
  dob = Date.parse(dob);
  const updateValue = { club, name, dob, note, type };

  const existedValue = await funcSearchPlayer(
    undefined,
    updateValue.name,
    updateValue.dob,
    undefined
  );
  const existed = existedValue.filter((i) => {
    return player._id.toString() != i._id.toString();
  });
  if (existed.length > 0) {
    return { error: "value existed (name or dob)" };
  }

  const players = await funcUpdateAPlayer(id, updateValue);
  return players;
});

module.exports = {
  funcFindPlayerExists,
  funcCreateAPlayer,
  funcGetPlayers,
  funcGetAPlayer,
  funcSearchPlayer,
  funcUpdateAPlayer,
  funcDeleteAPlayer,

  AddPlayer,
  SearchPlayer,
  UpdateAPlayer,
  funcPlayerFind,
};
