const mongoose = require("mongoose");

const savedTimetableSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    department: String,
    groups: [{
        department: String,
        year: String,
        section: String,
        subjectCount: Number,
    }],
    summary: {
        requestedSessions: Number,
        scheduledSessions: Number,
        unscheduledSessions: Number,
        groupCount: Number,
    },
    unscheduled: [{
        department: String,
        year: String,
        section: String,
        subject: String,
        faculty: String,
        sessionType: String,
        reason: String,
    }],
    createdAt: { type: Date, default: Date.now },
    entries: [{
        department: String,
        year: String,
        section: String,
        subject: String,
        faculty: String,
        sessionType: String,
        room: String,
        day: String,
        slot: String,
    }],
    settings: {
        institutionName: String,
        academicYear: String,
        semester: String,
        workingDays: [String],
        startTime: String,
        slotDuration: Number,
        slotsPerDay: Number,
        breakAfterSlot: Number,
        breakDuration: Number,
    }
});

module.exports = mongoose.model("SavedTimetable", savedTimetableSchema);
