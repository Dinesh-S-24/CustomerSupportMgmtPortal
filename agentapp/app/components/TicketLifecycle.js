'use client';

import { useEffect, useState } from 'react';
import { STATUSES } from '@/lib/statusColors';
import { updateTicketStatus } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

const STATUS_DESCRIPTIONS = {
    Assigned: 'Ticket assigned to support agent.',
    'In Progress': 'Agent actively working on ticket.',
    'Waiting for Customer': 'Awaiting customer response.',
    Resolved: 'Issue fixed.',
    Closed: 'Final completion status.',
};

export default function TicketLifecycle({ ticket, onTicketUpdated }) {
    const { showToast } = useToast();
    const [status, setStatus] = useState(ticket.status);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusError, setStatusError] = useState('');

    useEffect(() => setStatus(ticket.status), [ticket.status]);

    const currentFlowIndex = STATUSES.indexOf(status);
    const nextStatus = STATUSES[currentFlowIndex + 1];

    const handleAdvanceStatus = async () => {
        if (!nextStatus || statusUpdating) return;
        setStatusUpdating(true);
        setStatusError('');
        try {
            const response = await updateTicketStatus(ticket._id, nextStatus);
            const updatedTicket = response.data;
            if (response.success) showToast(response.message);
            setStatus(updatedTicket.status);
            onTicketUpdated?.(updatedTicket);
        } catch (error) {
            setStatusError(error.message || 'Could not update ticket status.');
        } finally {
            setStatusUpdating(false);
        }
    };

    return (
        <section className="agent-ticket-lifecycle" aria-labelledby={`ticket-lifecycle-${ticket._id}`}>
            <div className="agent-ticket-lifecycle-heading">
                <div>
                    <p className="agent-details-description-title" id={`ticket-lifecycle-${ticket._id}`}>Ticket status</p>
                    <p className="agent-ticket-lifecycle-help">Move the ticket through each step as work progresses.</p>
                </div>
                {nextStatus && <button type="button" onClick={handleAdvanceStatus} disabled={statusUpdating} className="agent-button agent-button-primary agent-status-advance">{statusUpdating ? 'Updating...' : `Move to ${nextStatus} →`}</button>}
            </div>
            <ol className="agent-ticket-status-flow">
                {STATUSES.map((step, index) => {
                    const isCurrent = step === status;
                    const isComplete = currentFlowIndex >= 0 && index < currentFlowIndex;
                    return <li key={step} className={`agent-ticket-status-step${isCurrent ? ' is-current' : ''}${isComplete ? ' is-complete' : ''}`} aria-current={isCurrent ? 'step' : undefined}>
                        <span className="agent-ticket-status-marker">{isComplete ? '✓' : index + 1}</span>
                        <span className="agent-ticket-status-copy"><strong>{step}</strong><small>{STATUS_DESCRIPTIONS[step]}</small></span>
                    </li>;
                })}
            </ol>
            {statusError && <p className="agent-status-error" role="alert">{statusError}</p>}
        </section>
    );
}
