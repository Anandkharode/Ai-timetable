const SavedTimetable = require("../models/SavedTimetable");

exports.createTimetable = async (req, res) => {
  try {
    const { title, entries, settings, description } = req.body;
    const newTimetable = new SavedTimetable({
      title,
      description: description || "Generated Timetable",
      entries,
      settings
    });
    await newTimetable.save();
    res.status(201).json(newTimetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSavedTimetables = async (req, res) => {
  try {
    const timetables = await SavedTimetable.find().sort({ createdAt: -1 });
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    await SavedTimetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Timetable deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await SavedTimetable.findById(req.params.id);
    if (!timetable) return res.status(404).json({ message: "Not found" });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
