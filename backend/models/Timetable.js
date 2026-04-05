const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  department: String,
  year: String,
  section: String,
  subject: String,
  faculty: String,
  sessionType: String,
  batches: [String],
  room: String,
  day: String,
  slot: String,
});

module.exports = mongoose.model("Timetable", timetableSchema);
