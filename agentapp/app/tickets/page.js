"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import ConversationModal from '@/app/components/ConversationalModal';

import StatusTag from "@/app/components/StatusTag";
import { getTickets } from "@/lib/api";
import { STATUSES } from "@/lib/statusColors";
import TicketDetailsPage from "@/app/components/TicketDetailsPage";
import InternalNotesModal from "@/app/components/InternalNotesModals";
import Nav       from '@/app/components/Nav';
import { useToast } from '@/context/ToastContext';

// ---------- filter helpers (outside the component so they are not re-created on every render) ----------
const FILTER_KEYS = ["category", "status", "priority"];
const FILTER_LABELS = { category: "Category", status: "Status", priority: "Priority" };
const EMPTY_FILTERS = { category: [], status: [], priority: [] };
const PRIORITY_RANK = { low: 1, medium: 2, normal: 2, high: 3, urgent: 4, critical: 5 };

const norm = (value) => String(value || "").trim().toLowerCase();
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.some((y) => norm(y) === norm(x)));
const dedupe = (list) => {
  const seen = new Map();
  list.forEach((value) => { const key = norm(value); if (key && !seen.has(key)) seen.set(key, value); });
  return [...seen.values()];
};
const matchesFilter = (selected, value) => selected.length === 0 || selected.some((s) => norm(s) === norm(value));

// ---------- reusable multi-select dropdown (panel is portalled so the card's overflow can't clip it) ----------
function MultiSelect({ label, allLabel, options, selected, applied, onChange }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const dirty = !sameSet(selected, applied);

  const place = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const width = Math.min(280, window.innerWidth - 24);
    const next = { top: rect.bottom + 6, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)) };
    setPos((current) => (current.top === next.top && current.left === next.left ? current : next));
  };

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (buttonRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") { setOpen(false); buttonRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const toggleOpen = () => {
    if (!open) place();
    setOpen((value) => !value);
  };

  const toggleValue = (value) => {
    onChange([value]);
  };

  const summary = selected.length === 0
      ? allLabel
      : selected.length <= 2
          ? selected.join(", ")
          : `${selected.slice(0, 2).join(", ")} +${selected.length - 2}`;

  return (
      <>
        <button
            ref={buttonRef}
            type="button"
            className={`agent-ms-trigger${selected.length ? " has-selection" : ""}${dirty ? " is-dirty" : ""}${open ? " is-open" : ""}`}
            aria-haspopup="true"
            aria-expanded={open}
            title={selected.length ? selected.join(", ") : allLabel}
            onClick={toggleOpen}
        >
          <span className="agent-ms-copy">
            <span className="agent-ms-label">{label}{selected.length > 0 && <span className="agent-ms-count">{selected.length}</span>}{dirty && <span className="agent-ms-dirty" title="Not applied yet">Not applied</span>}</span>
            <span className="agent-ms-value">{summary}</span>
          </span>
          <svg aria-hidden="true" className="agent-ms-chevron" viewBox="0 0 20 20" fill="none"><path d="m5 8 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {open && createPortal(
            <div ref={panelRef} className="agent-ms-panel" style={{ top: pos.top, left: pos.left }} role="group" aria-label={`${label} filter options`}>
              <div className="agent-ms-panel-head">
                <span>{label}</span>
              </div>
              <div className="agent-ms-options">
                {options.length === 0 && <p className="agent-ms-empty">No options available</p>}
                {options.map((option) => (
                    <label key={option} className="agent-ms-option">
                      <input type="radio" name={`ticket-filter-${label.toLowerCase()}`} checked={selected.some((s) => norm(s) === norm(option))} onChange={() => toggleValue(option)} />
                      <span>{option}</span>
                    </label>
                ))}
              </div>
            </div>,
            document.body
        )}
      </>
  );
}

// const PAGE_SIZE = 5;
export default function MyTicketsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const [panelMode, setPanelMode] = useState("details");
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const openFullTicketPage = (ticket) => {
    sessionStorage.setItem("agent-full-ticket", JSON.stringify(ticket));
    router.push(`/tickets/${encodeURIComponent(ticket._id)}`);
  };
  const openTicketDetails = (ticket) => {
    if (window.matchMedia("(max-width: 640px)").matches) {
      openFullTicketPage(ticket);
      return;
    }
    setSelectedTicket(ticket);
    setPanelMode("details");
    setNoteTicket(null);
  };
  // This contains ALL tickets returned from backend
  const [tickets, setTickets] = useState([]);

  // searchInput = what the user is typing; search = debounced value sent to the API
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // draftFilters = what is ticked in the dropdowns; appliedFilters = what is actually filtering the table
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  // Current UI page
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [noteTicket, setNoteTicket] = useState(null);
  const [historyTicket, setHistoryTicket] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  const openNoteModal = (ticket) => {
    setSelectedTicket(ticket);
    setPanelMode("notes");
    setNoteTicket(ticket);
    setNoteDraft("");
    setNoteError("");
  };

  const openInternalNotesHistory = (ticket) => {
    setSelectedTicket(ticket);
    setHistoryTicket(ticket);
  };

  // ---------- filter actions ----------
  const setDraft = (key, values) => setDraftFilters((current) => ({ ...current, [key]: values }));

  const applyFilters = () => {
    setAppliedFilters({
      category: [...draftFilters.category],
      status: [...draftFilters.status],
      priority: [...draftFilters.priority],
    });
    setPage(1);
  };

  const clearAllFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const removeAppliedFilter = (key, value) => {
    const drop = (current) => ({ ...current, [key]: current[key].filter((v) => norm(v) !== norm(value)) });
    setAppliedFilters(drop);
    setDraftFilters(drop);
    setPage(1);
  };

  const retryLoadingTickets = async () => {
    setLoading(true);
    setHasLoaded(false);
    try {
      const data = await getTickets({ search, status: "" });
      setTickets(data.data.tickets || []);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setHasLoaded(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1200px)");
    const updateLayout = () => setIsLargeScreen(media.matches);
    updateLayout();
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, []);

  // Debounce: only hit the API ~350ms after the user stops typing
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

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
      setSelectedTicket(updatedTicket);
      setHistoryTicket(current => current && String(current._id) === String(updatedTicket._id) ? updatedTicket : current);
      setNoteDraft("");
      showToast("Notes added successfully");
    } catch (error) {
      setNoteError(error.message || "Could not save note.");
    } finally {
      setSavingNote(false);
    }
  };

  // The API is only called when the SEARCH text changes. Category / status / priority are applied
  // on the loaded list (the endpoint accepts a single status, and the list is already paginated
  // client-side), so clicking Apply or removing a chip never triggers a network request.
  useEffect(() => {
    // Ignore responses from outdated requests (fast typing)
    let active = true;

    setLoading(true);

    getTickets({
      search,
      status: ""
    })
        .then((data) => {
          if (!active) return;

          // Backend is returning:
          // { success: true, message: "Success", data: [...] }

          setTickets(data.data.tickets || []);
          setLoadError(false);
          setHasLoaded(true);
          setLoading(false);
        })
        .catch((error) => {
          if (!active) return;
          console.error(error);
          setLoadError(true);
          setTickets([]);
          setHasLoaded(true);
          setLoading(false);
        });

    return () => {
      active = false;
    };
  }, [search]);

  // -----------------------------------
  // FILTER + PAGINATION LOGIC
  // -----------------------------------

  // Options come from the loaded tickets, plus anything already ticked/applied so it never disappears
  const categoryOptions = dedupe([...tickets.map((t) => t.category || "General"), ...draftFilters.category, ...appliedFilters.category]).sort((a, b) => a.localeCompare(b));
  const statusOptions = dedupe([...STATUSES, ...draftFilters.status, ...appliedFilters.status]);
  const priorityOptions = dedupe([...tickets.map((t) => t.priority || "Normal"), ...draftFilters.priority, ...appliedFilters.priority])
      .sort((a, b) => (PRIORITY_RANK[norm(a)] || 0) - (PRIORITY_RANK[norm(b)] || 0));

  const filteredTickets = tickets.filter((ticket) =>
      matchesFilter(appliedFilters.category, ticket.category || "General") &&
      matchesFilter(appliedFilters.status, ticket.status) &&
      matchesFilter(appliedFilters.priority, ticket.priority || "Normal")
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

  const isDirty = FILTER_KEYS.some((key) => !sameSet(draftFilters[key], appliedFilters[key]));
  const hasAnySelection = FILTER_KEYS.some((key) => draftFilters[key].length || appliedFilters[key].length);
  const hasAppliedFilters = FILTER_KEYS.some((key) => appliedFilters[key].length);
  const activeChips = FILTER_KEYS.flatMap((key) => appliedFilters[key].map((value) => ({ key, value })));

  return (
      <main className="agent-tickets-page">
        <Nav />

        <div className="agent-tickets-container">

          {/* PAGE HEADER */}

          <div className="support-page-header">

            <div>

              <h1 className="support-page-title">
                Ticket inbox
              </h1>

              <p className="support-page-subtitle">
                A clear view of customer requests across your products
              </p>

            </div>



          </div>

          {/* MAIN CARD */}

          <div className={`ticket-workspace-grid${selectedTicket ? " is-split" : ""}`}>
            <div className="support-card">

              {/* CARD HEADER */}

              <div className="support-card-header">

                <div className="support-filters">

                  <div>

                    <h2 className="support-card-title">
                      All requests
                    </h2>

                    <p className="support-card-description">
                      Search, prioritize, and open a request workspace
                    </p>

                  </div>

                  <div className="support-filter-group">

                    <label className="support-search-wrap">
                      <svg aria-hidden="true" className="ticket-search-mark" viewBox="0 0 20 20" fill="none"><circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.6"/><path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>

                      <input
                          type="text"
                          placeholder="Search tickets..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="support-input"
                      />
                    </label>

                    {/* NEW — page size dropdown */}
                    <select
                        aria-label="Tickets per page"
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

              {/* FILTER BAR: pick values (draft), then Apply */}
              <div className="ticket-filter-bar" role="group" aria-label="Ticket filters">
                <MultiSelect label="Category" allLabel="All categories" options={categoryOptions} selected={draftFilters.category} applied={appliedFilters.category} onChange={(values) => setDraft("category", values)} />
                <MultiSelect label="Status" allLabel="All statuses" options={statusOptions} selected={draftFilters.status} applied={appliedFilters.status} onChange={(values) => setDraft("status", values)} />
                <MultiSelect label="Priority" allLabel="All priorities" options={priorityOptions} selected={draftFilters.priority} applied={appliedFilters.priority} onChange={(values) => setDraft("priority", values)} />
                <div className="ticket-filter-bar-actions">
                  {isDirty && <span className="ticket-pending-note" role="status">Changes not applied yet</span>}
                  <button type="button" className="agent-button agent-button-primary" onClick={applyFilters} disabled={!isDirty}>Apply filters</button>
                  <button type="button" className="agent-button agent-button-secondary" onClick={clearAllFilters} disabled={!hasAnySelection}>Clear all</button>
                </div>
              </div>

              {/* ACTIVE (APPLIED) FILTERS */}
              <div className="ticket-active-row" aria-label="Applied filters">
                <span className="ticket-active-title">Active filters</span>
                {hasAppliedFilters ? (
                    <>
                      <div className="ticket-chip-list" role="list">
                        {activeChips.map(({ key, value }) => (
                            <span className="ticket-chip" role="listitem" key={`${key}:${value}`}>
                              <strong>{FILTER_LABELS[key]}:</strong> {value}
                              <button type="button" aria-label={`Remove ${FILTER_LABELS[key]} filter ${value}`} onClick={() => removeAppliedFilter(key, value)}>&times;</button>
                            </span>
                        ))}
                      </div>
                      <button type="button" className="ticket-chip-clear" onClick={clearAllFilters}>Clear all</button>
                    </>
                ) : (
                    <span className="ticket-active-empty">No filters applied</span>
                )}
                <span className="ticket-result-count">{`${total} ${total === 1 ? "ticket" : "tickets"}`}</span>
              </div>

              <div className="support-table-wrapper ticket-inbox-table-wrap" aria-live="polite">
                <table className="support-table ticket-inbox-table">
                  <thead><tr><th>Ticket</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Opened</th><th>Actions</th></tr></thead>
                  <tbody>
                  {loading && !hasLoaded && <tr><td colSpan="7" className="support-loading"><span className="support-spinner" />Loading requests...</td></tr>}
                  {hasLoaded && currentTickets.length === 0 && <tr><td colSpan="7"><div className="support-empty ticket-table-empty"><p className="support-empty-title">{loadError ? "Requests could not be loaded" : "No matching requests"}</p><p className="support-empty-text">{loadError ? "Check your connection and try again." : "Try another search or adjust the filters."}</p>{loadError && <button type="button" className="support-btn support-btn-secondary" onClick={retryLoadingTickets}>Retry</button>}{!loadError && hasAppliedFilters && <button type="button" className="support-btn support-btn-secondary" onClick={clearAllFilters}>Clear all filters</button>}</div></td></tr>}
                  {(hasLoaded || !loading) && currentTickets.map((t) => (
                      <tr className={selectedTicket?._id === t._id ? "is-selected" : ""} key={t._id}>
                        <td><span className="ticket-number">{t.ticketNumber || `#${String(t._id).slice(-6)}`}</span></td>
                        <td><div className="ticket-table-subject">{t.subject || "Untitled request"}</div>{t.description && <div className="ticket-table-preview">{t.description}</div>}</td>
                        <td><span className="ticket-category">{t.category || "General"}</span></td>
                        <td><span className={`ticket-priority ticket-priority-${String(t.priority || "normal").toLowerCase()}`}><span className="ticket-priority-dot" aria-hidden="true" />{t.priority || "Normal"}</span></td>
                        <td><StatusTag status={t.status} /></td>
                        <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                        <td><div className="ticket-table-actions">
                          {/* <button type="button" className="ticket-action-primary" onClick={() => { setSelectedTicket(t); setPanelMode("details"); setNoteTicket(null); }}>View details</button> */}
                          <button
                              type="button"
                              className="ticket-action-primary ticket-action-icon"
                              onClick={() => openTicketDetails(t)}
                              title="View details"
                              aria-label="View details"
                          >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          {/* <button type="button" className="ticket-action-secondary" onClick={() => { setSelectedTicket(t); setPanelMode("conversation"); setNoteTicket(null); }}>Conversation</button> */}
                          {/* <button type="button" className="ticket-action-secondary" onClick={() => openNoteModal(t)}>Notes <span className="ticket-action-count">{t.internalNotes?.length || 0}</span></button> */}
                        </div></td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION (stays mounted during refetch so the card height doesn't jump) */}

              {hasLoaded && total > 0 && (

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
            {selectedTicket && isLargeScreen && <aside className={`ticket-detail-pane is-selected mode-${panelMode}`} aria-label="Selected ticket details">
              {panelMode === "details" && <TicketDetailsPage
                  ticket={selectedTicket}
                  inline
                  onOpenFullPage={() => openFullTicketPage(selectedTicket)}
                  onClose={() => { setSelectedTicket(null); setPanelMode("details"); setNoteTicket(null); }}
                  onViewConversation={() => { setPanelMode("conversation"); setNoteTicket(null); }}
                  onViewInternalNotes={() => openInternalNotesHistory(selectedTicket)}
                  onTicketUpdated={(updatedTicket) => {
                    setSelectedTicket(updatedTicket);
                    setTickets(current => current.map(ticket => String(ticket._id) === String(updatedTicket._id) ? updatedTicket : ticket));
                  }}
              />}
              {panelMode === "conversation" && <ConversationModal ticket={selectedTicket} inline onClose={() => {  setPanelMode("details"); }} />}
              {panelMode === "notes" && noteTicket && <section className="agent-note-panel">
                <header className="agent-note-header">
                  {/* <span className="agent-note-icon" aria-hidden="true">Private</span> */}
                  <div><p className="agent-modal-kicker">Support staff only · {noteTicket.ticketNumber}</p><h2 className="agent-modal-title">Internal notes</h2><p className="agent-note-subtitle">{noteTicket.subject}</p></div>
                  <button type="button" className="agent-modal-close" onClick={() => {  setNoteTicket(null); setPanelMode("details"); }} aria-label="Close internal notes">×</button>
                </header>
                <div className="agent-note-content">
                  {/* <button type="button" className="agent-button agent-button-secondary" onClick={() => openInternalNotesHistory(noteTicket)}>View saved notes ({noteTicket.internalNotes?.length || 0})</button> */}
                  <label className="agent-note-label" htmlFor="internal-note-pane-input">Add internal note</label>
                  <textarea id="internal-note-pane-input" className="agent-note-input" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} rows={4} maxLength={2000} placeholder="Write a private note about this ticket..." />
                  <div className="agent-note-helper"><span>Visible to support staff only</span><span>{noteDraft.length}/2000</span></div>
                  {noteError && <p className="agent-note-error" role="alert">{noteError}</p>}
                </div>
                <footer className="agent-modal-footer">
                  <button type="button" className="agent-button agent-button-secondary" onClick={() => { setNoteTicket(null); setPanelMode("details"); }} disabled={savingNote}>Close</button>
                  <button type="button" className="agent-button agent-button-primary" onClick={saveInternalNote} disabled={savingNote || !noteDraft.trim()}>{savingNote ? "Saving..." : "Save note"}</button>
                </footer>
              </section>}          </aside>}
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
        {selectedTicket && !isLargeScreen && panelMode === "details" && <TicketDetailsPage ticket={selectedTicket} onClose={() => { setSelectedTicket(null); setPanelMode("details"); }} onOpenFullPage={() => openFullTicketPage(selectedTicket)} onViewConversation={() => setPanelMode("conversation")} onViewInternalNotes={() => openInternalNotesHistory(selectedTicket)} onTicketUpdated={(updatedTicket) => { setSelectedTicket(updatedTicket); setTickets(current => current.map(ticket => String(ticket._id) === String(updatedTicket._id) ? updatedTicket : ticket)); }} />}
        {selectedTicket && !isLargeScreen && panelMode === "conversation" && <ConversationModal ticket={selectedTicket} onClose={() => { setPanelMode("details"); }} />}
        {noteTicket && !isLargeScreen && createPortal(
            <div className="agent-modal-backdrop agent-tickets-page agent-modal-portal agent-note-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingNote) { setNoteTicket(null); setSelectedTicket(null); setPanelMode("details"); } }}>
              <section className="agent-modal agent-note-modal" role="dialog" aria-modal="true" aria-labelledby="internal-note-title">
                <button type="button" className="agent-modal-close" onClick={() => { setNoteTicket(null); setSelectedTicket(null); setPanelMode("details"); }} aria-label="Close internal notes" disabled={savingNote}>×</button>
                <header className="agent-note-header">
                  {/* <span className="agent-note-icon" aria-hidden="true">Private</span> */}
                  <div>
                    <p className="agent-modal-kicker"> Ticket ID #{noteTicket._id}</p>
                    <h2 className="agent-modal-title" id="internal-note-title">Internal notes</h2>
                    <p className="agent-note-subtitle"> {noteTicket.subject}</p>
                  </div>
                </header>
                <div className="agent-note-content">
                  {/* <button type="button" className="agent-button agent-button-secondary" onClick={() => openInternalNotesHistory(noteTicket)}>View saved notes ({noteTicket.internalNotes?.length || 0})</button> */}
                  <label className="agent-note-label" htmlFor="internal-note-input">Add internal note</label>
                  <textarea id="internal-note-input" className="agent-note-input" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} rows={4} maxLength={2000} placeholder="Write a private note about this ticket" />
                  <div className="agent-note-helper"><span>Visible to support staff only</span><span>{noteDraft.length}/2000</span></div>
                  {noteError && <p className="agent-note-error" role="alert">{noteError}</p>}
                </div>
                <footer className="agent-modal-footer">
                  <button type="button" className="agent-button agent-button-secondary" onClick={() => { setNoteTicket(null); setSelectedTicket(null); setPanelMode("details"); }} disabled={savingNote}>Cancel</button>
                  <button type="button" className="agent-button agent-button-primary" onClick={saveInternalNote} disabled={savingNote || !noteDraft.trim()}>{savingNote ? "Saving…" : "Save note"}</button>
                </footer>
              </section>
            </div>,
            document.body
        )}
        {historyTicket && <InternalNotesModal ticket={historyTicket} ticketId={historyTicket._id} ticketNumber={historyTicket.ticketNumber} onClose={() => setHistoryTicket(null)} />}
      </main>
  );
}
