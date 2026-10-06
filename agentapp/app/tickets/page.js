"use client";

import { useEffect, useState } from "react";
import ConversationModal from '@/app/components/ConversationalModal';

import StatusTag from "@/app/components/StatusTag";
import { getTickets } from "@/lib/api";
import { STATUSES } from "@/lib/statusColors";
import TicketDetailsPage from "@/app/components/TicketDetailsPage";
import Nav       from '@/app/components/Nav';

// const PAGE_SIZE = 5;
export default function MyTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const [showConversation, setShowConversation] = useState(false);
  // This contains ALL tickets returned from backend
  const [tickets, setTickets] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // Current UI page
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

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

  const total = tickets.length;

  const totalPages = Math.max(
      1,
      Math.ceil(total / pageSize)
  );

  const startIndex = (page - 1) * pageSize;

  const endIndex = startIndex + pageSize;

  const currentTickets = tickets.slice(
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
                  <th>Action</th>

                </tr>

                </thead>

                <tbody>

                {/* LOADING */}

                {loading && (

                    <tr>

                      <td
                          colSpan="7"
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

                          <td colSpan="7">

                            <div className="support-empty">

                              <div className="support-empty-icon">
                                ?
                              </div>

                              <p className="support-empty-title">
                                {loadError ? "Couldn’t load tickets" : "No tickets found"}
                              </p>

                              <p className="support-empty-text">
                                {loadError ? "Please try again in a moment." : "Try changing your search or status filter."}
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


                            <div className="ticket-id">
                              #{t._id}
                            </div>

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
      </main>
  );
}
