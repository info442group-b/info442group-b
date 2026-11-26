export const TYPES = [
  { id: "check-in", label: "Daily check-in", wording: "Take a moment to check in with yourself." },
  { id: "activity", label: "Activity break", wording: "Time for a gentle activity." },
  { id: "custom", label: "Custom", wording: "" },
];

export const REPEATS = [
  { id: "daily", label: "Every day" },
  { id: "weekdays", label: "Weekdays" },
  { id: "weekends", label: "Weekends" },
  { id: "once", label: "Once" },
];

export function labelFor(list, id) {
  return list.find((item) => item.id === id)?.label || id;
}

export function formatTime(time) {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function dateKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function repeatsOn(repeat, date) {
  const day = date.getDay();
  if (repeat === "weekdays") return day >= 1 && day <= 5;
  if (repeat === "weekends") return day === 0 || day === 6;
  return true;
}


export function isDue(reminder, now = new Date()) {
  if (!reminder.time) return false;
  if (reminder.repeat === "once" && reminder.firedOn) return false;
  if (!repeatsOn(reminder.repeat, now)) return false;

  const [hours, minutes] = reminder.time.split(":").map(Number);
  const scheduled = hours * 60 + minutes;
  const current = now.getHours() * 60 + now.getMinutes();
  const minutesAgo = current - scheduled;

  return minutesAgo >= 0 && minutesAgo <= 5;
}


export function getNotificationState() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

const KEEP_IN_APP_KEY = "kindly-keep-reminders-in-app";

export function getKeepInApp() {
  try {
    return localStorage.getItem(KEEP_IN_APP_KEY) === "true";
  } catch {
    return false;
  }
}

export function setKeepInApp(value) {
  try {
    localStorage.setItem(KEEP_IN_APP_KEY, String(value));
  } catch {

  }
}