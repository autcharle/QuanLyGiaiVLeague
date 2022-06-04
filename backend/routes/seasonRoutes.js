const express = require("express");
const router = express.Router();
const {
  createSeason,
  getSeason,
  getASeason,
  findSeason,
  updateSeason,
  deleteSeason,
} = require("../controllers/seasonController");

// const { protect } = require("../middleware/authMiddleware");

router.route("/").get(getSeason).post(createSeason);

router.route("/:id").get(getASeason).put(updateSeason).delete(deleteSeason);

router.route("/search").post(findSeason)
module.exports = router;
