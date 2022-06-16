const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const funcUserFind = asyncHandler(async (id) => {
  if (!id) return undefined;
  let byid = undefined;
  let byname = undefined;
  if (!mongoose.isValidObjectId(id) && typeof id != "string")
    throw new Error("Invalid input for search");
  if (mongoose.isValidObjectId(id)) {
    newid = new mongoose.Types.ObjectId(id);
    byid = await User.findById(newid);
  }
  if (typeof id == "string") {
    byname = await User.findOne({ name: { $regex: id, $options: "i" } });
  }
  if (byid) return byid;
  if (byname) return byname;
  return undefined;
});

module.exports = {
  funcUserFind,
};
