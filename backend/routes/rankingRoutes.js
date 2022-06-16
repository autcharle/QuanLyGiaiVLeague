const express = require("express");
const router = express.Router();
const {
  createARanking,

  getRankingOfASeason,
  findRankings,
  deleteAClubRanking,

  getValidate,
  getValidatePlayer,

  getPlayerGoals,
} = require("../controllers/rankingController");

// const { protect } = require("../middleware/authMiddleware");
router.route("/").post(createARanking).delete(deleteAClubRanking)

router.route("/search").post(findRankings)
router.route("/:id").delete(deleteAClubRanking);
router.route("/seasons").post(getRankingOfASeason)
// Validate club that can join, result in isValid attribute of json  / danh sách đội bóng với thuộc tính  isValid
router.route("/register/validateclubs").post(getValidate);
router.route("/register/validateplayers").post(getValidatePlayer);

router.route("/register/:seasonId").post(getValidate);
router.route("/register/:seasonId/:clubId").post(getValidatePlayer);
// Player ranking
router.route("/:seasonId/players").get(getPlayerGoals)
module.exports = router;