const express = require("express");
const router = express.Router();
const {
  createARanking,

  getRankingOfASeason,
  findRankings,
  deleteAClubRanking,

  getValidate,
  getValidatePlayer,
//   getValid,
//   getInvalid,
} = require("../controllers/rankingController");

// const { protect } = require("../middleware/authMiddleware");
router.route("/").post(createARanking)
router.route("/search").post(findRankings)
router.route("/:id").delete(deleteAClubRanking);
router.route("/seasons").post(getRankingOfASeason)
// Validate club that can join, result in isValid attribute of json  / danh sách đội bóng với thuộc tính  isValid
router.route("/register/:seasonId").post(getValidate);
router.route("/register/:seasonId/:clubId").post(getValidatePlayer);
module.exports = router;