'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getCustomerById } from "@/lib/api";

export default function TicketDetailsPage({ ticket, onClose, onOpenFullPage, inline = false, hideActions = false }) {

    const [user, setUser] = useState(null);
    const [customerLoading, setCustomerLoading] = useState(false);

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

    const customerName = customerLoading ? 'Loading customer...' : user?.name || 'Customer details unavailable';

    const customerInitials = user?.name
        ?.split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || '?';

    const modalContent = (
        <>
            <div className={`agent-modal-backdrop${inline ? "" : " agent-tickets-page agent-modal-portal"} agent-details-backdrop${inline ? " agent-details-backdrop--inline" : ""}`}>

                <div className={`agent-modal agent-details-modal${inline ? " agent-details-modal--inline" : ""}`}>

                    <button
                        onClick={onClose}
                        className="agent-modal-close"
                        aria-label="Close ticket details"
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
                                value: ticket.status
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
                                value: `${ticket.ticketNumber}`
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


                    {/* Description
                    <div className="agent-details-description">

                        <p className="agent-details-description-title">
                            Description
                        </p>

                        <textarea
                            className="agent-details-description-text"
                            aria-label="Ticket description"
                            value={ticket.description || 'No description provided.'}
                            rows={5}
                            readOnly
                        />

                    </div> */}


                    {/* Footer */}
                    {!hideActions && <div className="agent-modal-footer">

                        {onOpenFullPage && (
                            <button type="button" onClick={onOpenFullPage} className="agent-button agent-button-secondary">
                                Ticket Workspace
                            </button>
                        )}

                        {/* <button
                            onClick={onClose}
                            className="agent-button agent-button-secondary"
                        >
                            Close
                        </button> */}


                    </div>}

                </div>

            </div>
        </>
    );

    return inline
        ? modalContent
        : createPortal(modalContent, document.body);
}

