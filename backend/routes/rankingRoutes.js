const express = require("express");
const router = express.Router();
const {
  createRanking,
  getRankings,
  getARanking,
  findRankings,
  updateRanking,
  deleteRanking,

  getValidate,
  getValidatePlayer,
//   getValid,
//   getInvalid,
} = require("../controllers/rankingController");

// const { protect } = require("../middleware/authMiddleware");

router.route("/").get(getRankings).post(createRanking);

router.route("/:id").get(getARanking).put(updateRanking).delete(deleteRanking);

router.route("/search").post(findRankings)
// Validate club that can join, result in isValid attribute of json  / danh sách đội bóng với thuộc tính  isValid
router.route("/register/:id").post(getValidate);
router.route("/register/:seasonId/:clubId").post(getValidatePlayer);
// router.route("/register/valid").get(getValid);
// router.route("/register/invalid").get(getInvalid);
module.exports = router;