const express = require("express");
const {
  createTimetable,
  getTimetable,
} = require("../controllers/timetableController");

const router = express.Router();

router.post("/create", createTimetable);
router.get("/", getTimetable);

module.exports = router;
