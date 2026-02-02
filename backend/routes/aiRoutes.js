const express = require("express");
const Timetable = require("../models/Timetable");

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    console.log("Frontend payload received:", req.body);
    const response = await fetch("http://127.0.0.1:5001/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),

    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Python error:", text);
      return res.status(500).json({ error: "Python AI failed" });
    }

    const timetable = await response.json();

    await Timetable.deleteMany();
    await Timetable.insertMany(timetable);

    res.json({ message: "Timetable generated", timetable });
  } catch (err) {
    console.error("NODE ERROR:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

module.exports = router;
