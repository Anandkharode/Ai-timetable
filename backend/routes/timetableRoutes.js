const express = require("express");
const {
  createTimetable,
  getSavedTimetables,
  deleteTimetable,
  getTimetableById
} = require("../controllers/timetableController");

const router = express.Router();

router.post("/save", createTimetable);
router.get("/", getSavedTimetables);
router.get("/:id", getTimetableById);
router.delete("/:id", deleteTimetable);

module.exports = router;
