"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  useEffect(() => {
    // let active = true;

    setLoading(true);

    getTickets({
      search,
      status
    })
      .then((data) => {
        console.log("the data for now is", data);

        // if (!active) return;

        // Backend is returning:
        // { success: true, message: "Success", data: [...] }

        setTickets(data.data.tickets || []);

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);

        // if (active) {
        //   setTickets([]);
        //   setLoading(false);
        // }
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
    <main className="support-page">
      <Nav />

      <div className="support-container">

        {/* PAGE HEADER */}

        <div className="support-page-header">

          <div>

            <h1 className="support-page-title">
              My Tickets
            </h1>

            <p className="support-page-subtitle">
              View and track your support requests
            </p>

          </div>

          <Link
            href="/tickets/new"
            className="support-btn support-btn-primary"
          >
            <span>+</span>
            Raise a Ticket
          </Link>

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

                <select
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

                </select>
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
                  <th>Assigned Agent</th>
                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {/* LOADING */}

                {loading && (

                  <tr>

                    <td
                      colSpan="12"
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

                      <td colSpan="12">

                        <div className="support-empty">

                          <div className="support-empty-icon">
                            ?
                          </div>

                          <p className="support-empty-title">
                            No tickets found
                          </p>

                          <p className="support-empty-text">
                            Try changing your status filter.
                          </p>

                          <Link
                            href="/tickets/new"
                            className="support-help-link"
                          >
                            Raise a new ticket
                          </Link>

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
                        {t.category}
                      </td>

                      {/* PRIORITY */}

                      <td>
                        {t.priority}
                      </td>

                      {/* STATUS */}

                      <td>

                        <StatusTag
                          status={t.status}
                        />

                      </td>

                      {/* CREATED AT */}

                      <td>
                        {t.createdAt}
                      </td>

                      {/* ASSIGNED AGENT */}

                      <td>
                        {t.assignedAgentId}
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

        <div className="support-help-card">

          <div>

            <p className="support-help-title">
              Need help with something else?
            </p>

            <p className="support-help-text">
              Submit a new support request and our
              team will get back to you.
            </p>

          </div>

        </div>

      </div>

      {selectedTicket && !showConversation &&(
        <TicketDetailsPage
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)} onViewConversation={() => setShowConversation(true)}
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