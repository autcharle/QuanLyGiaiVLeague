const express = require("express");
const router = express.Router();
const {
  createClub,
  getClubs,
  getAClub,
  findClubs,
  updateClub,
  deleteClub,

  getPlayersInClub,
  addAPlayerToClub,
  getAPlayerInClub,
  updateAPlayerInClub,
  deleteAPlayerInClub,
  searchAPlayerInClub,
} = require("../controllers/clubController");


// const { protect } = require("../middleware/authMiddleware");

//// >>>> clubs
router.route("/").get(getClubs).post(createClub);
router.route("/:id").get(getAClub).put(updateClub).delete(deleteClub);
router.route("/search").post(findClubs)
//// >>>> player in clubs
router.route("/:id/players").get(getPlayersInClub).post(addAPlayerToClub)
router.route("/:id/players/:playerId").get(getAPlayerInClub).put(updateAPlayerInClub).delete(deleteAPlayerInClub)
router.route("/:id/players/search").post(searchAPlayerInClub)

module.exports = router;