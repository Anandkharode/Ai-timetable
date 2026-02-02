const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  subject: String,
  faculty: String,
  room: String,
  day: String,
  slot: String,
});

module.exports = mongoose.model("Timetable", timetableSchema);
