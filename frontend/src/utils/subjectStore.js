const STORAGE_KEY = "ai_timetable_subjects";

function normalizeSubjectRecord(subject) {
  const batches = Array.isArray(subject?.batches)
    ? subject.batches
        .map((batch) => String(batch || "").trim())
        .filter(Boolean)
    : [];

  return {
    id: subject?.id || "",
    name: String(subject?.name || "").trim(),
    year: String(subject?.year || "").trim(),
    faculty: String(subject?.faculty || "").trim(),
    department: String(subject?.department || "").trim(),
    sessionType: String(subject?.sessionType || "Lecture").trim() || "Lecture",
    batches,
  };
}

function getSubjectKey(subject) {
  const normalized = normalizeSubjectRecord(subject);
  return [
    normalized.name.toLowerCase(),
    normalized.year.toLowerCase(),
    normalized.faculty.toLowerCase(),
    normalized.department.toLowerCase(),
    normalized.sessionType.toLowerCase(),
    normalized.batches.join("|").toLowerCase(),
  ].join("__");
}

export function getSavedSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeSubjectRecord) : [];
  } catch {
    return [];
  }
}

export function saveSubjects(subjects) {
  const normalized = Array.isArray(subjects) ? subjects.map(normalizeSubjectRecord) : [];
  const deduped = [];
  const seen = new Set();

  normalized.forEach((subject) => {
    if (!subject.name || !subject.faculty) return;
    const key = getSubjectKey(subject);
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push({
      ...subject,
      id: subject.id || key,
    });
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
  return deduped;
}

export function mergeSavedSubjects(subjects) {
  const merged = [...getSavedSubjects(), ...(Array.isArray(subjects) ? subjects : [])];
  return saveSubjects(merged);
}
