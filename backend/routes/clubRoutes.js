const express = require("express");
const router = express.Router();
const {
  createClub,
  getClubs,
  getAClub,
  findClubs,
  updateClub,
  deleteClub,
} = require("../controllers/clubController");

// const { protect } = require("../middleware/authMiddleware");

router.route("/").get(getClubs).post(createClub);

router.route("/:id").get(getAClub).put(updateClub).delete(deleteClub);

router.route("/search").post(findClubs)
module.exports = router;