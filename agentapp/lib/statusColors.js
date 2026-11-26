// Central place for ticket status styling — one source of truth so every
// screen (Dashboard, My Tickets, Ticket Details) shows status consistently.

export const STATUSES = [
  "Assigned",
  "In Progress",
  "Waiting for Customer",
  "Resolved",
  "Closed",
];

const COLORS = {
  Assigned: { dot: "#1D4ED8", text: "text-blue-700" },
  "In Progress": { dot: "#6D28D9", text: "text-violet-700" },
  "Waiting for Customer": { dot: "#A21CAF", text: "text-fuchsia-700" },
  Resolved: { dot: "#15803D", text: "text-green-700" },
  Closed: { dot: "#5B6478", text: "text-slate-500" },
};

export function statusStyle(status) {
  return COLORS[status] || COLORS.Closed;
}