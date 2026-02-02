const Timetable = require("../models/Timetable");

exports.createTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.insertMany(req.body);
    res.status(201).json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find();
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
