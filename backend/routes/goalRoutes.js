const express = require("express");
const router = express.Router();
const {
  createAGoal,
  searchGoals,
  updateAGoal,
  deleteAGoal,
  test,
} = require("../controllers/goalController");

// const { protect } = require("../middleware/authMiddleware");

//// >>>> clubs
router.route("/").post(createAGoal);
router.route("/:id").put(updateAGoal).delete(deleteAGoal);
router.route("/search").post(searchGoals);
router.route("/test").post(test);
module.exports = router;
