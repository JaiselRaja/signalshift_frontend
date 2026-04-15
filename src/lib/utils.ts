// ─── Date Helpers ─────────────────────────────────────────────────────────────

/** Returns "YYYY-MM-DD" for a given Date object */
export function toDateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Add N days to a Date, returns a new Date */
export function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

/** "YYYY-MM-DD" → formatted display string like "Mon, Apr 14" */
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const today = new Date();
  const tomorrow = addDays(today, 1);

  if (toDateString(d) === toDateString(today)) return "Today";
  if (toDateString(d) === toDateString(tomorrow)) return "Tomorrow";

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** "YYYY-MM-DD" → "14 Apr 2026" */
export function formatDateLong(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** "HH:MM:SS" or "HH:MM" → "6:00 PM" */
export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/** "HH:MM:SS" → "HH:MM" (strips seconds) */
export function toHHMM(timeStr: string): string {
  return timeStr.slice(0, 5);
}

/** Returns true if the given date string is today or in the future */
export function isTodayOrFuture(dateStr: string): boolean {
  return dateStr >= toDateString(new Date());
}

/** Returns true if a slot's start time is in the past (for today's slots) */
export function isSlotPast(dateStr: string, startTimeStr: string): boolean {
  if (dateStr > toDateString(new Date())) return false;
  if (dateStr < toDateString(new Date())) return true;
  const now = new Date().toTimeString().slice(0, 5); // "HH:MM"
  return startTimeStr.slice(0, 5) <= now;
}

// ─── Currency Helpers ─────────────────────────────────────────────────────────

/** Format number as Indian Rupees: 1500 → "₹1,500" */
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── String Helpers ───────────────────────────────────────────────────────────

/** Generate URL-safe slug from a display name */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Get initials from a full name: "John Doe" → "JD" */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ─── Booking Helpers ──────────────────────────────────────────────────────────

/** Returns true if a booking can be cancelled */
export function isCancellable(status: string): boolean {
  return status === "pending" || status === "confirmed";
}

/** Returns true if booking date is in the future */
export function isUpcoming(bookingDate: string): boolean {
  return bookingDate >= toDateString(new Date());
}
