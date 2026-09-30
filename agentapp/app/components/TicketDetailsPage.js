'use client';
import {MOCK_MESSAGES_BY_STATUS } from "../../lib/mockData";

export default function TicketDetailsPage({ ticket, onClose,onViewConversation }) {
console.log("the result is",MOCK_MESSAGES_BY_STATUS);
    return (
        <>
            <div className="agent-modal-backdrop agent-details-backdrop">
                <div className="agent-modal agent-details-modal">

                    <button
                        onClick={onClose}
                        className="agent-modal-close"
                    >
                        ×
                    </button>

                    <div className="agent-modal-header">
                        <p className="agent-modal-kicker">
                            {ticket.ticketNumber}
                        </p>
                        <h1 className="agent-modal-title">
                            {ticket.subject}
                        </h1>
                    </div>

                    {/* Details Grid */}
                    <div className="agent-details-grid">
                        {[
                            { label: 'Category',       value: ticket.category },
                            { label: 'Priority',       value: ticket.priority },
                            { label: 'Status',         value: ticket.status },
                            { label: 'Assigned Agent', value: ticket.assignedAgentId || 'Not yet assigned' },
                            { label: 'Created At',     value: ticket.createdAt
                                ? new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                })
                                : '—'
                            },
                            { label: 'Ticket ID',      value: `#${ticket._id}` },
                        ].map(({ label, value }) => (
                            <div key={label} className="agent-detail-item">
                                <p className="agent-detail-label">
                                    {label}
                                </p>
                                <p className="agent-detail-value">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div className="agent-details-description">
                        <p className="agent-details-description-title">
                            Description
                        </p>
                        <p className="agent-details-description-text">
                            {ticket.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="agent-modal-footer">
                        <button
                            onClick={onClose}
                            className="agent-button agent-button-secondary"
                        >
                            Close
                        </button>

                        {/* Only show if status is Assigned */}
                        {MOCK_MESSAGES_BY_STATUS[ticket.status] && (
                            <button
                                onClick={onViewConversation}
                                className="agent-button agent-button-primary"
                            >
                                View Conversation →
                            </button>
                        )}
                    </div>

                </div>
            </div>

        
        </>
    );
}
