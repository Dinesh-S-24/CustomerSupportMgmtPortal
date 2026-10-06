'use client';

import { useState, useEffect } from "react";
import { MOCK_MESSAGES_BY_STATUS } from "../../lib/mockData";
import { STATUSES } from "@/lib/statusColors";
import { getCustomerById, updateTicketStatus } from "@/lib/api";
import { useToast } from '@/context/ToastContext';

const STATUS_DESCRIPTIONS = {
    Assigned: "Ticket assigned to support agent.",
    "In Progress": "Agent actively working on ticket.",
    "Waiting for Customer": "Awaiting customer response.",
    Resolved: "Issue fixed.",
    Closed: "Final completion status.",
};
const STATUS_FLOW = STATUSES;

export default function TicketDetailsPage({ ticket, onClose, onViewConversation, onTicketUpdated }) {

    console.log("the result is", MOCK_MESSAGES_BY_STATUS);
    const { showToast }    = useToast();

    const [user, setUser] = useState(null);
    const [customerLoading, setCustomerLoading] = useState(false);
    const [status, setStatus] = useState(ticket.status);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusError, setStatusError] = useState("");

    useEffect(() => setStatus(ticket.status), [ticket.status]);

    useEffect(() => {
        let active = true;
        if (!ticket.customerId) {
            setUser(null);
            setCustomerLoading(false);
            return () => { active = false; };
        }

        setUser(null);
        setCustomerLoading(true);
        getCustomerById(ticket.customerId)
            .then((response) => {
                console.log("the response in datagrnrn",response);
                if (active) setUser(response.data);
            })
            .catch((error) => {
                console.error("Could not load ticket customer", error);
                if (active) setUser(null);
            })
            .finally(() => {
                if (active) setCustomerLoading(false);
            });

        return () => { active = false; };
    }, [ticket._id, ticket.customerId]);

    const currentFlowIndex = STATUS_FLOW.indexOf(status);
    const nextStatus = STATUS_FLOW[currentFlowIndex + 1];
    const handleAdvanceStatus = async () => {
        if (!nextStatus || statusUpdating) return;
        setStatusUpdating(true);
        setStatusError("");
        try {
            const response = await updateTicketStatus(ticket._id, nextStatus);
            const updatedTicket = response.data;
            if(response.success){
                showToast(response.message);
            }
            setStatus(updatedTicket.status);
            onTicketUpdated?.(updatedTicket);

        } catch (error) {
            setStatusError(error.message || "Could not update ticket status.");
        } finally {
            setStatusUpdating(false);
        }
    };

    const customerName = customerLoading ? 'Loading customer...' : user?.name || 'Customer details unavailable';

    const customerInitials = user?.name
        ?.split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || '?';

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
                            {
                                label: 'Category',
                                value: ticket.category
                            },
                            {
                                label: 'Priority',
                                value: ticket.priority
                            },
                            {
                                label: 'Status',
                                value: status
                            },
                            {
                                label: 'Assigned Agent',
                                value: ticket.assignedAgentId || 'Not yet assigned'
                            },
                            {
                                label: 'Created At',
                                value: ticket.createdAt
                                    ? new Date(ticket.createdAt).toLocaleDateString(
                                        'en-IN',
                                        {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        }
                                    )
                                    : '—'
                            },
                            {
                                label: 'Ticket ID',
                                value: `#${ticket._id}`
                            }
                        ].map(({ label, value }) => (

                            <div
                                key={label}
                                className="agent-detail-item"
                            >
                                <p className="agent-detail-label">
                                    {label}
                                </p>

                                <p className="agent-detail-value">
                                    {value}
                                </p>
                            </div>

                        ))}

                    </div>

                    <section className="agent-ticket-lifecycle" aria-labelledby="ticket-lifecycle-title">
                        <div className="agent-ticket-lifecycle-heading">
                            <div>
                                <p className="agent-details-description-title" id="ticket-lifecycle-title">Ticket status</p>
                                <p className="agent-ticket-lifecycle-help">Move the ticket through each step as work progresses.</p>
                            </div>
                            {nextStatus && <button type="button" onClick={handleAdvanceStatus} disabled={statusUpdating} className="agent-button agent-button-primary agent-status-advance">{statusUpdating ? "Updating..." : `Move to ${nextStatus} →`}</button>}
                        </div>
                        <ol className="agent-ticket-status-flow">
                            {STATUS_FLOW.map((step, index) => {
                                const activeIndex = currentFlowIndex;
                                const isCurrent = step === status;
                                const isComplete = activeIndex >= 0 && index < activeIndex;
                                return <li key={step} className={`agent-ticket-status-step${isCurrent ? " is-current" : ""}${isComplete ? " is-complete" : ""}`} aria-current={isCurrent ? "step" : undefined}>
                                    <span className="agent-ticket-status-marker">{isComplete ? "✓" : index + 1}</span>
                                    <span className="agent-ticket-status-copy"><strong>{step}</strong><small>{STATUS_DESCRIPTIONS[step]}</small></span>
                                </li>;
                            })}
                        </ol>
                        {statusError && <p className="agent-status-error" role="alert">{statusError}</p>}
                    </section>


                    {/* Customer Details */}
                    <section
                        className="agent-customer-card"
                        aria-labelledby="customer-details-title"
                    >

                        <div className="agent-customer-heading">

                            <div
                                className="agent-customer-avatar"
                                aria-hidden="true"
                            >
                                {customerInitials}
                            </div>

                            <div className="agent-customer-identity">

                                <p
                                    className="agent-details-description-title"
                                    id="customer-details-title"
                                >
                                    Customer details
                                </p>

                                <h2 className="agent-customer-name">
                                    {customerName}
                                </h2>

                                <span className="agent-customer-status">
                                    {user?.role || 'Customer'}
                                </span>

                            </div>

                        </div>


                        <div className="agent-customer-info-grid">

                            {/* Email */}
                            <div className="agent-customer-info-item">

                                <span className="agent-detail-label">
                                    Email
                                </span>

                                <span className="agent-detail-value">
                                    {user?.email || 'Not provided'}
                                </span>

                            </div>


                                {/* Account Type */}
                            <div className="agent-customer-info-item">

                                <span className="agent-detail-label">
                                    Account type
                                </span>

                                <span className="agent-detail-value">
                                    {user?.role || 'Not provided'}
                                </span>

                            </div>

                            {/* Customer ID */}
                            <div className="agent-customer-info-item">

                                <span className="agent-detail-label">
                                    Customer ID
                                </span>

                                <span className="agent-detail-value">
                                    {user?._id || 'Unavailable'}
                                </span>

                            </div>


                            {/* Location
                            <div className="agent-customer-info-item">

                                <span className="agent-detail-label">
                                    Location
                                </span>

                                <span className="agent-detail-value">
                                    Not provided
                                </span>

                            </div> */}


                       


                            {/* Customer Since */}
                            {/* <div className="agent-customer-info-item">

                                <span className="agent-detail-label">
                                    Customer since
                                </span>

                                <span className="agent-detail-value">
                                    Not provided
                                </span>

                            </div> */}

                        </div>

                    </section>


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


                                {MOCK_MESSAGES_BY_STATUS[status] && (

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

