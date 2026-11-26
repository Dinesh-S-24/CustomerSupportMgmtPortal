'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTickets, getCustomerById } from '@/lib/api';
import { getMockMessagesForTicket, users, customers } from '@/lib/mockData';
import TicketLifecycle from '@/app/components/TicketLifecycle';
import { getSampleNotesForTicket } from '@/app/components/InternalNotesModals';
import Nav from '@/app/components/Nav';

const FILTERS = ['All', 'Assigned', 'In Progress', 'Resolved'];
const PRIORITY_RANK = { low: 1, medium: 2, normal: 2, high: 3, urgent: 4, critical: 5 };
const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || '?';
const dateLabel = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const timeLabel = (value) => value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

function Icon({ name, className = '' }) {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></>,
    down: <path d="m7 10 5 5 5-5"/>,
    up: <path d="m7 14 5-5 5 5"/>,
    minus: <path d="M5 12h14"/>,
    check: <><path d="m5 12 4 4L19 6"/><path d="M22 12a10 10 0 1 1-5-8.7"/></>,
    clip: <path d="m21.4 11.1-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l9.2-9.2a3.7 3.7 0 0 1 5.2 5.2L9.9 17.4a1.8 1.8 0 0 1-2.6-2.6l8.5-8.5"/>,
    smile: <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></>,
    reply: <><path d="m9 17-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></>,
    refresh: <><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"/></>,
    filter: <path d="M3 5h18l-7 8v6l-4 2v-8Z"/>,
    copy: <><rect x="9" y="9" width="12" height="12" rx="3"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 8 8 6 8-6"/></>,
  };
  return <svg className={`agent-ws-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function StatusBadge({ status }) {
  const variant = ({ Assigned: 'assigned', 'In Progress': 'progress', 'Waiting for Customer': 'waiting', Resolved: 'resolved', Closed: 'closed' })[status] || 'closed';
  return <span className={`agent-ws-status agent-ws-status-${variant}`}><i />{status || 'Closed'}</span>;
}
function PriorityBadge({ priority }) {
  const value = String(priority || 'Medium').toLowerCase();
  const type = ['low'].includes(value) ? 'low' : ['high', 'urgent', 'critical'].includes(value) ? 'high' : 'medium';
  return <span className={`agent-ws-priority agent-ws-priority-${type}`}><Icon name={type === 'low' ? 'down' : type === 'high' ? 'up' : 'minus'} />{priority || 'Medium'}</span>;
}

export default function TicketWorkspace({ initialTicketId = null }) {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerTab, setDrawerTab] = useState('details');
  const [customer, setCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [statusEvents, setStatusEvents] = useState([]);
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const [mode, setMode] = useState('reply');
  const [sending, setSending] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [toast, setToast] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const filterRef = useRef(null);
  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => setSearch(query), 350); return () => window.clearTimeout(timer); }, [query]);

  // Ctrl/Cmd + K focuses the search box
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close the priority menu on outside click or Escape
  useEffect(() => {
    if (!filterOpen) return undefined;
    const onDown = (event) => { if (!filterRef.current?.contains(event.target)) setFilterOpen(false); };
    const onKey = (event) => { if (event.key === 'Escape') setFilterOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [filterOpen]);

  const loadTickets = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const response = await getTickets({ search, status: '' });
      const list = response.data?.tickets || [];
      setTickets(list);
      if (initialTicketId) {
        const requested = list.find(item => String(item._id) === String(initialTicketId));
        if (requested) setSelected(requested);
      } else if (!selected && list.length) setSelected(list[0]);
    } catch (err) { console.error(err); setError(true); setTickets([]); }
    finally { setLoading(false); }
  }, [initialTicketId, search]);
  useEffect(() => { loadTickets(); }, [loadTickets]);

  useEffect(() => {
    if (!selected) { setCustomer(null); setMessages([]); return; }
    //here below messages will get for that ticket
    setMessages(getMockMessagesForTicket(selected));
    setStatusEvents([]);
    setDrawerTab('details');
    let active = true;
    //here below customer data response will be setted
    if (selected.customerId) getCustomerById(selected.customerId).then(response => { if (active) setCustomer(response.data); }).catch(() => { if (active) setCustomer(null); });
    else setCustomer(null);
    return () => { active = false; };
  }, [selected?._id, selected?.customerId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages]);

  // Priorities that actually exist in the loaded tickets, lowest to highest
  const priorities = useMemo(
    () => [...new Set(tickets.map(ticket => ticket.priority).filter(Boolean))]
      .sort((a, b) => (PRIORITY_RANK[String(a).toLowerCase()] || 0) - (PRIORITY_RANK[String(b).toLowerCase()] || 0)),
    [tickets]
  );
  const byPriority = useMemo(() => tickets.filter(ticket => priorityFilter === 'All' || ticket.priority === priorityFilter), [tickets, priorityFilter]);
  const visibleTickets = useMemo(() => byPriority.filter(ticket => filter === 'All' || ticket.status === filter), [byPriority, filter]);
  const counts = useMemo(() => Object.fromEntries(FILTERS.map(name => [name, name === 'All' ? byPriority.length : byPriority.filter(ticket => ticket.status === name).length])), [byPriority]);
  const internalNotes = useMemo(() => selected?.internalNotes?.length ? [...selected.internalNotes].reverse() : getSampleNotesForTicket(selected), [selected]);
  const updateTicket = (updated) => {
    if (selected && String(selected._id) === String(updated._id) && selected.status !== updated.status) {
      setStatusEvents(current => [...current, { id: `${Date.now()}-${updated.status}`, status: updated.status, createdAt: new Date().toISOString() }]);
    }
    setSelected(updated);
    setTickets(current => current.map(item => String(item._id) === String(updated._id) ? updated : item));
  };
  //here below passed other ticket id
  const selectTicket = (ticket) => {
    //here below the other right side 2 column getting changed
    setSelected(ticket);
    setCollapsed(false);
    if (initialTicketId && String(initialTicketId) !== String(ticket._id)) router.replace('/tickets');
  };
  const sendReply = async () => {
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    try {
      const user = sessionStorage.getItem('forlogin') || 'agent';
      setMessages(current => [...current, { _id: `msg${Date.now()}`, ticketId: selected._id, senderId: user, message: reply.trim(), createdAt: new Date().toISOString() }]);
      setReply('');
    } finally { setSending(false); }
  };
  const saveNote = async () => {
    const message = note.trim();
    if (!selected || !message || sending) return;
    setSending(true); setNoteError('');
    try {
      const response = await fetch('/api/ticketaddinternalnote', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket_id: selected._id, internal_note: message }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Could not save note.');
      updateTicket(result.data);
      setNote('');
      notify('Internal note added');
    } catch (err) { setNoteError(err.message || 'Could not save note.'); notify(err.message || 'Could not save note.', 'error'); }
    finally { setSending(false); }
  };
  const handleComposerKey = (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); mode === 'reply' ? sendReply() : saveNote(); } };

  return <div className="agent-ws-shell">
    <Nav />
    <main className={`agent-ws-layout${collapsed ? ' agent-ws-layout-collapsed' : ''}`}>
      <aside className="agent-ws-list-panel" aria-label="Ticket list">
        <header className="agent-ws-list-header">
          <div>
            <p className="agent-ws-eyebrow"><Icon name="mail"/>SUPPORT INBOX</p>
            <h1>My tickets <span>{tickets.length}</span></h1>
          </div>
          <div className="agent-ws-filter-wrap" ref={filterRef}>
            <button type="button" className={`agent-ws-filter-btn${priorityFilter !== 'All' ? ' is-active' : ''}`} aria-haspopup="menu" aria-expanded={filterOpen} aria-label="Filter tickets by priority" onClick={() => setFilterOpen(value => !value)} title="Select priority"><Icon name="filter"/></button>
            {filterOpen && <div className="agent-ws-filter-menu" role="menu">
              <p>Priority</p>
              {['All', ...priorities].map(option => <button key={option} type="button" role="menuitemradio" aria-checked={priorityFilter === option} className={priorityFilter === option ? 'is-active' : ''} onClick={() => { setPriorityFilter(option); setFilterOpen(false); }}>{option}</button>)}
            </div>}
          </div>
        </header>
        <label className="agent-ws-search"><Icon name="search"/><input ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search tickets on ID or Subject" aria-label="Search tickets"/></label>
        <div className="agent-ws-status-tabs" data-active-index={FILTERS.indexOf(filter)} role="tablist" aria-label="Filter tickets">{FILTERS.map((name) => <button key={name} role="tab" aria-selected={filter === name} className={filter === name ? 'is-active' : ''} onClick={() => setFilter(name)}>{name}<span>{counts[name]}</span></button>)}<i /></div>
        <div className="agent-ws-ticket-scroll" aria-live="polite">
          {loading && !tickets.length && <div className="agent-ws-skeleton-list">{Array.from({ length: 7 }, (_, i) => <div className="agent-ws-skeleton" key={i}/>)}</div>}
          {error && <div className="agent-ws-state"><strong>Tickets couldn’t load</strong><span>Check your connection and try again.</span><button onClick={loadTickets}>Retry</button></div>}
          {!loading && !error && !visibleTickets.length && <div className="agent-ws-state"><strong>No tickets found</strong><span>Try another search, status or priority.</span></div>}
          {visibleTickets.map((ticket, index) => <button className={`agent-ws-ticket-row${String(selected?._id) === String(ticket._id) ? ' is-active' : ''}`} key={ticket._id} onClick={() => selectTicket(ticket)}>
            <span className="agent-ws-row-top"><span className="agent-ws-id">{ticket.ticketNumber || `#${ticket._id}`}</span><time>{ticket.updatedAt ? dateLabel(ticket.updatedAt) : dateLabel(ticket.createdAt)}</time></span>
            <strong>{ticket.subject || 'Untitled ticket'}</strong>
            <span className="agent-ws-row-bottom"><span className={`agent-ws-avatar agent-ws-avatar-${index % 3}`}>{initials(ticket.assignedAgentId || 'Agent')}</span><StatusBadge status={ticket.status}/><PriorityBadge priority={ticket.priority}/>{ticket.unreadCount > 0 && <span className="agent-ws-unread">{ticket.unreadCount}</span>}</span>
          </button>)}
        </div>
      </aside>

      <section className="agent-ws-thread-panel" aria-label="Ticket conversation" key={selected?._id || 'empty'}>
        {selected ? <>
          <header className="agent-ws-conversation-header">
            <div className="agent-ws-conversation-title"><span className="agent-ws-id">{selected.ticketNumber || `#${selected._id}`}</span><StatusBadge status={selected.status}/></div><div className="agent-ws-conversation-agent"><span className="agent-ws-agent-avatar">{initials(selected.assignedAgentId || 'Agent')}</span><span>{selected.assignedAgentId || 'Unassigned'}<i/></span><button className="agent-ws-icon-button" type="button" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'Show ticket details' : 'Hide ticket details'} data-tooltip={collapsed ? 'Show details' : 'Hide details'}><Icon name={collapsed ? 'arrow' : 'close'}/></button></div></header>
          <div className="agent-ws-messages" key={`messages-${selected._id}`}>
            {messages.length === 0 && <div className="agent-ws-thread-empty">No conversation history is available for this ticket yet.</div>}
            {messages.map((message, index) => {
              const customerSender = customers.find(item => String(item._id) === String(message.senderId));
              const userSender = users.find(item => String(item._id) === String(message.senderId));
              const customerMessage = Boolean(customerSender);
              const internal = Boolean(message.isInternalNote || message.is_internal_note);
              const name = customerMessage ? customerSender.name : userSender?.name || 'Support Agent';
              const previous = messages[index - 1];
              const showDate = !previous || new Date(previous.createdAt).toDateString() !== new Date(message.createdAt).toDateString();
              return <div key={message._id}>{showDate && <div className="agent-ws-date-chip">{dateLabel(message.createdAt)}</div>}<article className={`agent-ws-message${customerMessage ? ' is-customer' : ' is-agent'}${internal ? ' is-note' : ''}`}><div className="agent-ws-message-meta">{name}<time>{timeLabel(message.createdAt)}</time></div><div className="agent-ws-bubble">{internal && <span className="agent-ws-note-tag"><Icon name="lock"/>Internal note</span>}{message.message}</div>{!customerMessage && <span className="agent-ws-read">✓✓</span>}</article></div>;
            })}
            {/* {statusEvents.map(event => <div className="agent-ws-event-pill" key={event.id}>Status changed to <strong>{event.status}</strong><time>{timeLabel(event.createdAt)}</time></div>)}<div ref={endRef}/> */}
          </div>
          <form className={`agent-ws-composer${mode === 'note' ? ' is-note' : ''}`} onSubmit={event => {event.preventDefault(); mode === 'reply' ? sendReply() : saveNote();}}>
            <div className="agent-ws-composer-top"><div className="agent-ws-segment"><button type="button" className={mode === 'reply' ? 'is-active' : ''} onClick={() => setMode('reply')}><Icon name="reply"/>Reply</button><button type="button" className={mode === 'note' ? 'is-active' : ''} onClick={() => setMode('note')}><Icon name="lock"/>Internal note</button></div>{mode === 'note' && <span className="agent-ws-note-hint"><Icon name="lock"/>Only agents can see this</span>}</div>
            <textarea ref={inputRef} value={mode === 'reply' ? reply : note} onChange={event => mode === 'reply' ? setReply(event.target.value) : setNote(event.target.value)} onKeyDown={handleComposerKey} placeholder={mode === 'reply' ? 'Write a reply…' : 'Write an internal note…'} rows={2} aria-label={mode === 'reply' ? 'Write a reply' : 'Write an internal note'}/>
            <div className="agent-ws-composer-bottom"><div className="agent-ws-toolbar"><button type="button" className="agent-ws-icon-button" aria-label="Attach file" data-tooltip="Attach file"><Icon name="clip"/></button><button type="button" className="agent-ws-icon-button" aria-label="Emoji" data-tooltip="Emoji"><Icon name="smile"/></button><button type="button" className="agent-ws-icon-button" aria-label="Canned reply" data-tooltip="Canned reply"><Icon name="reply"/></button>{mode === 'note' && noteError && <span className="agent-ws-error-text">{noteError}</span>}</div><button type="submit" className="agent-ws-send" disabled={sending || !(mode === 'reply' ? reply.trim() : note.trim())}>{sending ? <span className="agent-ws-spinner"/> : <><span>{mode === 'reply' ? 'Send' : 'Add note'}</span><Icon name="send"/></>}</button></div>
          </form>
        </> : <div className="agent-ws-no-selection"><span className="agent-ws-empty-mark">✦</span><h2>Select a ticket</h2><p>Choose a request from your inbox to view its conversation.</p></div>}
      </section>

      <aside className="agent-ws-details-panel" aria-label="Ticket details">
        {selected && <>
          <div className="agent-ws-drawer-tabs" data-active-index={drawerTab === 'details' ? 0 : 1}><button className={drawerTab === 'details' ? 'is-active' : ''} onClick={() => setDrawerTab('details')}>Details</button><button className={drawerTab === 'notes' ? 'is-active' : ''} onClick={() => setDrawerTab('notes')}>Internal notes <span>{internalNotes.length}</span></button><i/></div>
          {drawerTab === 'details' ? <div className="agent-ws-details-scroll" key={`details-${selected._id}`}>
            <section className="agent-ws-detail-card"><h3>Ticket</h3><div className="agent-ws-detail-line"><span>Status</span><StatusBadge status={selected.status}/></div><div className="agent-ws-detail-line"><span>Priority</span><PriorityBadge priority={selected.priority}/></div><div className="agent-ws-detail-line"><span>Category</span><strong>{selected.category || 'General'}</strong></div><div className="agent-ws-detail-line"><span>Assigned agent</span><strong>{selected.assignedAgentId || 'Unassigned'}</strong></div><div className="agent-ws-detail-line"><span>Created</span><strong>{dateLabel(selected.createdAt)}</strong></div></section>
            <section className="agent-ws-detail-card agent-ws-customer-card"><h3>Customer</h3><div className="agent-ws-customer-head"><span className="agent-ws-customer-avatar">{initials(customer?.name || 'Customer')}</span><div><strong>{customer?.name || 'Customer'}</strong><small>{customer?.role || 'Customer account'}</small></div></div><div className="agent-ws-detail-line"><span>Email</span><strong className="agent-ws-email">{customer?.email || 'Not provided'}{customer?.email && <button type="button" onClick={() => { navigator.clipboard?.writeText(customer.email); notify('Email copied'); }} aria-label="Copy email" data-tooltip="Copy email"><Icon name="copy"/></button>}</strong></div><div className="agent-ws-detail-line"><span>Customer ID</span><strong>{customer?._id || selected.customerId || 'Unavailable'}</strong></div></section>
            <section className="agent-ws-detail-card"><h3>Ticket description</h3><p className="agent-ws-description">{selected.description || 'No description provided.'}</p></section>
            <TicketLifecycle ticket={selected} onTicketUpdated={updateTicket} onFeedback={notify}/>
          </div> : <div className="agent-ws-notes-scroll">{internalNotes.length ? internalNotes.map((item, i) => <article className="agent-ws-note-card" key={item._id || item.id || i}><div><strong>{item.author || 'Support Agent'}</strong><time>{item.createdAt ? dateLabel(item.createdAt) : ''}</time></div><p>{item.message || item.internal_note}</p><span><Icon name="lock"/>Agents only</span></article>) : <p className="agent-ws-empty-notes">No internal notes on this ticket.</p>}<button className="agent-ws-add-note" onClick={() => {setMode('note'); inputRef.current?.focus();}}>Add internal note</button></div>}
        </>}
      </aside>
      {toast && <div className={`agent-ws-toast is-${toast.type}`} role="status"><span>{toast.message}</span><i/></div>}
    </main>
  </div>;
}
