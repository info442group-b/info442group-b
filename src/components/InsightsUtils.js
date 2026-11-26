export const RANGES = [
  { id: 7, label: "Last 7 days" },
  { id: 30, label: "Last 30 days" },
  { id: 90, label: "Last 90 days" },
];

export const DEFAULT_RANGE = 7;

export function convertToDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value.seconds) return new Date(value.seconds * 1000);
  const converted = new Date(value);
  return Number.isNaN(converted.getTime()) ? null : converted;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function getRangeStart(days, now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
}

export function filterByRange(checkIns, days, now = new Date()) {
  const start = getRangeStart(days, now);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // exclusive

  return checkIns.filter(
    (checkIn) => checkIn.date && checkIn.date >= start && checkIn.date < end
  );
}

function toInfluenceList(value) {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return list.map((item) => String(item).trim()).filter(Boolean);
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

export function normalizeCheckIn(id, data) {
  return {
    id,
    date: convertToDate(data.createdAt || data.timestamp),
    feeling: capitalize(data.feeling || data.mood || ""), // "great" -> "Great"
    influences: toInfluenceList(data.influences ?? data.factors),
  };
}

function sortOldestFirst(checkIns) {
  return [...checkIns].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function dailyFeelings(checkIns) {
  const days = new Map();

  sortOldestFirst(checkIns).forEach((checkIn) => {
    const key = dateKey(checkIn.date);
    if (!days.has(key)) {
      days.set(key, { dateKey: key, date: startOfDay(checkIn.date), feelings: [] });
    }
    days.get(key).feelings.push(checkIn.feeling || "Recorded");
  });

  return Array.from(days.values());
}

export function influenceCounts(checkIns) {
  const counts = new Map();

  checkIns.forEach((checkIn) => {
    const seenInThisCheckIn = new Set();

    checkIn.influences.forEach((influence) => {
      const key = influence.toLowerCase();
      if (seenInThisCheckIn.has(key)) return;
      seenInThisCheckIn.add(key);

      if (!counts.has(key)) counts.set(key, { label: influence, count: 0 });
      counts.get(key).count += 1;
    });
  });

  return Array.from(counts.values()).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label)
  );
}

export function buildInsights(checkIns, days, now = new Date()) {
  const inRange = sortOldestFirst(filterByRange(checkIns, days, now));
  const daily = dailyFeelings(inRange);

  return {
    total: inRange.length,
    daysWithCheckIns: daily.length,
    daily,
    influences: influenceCounts(inRange),
  };
}
