export function generateTimeSlots(settings) {
    const { startTime, slotDuration, slotsPerDay, breakAfterSlot, breakDuration } = settings;
    const slots = [];

    let [hours, minutes] = startTime.split(':').map(Number);
    let currentTime = hours * 60 + minutes;

    for (let i = 1; i <= slotsPerDay; i++) {
        const startH = Math.floor(currentTime / 60);
        const startM = currentTime % 60;

        // Increment for slot
        currentTime += slotDuration;

        const endH = Math.floor(currentTime / 60);
        const endM = currentTime % 60;

        const format = (h, m) => {
            const hh = h > 12 ? h - 12 : (h === 0 ? 12 : h);
            const mm = m.toString().padStart(2, '0');
            const period = h >= 12 ? 'PM' : 'AM';
            return `${hh}:${mm}${period}`;
        };

        slots.push(`${format(startH, startM)}-${format(endH, endM)}`);

        // Check for break
        if (i === breakAfterSlot) {
            currentTime += breakDuration;
        }
    }

    return slots;
}
