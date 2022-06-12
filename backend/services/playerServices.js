const asyncHandler = require("express-async-handler");
const Player = require("../models/playerModel");
const mongoose = require("mongoose");

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
  const player = await Player.create(item);
  return player;
});

// @desc: Get all players
// @para : none
// @return: list of players
const funcGetPlayers = asyncHandler(async () => {
  const players = await Player.find();
  return players;
});

// @desc: Get a player by id
// @para : player's id
// @return: player
const funcGetAPlayer = asyncHandler(async (id) => {
  const players = await Player.findById(id);
  return players;
});

// @desc: Search player
// @para :  club, name, dob, type
// @return: player
const funcSearchPlayer = asyncHandler(async (club, name, dob, type) => {
  let conditions = [];
  if (club) {
    conditions.push({ club: new mongoose.Types.ObjectId(club) });
  }
  if (name) {
    conditions.push({ name: { $regex: ".*" + name + ".*" } });
  }
  if (dob) {
    conditions.push({ dob: dob });
  }
  if (type) {
    conditions.push({ type: type });
  }
  const players = await Player.find({
    $and: conditions,
  });
  return players;
});

// @desc: update a player (by id)
// @para :  player's id and object that contain player model attr
// @return: update player
const funcUpdateAPlayer = asyncHandler(async (id, value) => {
  const player = await Player.findByIdAndUpdate(id, value, {
    new: true,
  });
  return player;
});

// @desc: delete a player (by id)
// @para : player's id
// @return: object result
const funcDeleteAPlayer = asyncHandler(async (id) => {
  const player = await Player.findById(id);
  if (!player) return { message: "Player not exists" };
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
  if (club && !mongoose.isValidObjectId(club)) {
    return { error: "Club need to be id" };
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
  dob = Date.parse(dob)
  const updateValue = { club, name, dob, note, type };

  const existedValue = await funcSearchPlayer(
    undefined,
    updateValue.name,
    updateValue.dob,
    undefined,
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
};
