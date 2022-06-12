const express = require("express");
const router = express.Router();
const {
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

} = require("../controllers/seasonController");
// const { protect } = require("../middleware/authMiddleware");

//// >>>> seasons
router.route("/").get(getSeason).post(createSeason);
router.route("/:id").get(getASeason).put(updateSeason).delete(deleteSeason);
router.route("/search").post(findSeason)

//// >>>> register to seasons
// Validate club that can join, result in isValid attribute of json  / danh sách đội bóng có thể tham dự mùa giải với thuộc tính isValid
router.route("/:id/registers/validate").get(getValidateClubs);
router.route("/:id/registers/validate/valid").get(getValidClubs);
// Validate player in club that can join, result in isValid attribute of json  / danh sách cầu thủ  có thể tham dự mùa giải trong đội bóng với thuộc tính isValid
router.route("/:id/registers/validate/:clubId").get(getValidatePlayerInClub);
// resgister and get list of resgister
// Delete resgister
router.route("/:id/registers/:clubId").get(registerClub).delete(deleteRegisterClub)
// Get ranking
router.route("/:id/rankings").get(getRankings)
router.route("/:id/registers").get(getRankings)
module.exports = router;
