// Single point of contact with the backend. Every component calls these
// functions — never fetch() directly — so when the real API replaces the
// mock routes, only this file changes.

const BASE = "/api";

async function handle(res) {
  const body = await res.json();
  if (!body.success) throw new Error(body.message || "Request failed");
  // body.success,body.message
  return body;
}


export async function loginUser(email, password, rememberMe = false) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, rememberMe }),
  });
  
  return handle(res);
}
export async function getTickets({ search = "", status = "", page = 1 } = {}) {
  const params = new URLSearchParams({ page });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const res = await fetch(`${BASE}/tickets?${params}`);
  return handle(res);
}


export async function updateTicketStatus(ticketId, status) {
  const res = await fetch(`${BASE}/tickets`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket_id: ticketId, status }),
  });
  return handle(res);
}
export async function getCustomerById(id) {
  const res = await fetch(`${BASE}/customers/${encodeURIComponent(id)}`);
  console.log("the res ssisisiisi",res);
  return handle(res);
}


