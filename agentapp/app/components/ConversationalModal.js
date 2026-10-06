'use client';
import { useState, useEffect, useRef } from 'react';
// import {MOCK_MESSAGES_BY_STATUS } from "../../lib/mockData";
import {customers, MOCK_MESSAGES_BY_STATUS } from "../../lib/mockData";

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
    const [note, setNote] = useState('');
    const [composerMode, setComposerMode] = useState('reply');
    const [currentUser, setCurrentUser] = useState('agent');
    const [sending,  setSending]  = useState(false);
    const bottomRef               = useRef(null);

    useEffect(() => {
        setCurrentUser(sessionStorage.getItem('forlogin') || 'agent');
    }, []);
    useEffect(() => {
        setMessages(MOCK_MESSAGES_BY_STATUS[ticket.status] || []);
    }, [ticket._id, ticket.status]);


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!reply.trim()) return;

        // const requestPayload = {
        //     ticket_id:  ticket._id,
        //     sender_id:  currentUser,
        //     message:    reply,
        //     created_at: new Date().toISOString()
        // };

        // console.log("Sending:", requestPayload);
        setSending(true);

        try {
            const newMsg = {
                _id:       `msg${Date.now()}`,
                ticketId:  ticket._id,
                senderId:  currentUser,
                message:   reply,
                createdAt: new Date().toISOString()
            };
        console.log("Sending new msg:", newMsg);

            setMessages(prev => [...prev, newMsg]);
            setReply('');

        } catch (error) {
            console.error('Send failed:', error);
        } finally {
            setSending(false);
        }
    };

    const handleAddNote = async () => {
        if (!note.trim()) return;

        setSending(true);
        try {
            const createdAt = new Date().toISOString();
            setMessages(prev => [...prev, {
                _id: `note${Date.now()}`,
                ticketId: ticket._id,
                senderId: currentUser,
                message: note.trim(),
                createdAt,
                isInternalNote: true
            }]);
            console.log("the msg inside here is",messages)
            setNote('');
            setComposerMode('reply');
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
                            {messages.length ? formatDate(messages[0].createdAt) : 'No messages yet'}
                        </span>
                    </div>

                    {messages.map(msg => {
                        // const isMe = msg.agentId === currentUser;
                        console.log("hey conversationmsgs are",msg);
                        // const isInternalNote = Boolean(msg.isInternalNote);
                        const customer = customers.find((item) => String(item._id) === String(msg.senderId));
                        const isCustomer = Boolean(customer);
                        const isMe = !isCustomer;
                        const isInternalNote = Boolean(msg.isInternalNote || msg.is_internal_note);
                        const avatar = isCustomer
                            ? customer?.name?.trim()?.charAt(0)?.toUpperCase() || 'C'
                            : 'A';

                        return (
                            <div
                                key={msg._id}
                                className={`agent-message-row${isMe ? " agent-message-row-mine" : ""}${isInternalNote ? " agent-message-row-internal" : ""}`}
                            >
                                {/* Avatar */}
                                {/* <div className="agent-message-avatar">
                                    {isMe ? 'Me' : 'AG'}
                                </div> */}


                                <div className="agent-message-avatar" aria-label={isCustomer ? `${customer?.name || 'Customer'} avatar` : 'Agent avatar'}>
                                    {avatar}
</div>
                                {/* Bubble */}
                                <div className="agent-message-content">
                                    {isInternalNote && <div className="agent-internal-note-label">🔒 Internal note · Support staff only</div>}
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
                {composerMode === 'note' ? (
                    <div className="agent-conversation-composer agent-internal-composer">
                        <div className="agent-internal-composer-heading">🔒 Internal Note <span>Only visible to support staff</span></div>
                        <textarea
                            autoFocus
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Write internal note..."
                            rows={3}
                            className="agent-conversation-input"
                            aria-label="Write internal note"
                        />
                        <div className="agent-internal-composer-actions">
                            <button type="button" className="agent-button agent-button-secondary" onClick={() => { setNote(''); setComposerMode('reply'); }}>Cancel</button>
                            <button type="button" onClick={handleAddNote} disabled={sending || !note.trim()} className="agent-button agent-button-primary agent-conversation-send">{sending ? 'Adding...' : 'Add Note'}</button>
                        </div>
                    </div>
                ) : (
                    <div className="agent-conversation-composer">
                        <button type="button" className="agent-button agent-internal-note-trigger" onClick={() => setComposerMode('note')}>🔒 Add Internal Note</button>
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
                )}

            </div>
        </div>
    );
}
