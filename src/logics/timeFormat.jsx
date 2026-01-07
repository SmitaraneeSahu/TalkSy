
// utils/timeFormat.js
export function formatRelativeOrDate(input) {
  // Normalize to a JS Date:
  const date =
    input == null
      ? null
      : typeof input.toDate === 'function'     // Firestore Timestamp
        ? input.toDate()
        : input instanceof Date                // JS Date
          ? input
          : new Date(input);                   // number/string -> Date

  if (!date || isNaN(date.getTime())) return ''; // guard

  const now = Date.now();
  const diffMs = now - date.getTime();

  // If it's in the future (clock skew), just show the date:
  if (diffMs < 0) return formatAbsoluteDate(date);

  const second = 1000;
  const minute = 60 * second;
  const hour   = 60 * minute;
  const day    = 24 * hour;

  if (diffMs < minute) {
    const s = Math.floor(diffMs / second);
    return s <= 0 ? 'just now' : `${s}s ago`;
  }
  if (diffMs < hour) {
    const m = Math.floor(diffMs / minute);
    return `${m}m ago`;
  }
  if (diffMs < day) {
    const h = Math.floor(diffMs / hour);
    return `${h}h ago`;
  }

  // 24h or more → absolute date format
  return formatAbsoluteDate(date);
}

function formatAbsoluteDate(date) {
  // "30th dec" or "30th dec 2025" if year changed
  const day = ordinal(date.getDate());
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();

  return currentYear === year ? `${day} ${month}` : `${day} ${month} ${year}`;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
