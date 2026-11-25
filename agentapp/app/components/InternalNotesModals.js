'use client';

import { createPortal } from "react-dom";

export const SAMPLE_NOTES = [
    {
        id: "sample-note-1",
        ticketId: "TKT-1002",
        author: "Zain",
        role: "Support Agent",
        createdAt: "Today, 10:42 AM",
        message: "Verified the customer account and reproduced the issue. Escalated the payment trace to the billing team.",
    },
    {
        id: "sample-note-2",
        ticketId: "TKT-1002",
        author: "Arjun Mehta",
        role: "Team Lead",
        createdAt: "Yesterday, 4:18 PM",
        message: "Customer prefers email updates. Follow up once the transaction review is complete.",
    },
    {
        id: "sample-note-3",
        ticketId: "TKT-1002",
        author: "Zain",
        role: "Support Agent",
        createdAt: "Yesterday, 2:06 PM",
        message: "Initial checks completed. No duplicate charge is visible in the dashboard so far.",
    },
];

export function getSampleNotesForTicket(ticket) {
    const ticketIds = new Set([ticket?._id, ticket?.ticketNumber]
        .filter((value) => value !== undefined && value !== null)
        .map(String));

    return SAMPLE_NOTES
        .filter((note) => ticketIds.has(String(note.ticketId)))
        .slice()
        .reverse();
}

export default function InternalNotesModal({ ticket, ticketId, ticketNumber, onClose }) {
    if (!ticket) return null;
    const ticketNotes = getSampleNotesForTicket(ticket);
    return createPortal(
        <div className="agent-modal-backdrop agent-tickets-page agent-modal-portal agent-internal-notes-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section className="agent-modal agent-internal-notes-modal" role="dialog" aria-modal="true" aria-labelledby="internal-notes-title">
                <header className="agent-conversation-header agent-internal-notes-header">
                    <div>
                        <p className="agent-modal-kicker">{ticketNumber} · Ticket #{ticketId}</p>
                        <h2 className="agent-conversation-title" id="internal-notes-title">🔒 Internal Notes</h2>
                        <p className="agent-internal-notes-caption">Private notes visible to support staff only</p>
                    </div>
                    <button type="button" onClick={onClose} className="agent-modal-close" aria-label="Close internal notes">×</button>
                </header>
                <div className="agent-internal-notes-list">
                    {ticketNotes.length ? ticketNotes.map((note) => (
                        <article className="agent-internal-note-card" key={note.id}>
                            <div className="agent-internal-note-card-top">
                                <div className="agent-internal-note-author-avatar" aria-hidden="true">{note.author.split(" ").map((part) => part[0]).join("")}</div>
                                <div className="agent-internal-note-author"><strong>{note.author}</strong><span>{note.role}</span></div>
                                <time>{note.createdAt}</time>
                            </div>
                            <p>{note.message}</p>
                        </article>
                    )) : <p className="agent-note-empty">No internal notes are available for this ticket.</p>}
                </div>
                <footer className="agent-modal-footer agent-internal-notes-footer">
                    <span>Showing {ticketNotes.length} sample notes</span>
                    <button type="button" onClick={onClose} className="agent-button agent-button-secondary">Close</button>
                </footer>
            </section>
        </div>,
        document.body
    );
}
