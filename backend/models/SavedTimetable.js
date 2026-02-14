const mongoose = require("mongoose");

const savedTimetableSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    createdAt: { type: Date, default: Date.now },
    entries: [{
        subject: String,
        faculty: String,
        room: String,
        day: String,
        slot: String,
    }],
    settings: {
        institutionName: String,
        academicYear: String,
        semester: String,
        startTime: String,
        slotDuration: Number,
        slotsPerDay: Number,
        breakAfterSlot: Number,
        breakDuration: Number,
    }
});

module.exports = mongoose.model("SavedTimetable", savedTimetableSchema);
