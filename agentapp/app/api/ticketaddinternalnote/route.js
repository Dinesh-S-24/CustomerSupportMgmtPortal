import { NextResponse } from "next/server";
import { tickets } from "@/lib/mockData";

export async function PATCH(request) {
    try {
        const body = await request.json();

        const { ticket_id, internal_note } = body;

        // Validate request
        if (!ticket_id || !internal_note) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Ticket ID and internal note are required."
                },
                { status: 400 }
            );
        }

        // Find ticket using _id
        const ticket = tickets.find(
            (ticket) => ticket._id === ticket_id
        );
console.log("the tickkkekktkne",ticket);
        // Ticket not found
        if (!ticket) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Ticket not found."
                },
                { status: 404 }
            );
        }

        // Save internal note
        ticket.internalNote = internal_note;

        // Return updated ticket
        return NextResponse.json(
            {
                success: true,
                message: "Internal note saved successfully.",
                data: ticket
            },
            { status: 200 }
        );

    } catch (error) {

        console.error("Internal note API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong."
            },
            { status: 500 }
        );
    }
}