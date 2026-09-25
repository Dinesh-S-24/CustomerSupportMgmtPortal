'use client';
import { useState } from 'react';
import {MOCK_MESSAGES_BY_STATUS } from "../../lib/mockData";

export default function TicketDetailsPage({ ticket, onClose,onViewConversation }) {
console.log("the result is",MOCK_MESSAGES_BY_STATUS);
    return (
        <>
            <div className="support-modal-overlay" style={{
                position:        'fixed',
                inset:           0, 
                zIndex:          50,
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding:         '24px'
            }}>
                <div className="support-ticket-modal" style={{
                    position:     'relative',
                    width:        '100%',
                    maxWidth:     '680px',
                    borderRadius: '16px',
                    background:   '#ffffff',
                    boxShadow:    '0 20px 60px rgba(0,0,0,0.15)'
                }}>

                    <button
                        onClick={onClose}
                        style={{
                            position:   'absolute',
                            top:        '16px',
                            right:      '16px',
                            fontSize:   '20px',
                            color:      '#94a3b8',
                            background: 'none',
                            border:     'none',
                            cursor:     'pointer',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>

                    <div style={{
                        padding:      '24px',
                        borderBottom: '1px solid #e2e8f0'
                    }}>
                        <p style={{
                            fontSize: '13px',
                            color:    '#94a3b8',
                            margin:   '0 0 4px'
                        }}>
                            {ticket.ticketNumber}
                        </p>
                        <h1 style={{
                            fontSize:   '20px',
                            fontWeight: '500',
                            color:      '#1A2130',
                            margin:     0
                        }}>
                            {ticket.subject}
                        </h1>
                    </div>

                    {/* Details Grid */}
                    <div style={{
                        display:             'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap:                 '1px',
                        background:          '#e2e8f0'
                    }}>
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
                            <div key={label} style={{
                                background: '#ffffff',
                                padding:    '16px'
                            }}>
                                <p style={{
                                    fontSize: '12px',
                                    color:    '#94a3b8',
                                    margin:   '0 0 4px'
                                }}>
                                    {label}
                                </p>
                                <p style={{
                                    fontSize:   '14px',
                                    fontWeight: '500',
                                    color:      '#1A2130',
                                    margin:     0
                                }}>
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    <div style={{ padding: '24px' }}>
                        <p style={{
                            fontSize:   '14px',
                            fontWeight: '500',
                            color:      '#1A2130',
                            margin:     '0 0 8px'
                        }}>
                            Description
                        </p>
                        <p style={{
                            fontSize:   '14px',
                            color:      '#64748b',
                            lineHeight: '1.6',
                            margin:     0
                        }}>
                            {ticket.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Footer */}
                    <div style={{
                        display:       'flex',
                        justifyContent:'flex-end',
                        gap:           '12px',
                        borderTop:     '1px solid #e2e8f0',
                        padding:       '20px 24px'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding:      '9px 18px',
                                border:       '1px solid #cbd5e1',
                                borderRadius: '8px',
                                background:   '#ffffff',
                                fontSize:     '14px',
                                color:        '#475569',
                                cursor:       'pointer'
                            }}
                        >
                            Close
                        </button>

                        {/* Only show if status is Assigned */}
                        {MOCK_MESSAGES_BY_STATUS[ticket.status] && (
                            <button
                                onClick={onViewConversation}
                                style={{
                                    padding:      '9px 18px',
                                    borderRadius: '8px',
                                    background:   '#0F766E',
                                    border:       'none',
                                    fontSize:     '14px',
                                    fontWeight:   '500',
                                    color:        '#ffffff',
                                    cursor:       'pointer'
                                }}
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