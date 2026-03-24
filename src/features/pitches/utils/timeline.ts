/** Convert "HH:mm" or "HH:mm:ss" to minutes since midnight */
export function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

/** Convert minutes since midnight to "HH:mm" */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Snap minutes to nearest interval (default 15) */
export function snapToInterval(minutes: number, interval = 15): number {
  return Math.round(minutes / interval) * interval;
}

/** Convert time string to pixel offset from timeline start */
export function timeToPixel(
  time: string,
  startHour: number,
  pixelsPerMinute: number,
): number {
  const mins = timeToMinutes(time);
  return (mins - startHour * 60) * pixelsPerMinute;
}

/** Convert pixel offset to time string */
export function pixelToTime(
  px: number,
  startHour: number,
  pixelsPerMinute: number,
): string {
  const mins = Math.round(px / pixelsPerMinute) + startHour * 60;
  return minutesToTime(Math.max(0, Math.min(mins, 24 * 60 - 1)));
}

/** Portion value to number of rows (out of 8) */
export function portionToRows(portion: number): number {
  return Math.round(portion * 8);
}

export interface SessionLayout {
  id: string;
  rowStart: number;
  rowSpan: number;
}

export interface TimeSession {
  id: string;
  startTime: string;
  endTime: string;
  pitchPortion: number;
}

/**
 * Assign vertical row positions (0-7) to sessions for a single day.
 * Uses a greedy stacking algorithm: for each session sorted by start time,
 * find the first contiguous block of free rows.
 */
export function layoutSessions(sessions: TimeSession[]): SessionLayout[] {
  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  // Each of the 8 rows tracks when it becomes free (in minutes)
  const rowFreeAt = new Array(8).fill(0);
  const result: SessionLayout[] = [];

  for (const session of sorted) {
    const startMins = timeToMinutes(session.startTime);
    const rowSpan = portionToRows(session.pitchPortion);
    const clampedSpan = Math.min(rowSpan, 8);

    let bestRow = -1;

    // Find first contiguous block of clampedSpan rows that are free at startMins
    for (let r = 0; r <= 8 - clampedSpan; r++) {
      let fits = true;
      for (let j = r; j < r + clampedSpan; j++) {
        if (rowFreeAt[j] > startMins) {
          fits = false;
          break;
        }
      }
      if (fits) {
        bestRow = r;
        break;
      }
    }

    // If no contiguous block found (overbooking), stack from top
    if (bestRow === -1) {
      bestRow = 0;
    }

    const endMins = timeToMinutes(session.endTime);
    for (let j = bestRow; j < Math.min(bestRow + clampedSpan, 8); j++) {
      rowFreeAt[j] = endMins;
    }

    result.push({ id: session.id, rowStart: bestRow, rowSpan: clampedSpan });
  }

  return result;
}

export interface OverbookingRange {
  startMinutes: number;
  endMinutes: number;
  totalOccupancy: number;
}

/**
 * Detect time ranges where total pitch occupancy exceeds 1.0.
 * Scans minute-by-minute through all sessions.
 */
export function findOverbookingRanges(
  sessions: TimeSession[],
): OverbookingRange[] {
  if (sessions.length === 0) return [];

  // Collect all boundary points
  const events: { minutes: number; delta: number }[] = [];
  for (const s of sessions) {
    events.push({ minutes: timeToMinutes(s.startTime), delta: s.pitchPortion });
    events.push({ minutes: timeToMinutes(s.endTime), delta: -s.pitchPortion });
  }
  events.sort((a, b) => a.minutes - b.minutes || a.delta - b.delta);

  const ranges: OverbookingRange[] = [];
  let current = 0;
  let rangeStart = -1;
  let maxInRange = 0;

  for (const event of events) {
    current += event.delta;
    // Round to avoid floating point issues
    current = Math.round(current * 1000) / 1000;

    if (current > 1 && rangeStart === -1) {
      rangeStart = event.minutes;
      maxInRange = current;
    } else if (current > 1 && rangeStart !== -1) {
      maxInRange = Math.max(maxInRange, current);
    } else if (current <= 1 && rangeStart !== -1) {
      ranges.push({
        startMinutes: rangeStart,
        endMinutes: event.minutes,
        totalOccupancy: maxInRange,
      });
      rangeStart = -1;
      maxInRange = 0;
    }
  }

  // Close any open range
  if (rangeStart !== -1) {
    ranges.push({
      startMinutes: rangeStart,
      endMinutes: events[events.length - 1]!.minutes,
      totalOccupancy: maxInRange,
    });
  }

  return ranges;
}
