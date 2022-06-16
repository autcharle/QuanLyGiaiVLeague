const express = require("express");
const router = express.Router();
const {
  createPlayer,
  getPlayers,
  getAPlayer,
  findPlayers,
  updatePlayer,
  deletePlayer,
} = require("../controllers/playerController");

// const { protect } = require("../middleware/authMiddleware");

router.route("/").get(getPlayers).post(createPlayer).put(updatePlayer).delete(deletePlayer);

router.route("/:id").get(getAPlayer).put(updatePlayer).delete(deletePlayer);

router.route("/search").post(findPlayers)
module.exports = router;