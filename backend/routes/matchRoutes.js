const express = require("express");
const router = express.Router();
const {
    createAMatch,
    getAMatch,
    searchMatches,
    updateAMatch,
    deleteAMatch,

    getGoals,
    createAGoal,
    updateAGoal,
    deleteAGoal,
} = require("../controllers/matchController");

// const { protect } = require("../middleware/authMiddleware");

router.route("/").post(createAMatch);
router.route("/search").post(searchMatches);
router.route("/:id").get(getAMatch).put(updateAMatch).delete(deleteAMatch);

// goals in match
router.route("/:id/goals/").get(getGoals).post(createAGoal);
router.route("/:id/goals/:goalId").put(updateAGoal).delete(deleteAGoal);
module.exports = router;