"use client";

import { useEffect, useState } from "react";
import ConversationModal from '@/app/components/ConversationalModal';

import StatusTag from "@/app/components/StatusTag";
import { getTickets } from "@/lib/api";
import { STATUSES } from "@/lib/statusColors";
import TicketDetailsPage from "@/app/components/TicketDetailsPage";
import Nav       from '@/app/components/Nav';
import { useToast } from '@/context/ToastContext';

// const PAGE_SIZE = 5;
export default function MyTicketsPage() {
  const { showToast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const [showConversation, setShowConversation] = useState(false);
  // This contains ALL tickets returned from backend
  const [tickets, setTickets] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");

  // Current UI page
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [noteTicket, setNoteTicket] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  const openNoteModal = (ticket) => {
    setNoteTicket(ticket);
    setNoteDraft("");
    setNoteError("");
  };

  const saveInternalNote = async () => {
    const message = noteDraft.trim();
    if (!noteTicket || !message || savingNote) return;

    setSavingNote(true);
    setNoteError("");
    try {
      const response = await fetch("/api/ticketaddinternalnote", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: noteTicket._id, internal_note: message }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not save note.");

      const updatedTicket = result.data;
      console.log("theupdated tifjvdnvjk",result);
      setTickets(current => current.map(ticket => String(ticket._id) === String(updatedTicket._id) ? updatedTicket : ticket));
      setNoteTicket(updatedTicket);
      setNoteDraft("");
      showToast("Notes added successfully");
    } catch (error) {
      setNoteError(error.message || "Could not save note.");
    } finally {
      setSavingNote(false);
    }
  };

  useEffect(() => {
    // let active = true;

    setLoading(true);

    getTickets({
      search,
      status
    })
        .then((data) => {
          // if (!active) return;

          // Backend is returning:
          // { success: true, message: "Success", data: [...] }

          setTickets(data.data.tickets || []);
          setLoadError(false);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoadError(true);
          setTickets([]);
          setLoading(false);
        });

    // return () => {
    //   active = false;
    // };
  }, [search, status]);

  // -----------------------------------
  // PAGINATION LOGIC
  // -----------------------------------

  const priorities = [...new Set(tickets.map((ticket) => ticket.priority).filter(Boolean))];
  const categories = [...new Set(tickets.map((ticket) => ticket.category).filter(Boolean))];
  const filteredTickets = tickets.filter((ticket) =>
    (!priority || String(ticket.priority || "").toLowerCase() === priority.toLowerCase()) &&
    (!category || String(ticket.category || "").toLowerCase() === category.toLowerCase())
  );
  const total = filteredTickets.length;

  const totalPages = Math.max(
      1,
      Math.ceil(total / pageSize)
  );

  const startIndex = (page - 1) * pageSize;

  const endIndex = startIndex + pageSize;

  const currentTickets = filteredTickets.slice(
      startIndex,
      endIndex
  );

  return (
      <main className="agent-tickets-page">
        <Nav />

        <div className="agent-tickets-container">

          {/* PAGE HEADER */}

          <div className="support-page-header">

            <div>

              <h1 className="support-page-title">
                My Tickets
              </h1>

              <p className="support-page-subtitle">
                View, track, and manage your support requests
              </p>

            </div>



          </div>

          {/* MAIN CARD */}

          <div className="support-card">

            {/* CARD HEADER */}

            <div className="support-card-header">

              <div className="support-filters">

                <div>

                  <h2 className="support-card-title">
                    Support Requests
                  </h2>

                  <p className="support-card-description">
                    Track the status of your submitted tickets
                  </p>

                </div>

                <div className="support-filter-group">

                  <label className="support-search-wrap">
                    <span aria-hidden="true" className="support-search-icon">⌕</span>

                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={search}
                        onChange={(e) => {

                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        className="support-input"
                    />
                  </label>

                  <select
                      aria-label="Filter by priority"
                      value={priority}
                      onChange={(e) => { setPriority(e.target.value); setPage(1); }}
                      className="support-select"
                  >
                    <option value="">All priorities</option>
                    {priorities.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>

                  <select
                      aria-label="Filter by category"
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                      className="support-select"
                  >
                    <option value="">All categories</option>
                    {categories.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>

                  {/* <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                      }}
                      className="support-select"
                  >

                    <option value="">
                      All statuses
                    </option>

                    {STATUSES.map((s) => (
                        <option
                            key={s}
                            value={s}
                        >
                          {s}
                        </option>
                    ))}

                  </select> */}
                  {/* NEW — page size dropdown */}
                  <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value)); // e.target.value is always a string, so convert
                        setPage(1); // reset to page 1, otherwise you might land on an out-of-range page
                      }}
                      className="support-select"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                    <option value={25}>25 per page</option>
                  </select>

                </div>

              </div>

            </div>

            <div className="ticket-quick-filters" aria-label="Filter tickets by status">
              <button type="button" className={`ticket-filter-chip ${status === "" ? "active" : ""}`} onClick={() => { setStatus(""); setPage(1); }} aria-pressed={status === ""}>All tickets</button>
              {STATUSES.map((s) => (
                  <button key={s} type="button" className={`ticket-filter-chip ${status === s ? "active" : ""}`} onClick={() => { setStatus(s); setPage(1); }} aria-pressed={status === s}>{s}</button>
              ))}
              <span className="ticket-result-count">{loading ? "Updating…" : `${total} ${total === 1 ? "ticket" : "tickets"}`}</span>
            </div>

            {/* TABLE */}

            <div className="support-table-wrapper">

              <table className="support-table">

                <thead>

                <tr>

                  <th>Ticket</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Internal Note <span aria-label="Support staff only">🔒</span></th>
                  <th>Action</th>

                </tr>

                </thead>

                <tbody>

                {/* LOADING */}

                {loading && (

                    <tr>

                      <td
                          colSpan="8"
                          className="support-loading"
                      >

                        <div className="support-spinner"></div>

                        Loading your tickets...

                      </td>

                    </tr>

                )}

                {/* EMPTY */}

                {!loading &&
                    currentTickets.length === 0 && (

                        <tr>

                          <td colSpan="8">

                            <div className="support-empty">

                              <div className="support-empty-icon">
                                ?
                              </div>

                              <p className="support-empty-title">
                                {loadError ? "Couldn’t load tickets" : "No tickets found"}
                              </p>

                              <p className="support-empty-text">
                                {loadError ? "Please try again in a moment." : "Try changing your search or filters."}
                              </p>
                              {loadError && <button type="button" className="support-btn support-btn-secondary" onClick={() => { setLoading(true); setLoadError(false); getTickets({ search, status }).then((data) => { setTickets(data.data.tickets || []); setLoading(false); }).catch(() => { setLoadError(true); setLoading(false); }); }}>Try again</button>}



                            </div>

                          </td>

                        </tr>

                    )}

                {/* TICKETS */}

                {!loading &&
                    currentTickets.map((t) => (

                        <tr key={t._id}>

                          {/* TICKET */}

                          <td>

                         <span className="ticket-number">
    {t.ticketNumber}
  </span>


                            <button type="button" className="ticket-id ticket-id-button" onClick={() => openNoteModal(t)} aria-label={`Open internal notes for ticket ${t.ticketNumber}`}>
                              #{t._id}
                            </button>

                          </td>

                          {/* SUBJECT */}

                          <td>

                            {/* <Link
                          href={`/tickets/${t._id}`}
                          className="ticket-subject"
                        > */}
                            {t.subject}
                            {/* </Link> */}

                          </td>

                          {/* CATEGORY */}

                          <td>
                            <span className="ticket-category">{t.category}</span>
                          </td>

                          {/* PRIORITY */}

                          <td>
                        <span className={`ticket-priority ticket-priority-${String(t.priority || "normal").toLowerCase()}`}>
                          <span className="ticket-priority-dot" aria-hidden="true" />
                          {t.priority}
                        </span>
                          </td>

                          {/* STATUS */}

                          <td>

                            <StatusTag
                                status={t.status}
                            />

                          </td>

                          {/* CREATED AT */}

                          <td>
                            <span className="ticket-date">{t.createdAt}</span>
                          </td>

                          <td>
                            <button type="button" className="support-btn support-btn-secondary support-btn-small ticket-internal-note-button" onClick={() => openNoteModal(t)}>
                              <span aria-hidden="true">✎</span> Add internal note
                              {(t.internalNotes?.length || 0) > 0 && <span className="ticket-note-count"> · {t.internalNotes.length}</span>}
                            </button>
                          </td>

                          {/* ACTION */}

                          <td>

                            <button
                                onClick={() => setSelectedTicket(t)}
                                className="support-btn support-btn-secondary support-btn-small"
                            >
                              View →
                            </button>

                          </td>

                        </tr>

                    ))}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}

            {!loading && totalPages > 0 && (

                <div className="support-pagination">

                  <div className="support-pagination-info">

                    Showing{" "}
                    {startIndex + 1}
                    {" "}to{" "}
                    {Math.min(endIndex, total)}
                    {" "}of{" "}
                    {total}
                    {" "}tickets

                  </div>

                  <div className="support-pagination-buttons">

                    {/* PREVIOUS */}

                    <button
                        disabled={page === 1}
                        onClick={() =>
                            setPage((p) => p - 1)
                        }
                        className="support-page-button"
                    >
                      Previous
                    </button>

                    {/* CURRENT PAGE */}

                    <button
                        className="support-page-button active"
                    >
                      {page}
                    </button>

                    {/* NEXT */}

                    <button
                        disabled={page === totalPages}
                        onClick={() =>
                            setPage((p) => p + 1)
                        }
                        className="support-page-button"
                    >
                      Next
                    </button>

                  </div>

                </div>

            )}

          </div>

          {/* HELP CARD */}

          {/* <div className="support-help-card">

            <div>

              <p className="support-help-title">
                Need help with something else?
              </p>

              <p className="support-help-text">
                Submit a new support request and our
                team will get back to you.
              </p>

            </div>

          </div> */}

        </div>

        {selectedTicket && !showConversation &&(
            <TicketDetailsPage
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onViewConversation={() => setShowConversation(true)}
                onTicketUpdated={(updatedTicket) => {
                  setSelectedTicket(updatedTicket);
                  setTickets(current => current.map(ticket => ticket._id === updatedTicket._id ? updatedTicket : ticket));
                }}
            />
        )}
        {/* Conversation */}
        {showConversation && selectedTicket && (
            <ConversationModal
                ticket={selectedTicket}
                onClose={() => setShowConversation(false)}
            />
        )}
        {noteTicket && (
          <div className="agent-modal-backdrop agent-note-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingNote) setNoteTicket(null); }}>
            <section className="agent-modal agent-note-modal" role="dialog" aria-modal="true" aria-labelledby="internal-note-title">
              <button type="button" className="agent-modal-close" onClick={() => setNoteTicket(null)} aria-label="Close internal notes" disabled={savingNote}>×</button>
              <header className="agent-note-header">
                <span className="agent-note-icon" aria-hidden="true">🔒</span>
                <div>
                  <p className="agent-modal-kicker">Support staff only · Ticket ID #{noteTicket._id}</p>
                  <h2 className="agent-modal-title" id="internal-note-title">Internal notes</h2>
                  <p className="agent-note-subtitle">{noteTicket.ticketNumber} · {noteTicket.subject}</p>
                </div>
              </header>
              <div className="agent-note-content">
                <div className="agent-note-history" aria-label="Saved internal notes">
                  {(noteTicket.internalNotes || []).length ? noteTicket.internalNotes.map((item) => (
                    <article className="agent-note-entry" key={item._id}>
                      <p>{item.message}</p>
                      <time dateTime={item.createdAt}>{item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "Just now"}</time>
                    </article>
                  )) : <p className="agent-note-empty">No notes yet. Add an internal note for the support team.</p>}
                </div>
                <label className="agent-note-label" htmlFor="internal-note-input">Add internal note</label>
                <textarea id="internal-note-input" className="agent-note-input" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} rows={4} maxLength={2000} placeholder="Write a private note about this ticket…" />
                <div className="agent-note-helper"><span>Visible to support staff only</span><span>{noteDraft.length}/2000</span></div>
                {noteError && <p className="agent-note-error" role="alert">{noteError}</p>}
              </div>
              <footer className="agent-modal-footer">
                <button type="button" className="agent-button agent-button-secondary" onClick={() => setNoteTicket(null)} disabled={savingNote}>Cancel</button>
                <button type="button" className="agent-button agent-button-primary" onClick={saveInternalNote} disabled={savingNote || !noteDraft.trim()}>{savingNote ? "Saving…" : "Save note"}</button>
              </footer>
            </section>
          </div>
        )}
      </main>
  );
}
