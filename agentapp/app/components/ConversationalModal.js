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
        <div className="agent-modal-backdrop agent-conversation-backdrop">
            <div className="agent-modal agent-conversation-modal">

                {/* ── Header ── */}
                <div className="agent-conversation-header">
                    <div>
                        <p className="agent-modal-kicker">
                            {ticket.ticketNumber}
                        </p>
                        <h2 className="agent-conversation-title">
                            Conversation
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="agent-modal-close"
                    >
                        ×
                    </button>
                </div>

                {/* ── Messages ── */}
                <div className="agent-conversation-messages">

                    {/* Date label */}
                    <div className="agent-conversation-date-wrap">
                        <span className="agent-conversation-date">
                            {formatDate(messages[0]?.createdAt)}
                        </span>
                    </div>

                    {messages.map(msg => {
                        const isMe = msg.senderId === CURRENT_USER;

                        return (
                            <div
                                key={msg._id}
                                className={`agent-message-row${isMe ? " agent-message-row-mine" : ""}`}
                            >
                                {/* Avatar */}
                                <div className="agent-message-avatar">
                                    {isMe ? 'Me' : 'AG'}
                                </div>

                                {/* Bubble */}
                                <div className="agent-message-content">
                                    <div className="agent-message-bubble">
                                        {msg.message}
                                    </div>
                                    <p className="agent-message-time">
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
                <div className="agent-conversation-composer">
                    <textarea
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message... (Enter to send)"
                        rows={2}
                        className="agent-conversation-input"
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !reply.trim()}
                        className="agent-button agent-button-primary agent-conversation-send"
                    >
                        {sending ? 'Sending...' : 'Send →'}
                    </button>
                </div>

            </div>
        </div>
    );
}
