const express = require("express");
const router = express.Router();
const {
    createAMatch,
    getAMatch,
    searchMatches,
    updateAMatch,
    deleteAMatch,
} = require("../controllers/matchController");

// const { protect } = require("../middleware/authMiddleware");

router.route("/").post(createAMatch);
router.route("/search").post(searchMatches);
router.route("/:id").get(getAMatch).put(updateAMatch).delete(deleteAMatch);

module.exports = router;