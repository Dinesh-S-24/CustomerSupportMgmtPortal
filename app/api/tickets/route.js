// app/api/tickets/route.js  (GET = My Tickets listing, POST = Create Ticket)
import { NextResponse } from "next/server";
import { tickets } from "@/lib/mockData";

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

export async function POST(req) {
    console.log("m inside post request of creating tickets");
  const body = await req.json();
      console.log("m inside post request of creating tickets",body);
const now = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(now);
  const newTicket = {
    _id: String(tickets.length + 1),
    ticketNumber: `TKT-${1000 + tickets.length + 1}`,
    ...body,
    status: "Open",
    assignedAgentId: "Not yet Assigned",
    createdAt:formattedDate,
    updatedAt:formattedDate
  };
  tickets.push(newTicket);
  return NextResponse.json({ success: true, message: "Success", data: newTicket });
}