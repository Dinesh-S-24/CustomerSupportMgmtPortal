'use client';
import { useState, useEffect, useRef } from 'react';
import {MOCK_MESSAGES_BY_STATUS } from "../../lib/mockData";

const CURRENT_USER = sessionStorage.getItem("forlogin");

function formatTime(iso) {
    return new Date(iso).toLocaleTimeString('en-IN', {
        hour:   '2-digit',
        minute: '2-digit'
    });
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

export default function ConversationModal({ ticket, onClose }) {
    const [messages, setMessages] = useState(MOCK_MESSAGES_BY_STATUS[ticket.status] || []);
    const [reply,    setReply]    = useState('');
    const [sending,  setSending]  = useState(false);
    const bottomRef               = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!reply.trim()) return;

        const requestPayload = {
            ticket_id:  ticket._id,
            sender_id:  CURRENT_USER,
            message:    reply,
            created_at: new Date().toISOString()
        };

        console.log("Sending:", requestPayload);
        setSending(true);

        try {
            const newMsg = {
                _id:       `msg${Date.now()}`,
                ticketId:  ticket._id,
                senderId:  CURRENT_USER,
                message:   reply,
                createdAt: new Date().toISOString()
            };

            setMessages(prev => [...prev, newMsg]);
            setReply('');

        } catch (error) {
            console.error('Send failed:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="support-modal-overlay" style={{
            position:        'fixed',
            inset:           0,
            zIndex:          100,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding:         '24px'
        }}>
            <div className="support-conversation-modal" style={{
                width:        '100%',
                maxWidth:     '580px',
                borderRadius: '16px',
                background:   '#ffffff',
                boxShadow:    '0 20px 60px rgba(0,0,0,0.2)',
                display:      'flex',
                flexDirection:'column',
                maxHeight:    '80vh',
                overflow:     'hidden'
            }}>

                {/* ── Header ── */}
                <div style={{
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'space-between',
                    padding:         '18px 24px',
                    borderBottom:    '1px solid #e2e8f0',
                    background:      '#f8fafc'
                }}>
                    <div>
                        <p style={{
                            fontSize:   '13px',
                            color:      '#94a3b8',
                            margin:     '0 0 2px'
                        }}>
                            {ticket.ticketNumber}
                        </p>
                        <h2 style={{
                            fontSize:   '16px',
                            fontWeight: '600',
                            color:      '#1A2130',
                            margin:     0
                        }}>
                            Conversation
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            fontSize:   '20px',
                            color:      '#94a3b8',
                            background: 'none',
                            border:     'none',
                            cursor:     'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* ── Messages ── */}
                <div style={{
                    flex:      1,
                    overflowY: 'auto',
                    padding:   '20px 24px',
                    display:   'flex',
                    flexDirection: 'column',
                    gap:       '12px'
                }}>

                    {/* Date label */}
                    <div style={{ textAlign: 'center' }}>
                        <span style={{
                            fontSize:     '12px',
                            color:        '#94a3b8',
                            background:   '#f1f5f9',
                            padding:      '4px 12px',
                            borderRadius: '20px'
                        }}>
                            {formatDate(messages[0]?.createdAt)}
                        </span>
                    </div>

                    {messages.map(msg => {
                        const isMe = msg.senderId === CURRENT_USER;

                        return (
                            <div
                                key={msg._id}
                                style={{
                                    display:       'flex',
                                    flexDirection: isMe ? 'row-reverse' : 'row',
                                    alignItems:    'flex-end',
                                    gap:           '8px'
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width:          '32px',
                                    height:         '32px',
                                    borderRadius:   '50%',
                                    background:     isMe ? '#3474d4' : '#0F766E',
                                    color:          '#fff',
                                    display:        'flex',
                                    alignItems:     'center',
                                    justifyContent: 'center',
                                    fontSize:       '12px',
                                    fontWeight:     '600',
                                    flexShrink:     0
                                }}>
                                    {isMe ? 'Me' : 'AG'}
                                </div>

                                {/* Bubble */}
                                <div style={{ maxWidth: '70%' }}>
                                    <div style={{
                                        padding:      '10px 14px',
                                        borderRadius: isMe
                                            ? '16px 16px 4px 16px'
                                            : '16px 16px 16px 4px',
                                        background:   isMe ? '#3474d4' : '#f1f5f9',
                                        color:        isMe ? '#ffffff' : '#1A2130',
                                        fontSize:     '14px',
                                        lineHeight:   '1.5'
                                    }}>
                                        {msg.message}
                                    </div>
                                    <p style={{
                                        fontSize:  '11px',
                                        color:     '#94a3b8',
                                        margin:    '4px 0 0',
                                        textAlign: isMe ? 'right' : 'left'
                                    }}>
                                        {formatTime(msg.createdAt)}
                                    </p>
                                </div>

                            </div>
                        );
                    })}

                    {/* Auto scroll anchor */}
                    <div ref={bottomRef} />
                </div>

                {/* ── Input Box ── */}
                <div style={{
                    padding:     '16px 24px',
                    borderTop:   '1px solid #e2e8f0',
                    background:  '#f8fafc',
                    display:     'flex',
                    gap:         '10px',
                    alignItems:  'flex-end'
                }}>
                    <textarea
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message... (Enter to send)"
                        rows={2}
                        style={{
                            flex:        1,
                            padding:     '10px 14px',
                            border:      '1px solid #cbd5e1',
                            borderRadius:'10px',
                            fontSize:    '14px',
                            resize:      'none',
                            outline:     'none',
                            fontFamily:  'inherit',
                            lineHeight:  '1.5'
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !reply.trim()}
                        style={{
                            padding:      '10px 20px',
                            background:   sending || !reply.trim()
                                            ? '#94a3b8'
                                            : '#3474d4',
                            color:        '#ffffff',
                            border:       'none',
                            borderRadius: '10px',
                            fontSize:     '14px',
                            fontWeight:   '500',
                            cursor:       sending || !reply.trim()
                                            ? 'not-allowed'
                                            : 'pointer',
                            whiteSpace:   'nowrap'
                        }}
                    >
                        {sending ? 'Sending...' : 'Send →'}
                    </button>
                </div>

            </div>
        </div>
    );
}