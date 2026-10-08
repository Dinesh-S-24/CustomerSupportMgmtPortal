// app/api/tickets/route.js  (GET = My Tickets listing, POST = Create Ticket)
import { NextResponse } from "next/server";
import { tickets } from "@/lib/mockData";

const STATUS_FLOW = ["Assigned", "In Progress", "Waiting for Customer", "Resolved", "Closed"];
const MOCK_INTERNAL_NOTES = {
  "1": [
    { _id: "mock-note-1", ticketId: "1", message: "Checked the delivery status with the carrier. Waiting for the latest tracking update before contacting the customer.", createdAt: "2026-09-08T10:15:00.000Z", isInternalNote: true },
  ],
  "2": [
    { _id: "mock-note-2", ticketId: "2", message: "Reviewed the order details. Confirm the delivery address if the customer replies.", createdAt: "2026-09-08T11:30:00.000Z", isInternalNote: true },
  ],
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  
  console.log("searchparams",searchParams);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase();
  // const page = Number(searchParams.get("page") || 1);
  // const limit = 5;

  let result = tickets;
  console.log("the resut of tickers",result);
  if (status) result = result.filter(t => t.status === status);
  // if (search) result = result.filter(t => t.category.toLowerCase().includes(search));
  if (search) {
    //optional chaining in js
  result = result.filter(t =>
    t.category?.toLowerCase().includes(search) ||
    t.subject?.toLowerCase().includes(search) ||
    t.priority?.toLowerCase().includes(search) ||
    t.ticketNumber?.toLowerCase().includes(search) ||
        t.assignedAgentId?.toLowerCase().includes(search) ||

    t.status?.toLowerCase().includes(search) ||
    t.createdAt?.toLowerCase().includes(search)
  );
}
  // if (search) result = result.filter(t => t.updatedAt.toLowerCase().includes(search));
  // if (search) result = result.filter(t => t.createdAt.toLowerCase().includes(search));
    // if (search) result = result.filter(t => t.category.toLowerCase().includes(search));


  // const start = (page - 1) * limit;
  // const paged = result.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    message: "Success",
    data: { tickets: result, total: result.length }
  });
}

export async function PATCH(req) {
  const { ticket_id, status } = await req.json();
  const ticket = tickets.find(item => String(item._id) === String(ticket_id));
  if (!ticket) {
    return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
  }

  const currentIndex = STATUS_FLOW.indexOf(ticket.status);
  const nextStatus = STATUS_FLOW[currentIndex + 1];
  if (!nextStatus || status !== nextStatus) {
    return NextResponse.json({
      success: false,
      message: nextStatus ? `Next status must be ${nextStatus}` : "This ticket is already closed",
    }, { status: 400 });
  }

  ticket.status = status;
  ticket.updatedAt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date());

  return NextResponse.json({ success: true, message: "Ticket status updated", data: ticket });
}
