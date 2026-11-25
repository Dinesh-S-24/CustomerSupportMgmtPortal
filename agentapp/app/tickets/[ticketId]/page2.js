"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ConversationModal from "@/app/components/ConversationalModal";
import TicketDetailsPage from "@/app/components/TicketDetailsPage";
import TicketLifecycle from "@/app/components/TicketLifecycle";
import Nav from "@/app/components/Nav";
import { getTickets } from "@/lib/api";

const DUMMY_INTERNAL_NOTES = [
  { id: "sample-note-1", author: "Maya Chen", role: "Support Agent", createdAt: "11 Nov 2026, 09:15", message: "Reproduced the sign-in issue on the customer's browser. The reset link works after clearing the saved session." },
  { id: "sample-note-2", author: "Jordan Patel", role: "Senior Support", createdAt: "11 Nov 2026, 10:05", message: "Customer follow-up is due this afternoon. Please confirm whether the new password remains active after they sign out and back in." },
  { id: "sample-note-3", author: "Amara Okafor", role: "Support Agent", createdAt: "11 Nov 2026, 10:42", message: "Handing over to the next shift: logs show two failed verification attempts before the successful reset. No account lockout is present." },
];

export default function FullTicketPage() {
  const { ticketId } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteError, setNoteError] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [pageNotes, setPageNotes] = useState(DUMMY_INTERNAL_NOTES);
  const [activeTab, setActiveTab] = useState("conversation");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [ticketId]);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousNavHeight = root.style.getPropertyValue("--ticket-workspace-nav-height");
    const hadLockClass = root.classList.contains("ticket-workspace-scroll-lock");
    const hadBodyLockClass = body.classList.contains("ticket-workspace-scroll-lock");
    root.classList.add("ticket-workspace-scroll-lock");
    body.classList.add("ticket-workspace-scroll-lock");

    const nav = document.querySelector(".agent-portal-nav");
    const updateNavHeight = () => {
      const height = nav?.getBoundingClientRect().height || 70;
      root.style.setProperty("--ticket-workspace-nav-height", `${height}px`);
    };
    updateNavHeight();
    window.addEventListener("resize", updateNavHeight);
    const observer = nav && typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateNavHeight) : null;
    observer?.observe(nav);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateNavHeight);
      if (!hadLockClass) root.classList.remove("ticket-workspace-scroll-lock");
      if (!hadBodyLockClass) body.classList.remove("ticket-workspace-scroll-lock");
      if (previousNavHeight) root.style.setProperty("--ticket-workspace-nav-height", previousNavHeight);
      else root.style.removeProperty("--ticket-workspace-nav-height");
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1200px)");
    const updateLayout = () => {
      const compact = media.matches;
      setIsCompact(compact);
    };
    updateLayout();
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    setActiveTab(isCompact ? "details" : "conversation");
    if (!isCompact) setSidebarCollapsed(false);
  }, [isCompact]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setTicket(null);
    setPageNotes(DUMMY_INTERNAL_NOTES);
    setActiveTab(typeof window !== "undefined" && window.matchMedia("(max-width: 1200px)").matches ? "details" : "conversation");
    setSidebarCollapsed(typeof window !== "undefined" && window.matchMedia("(max-width: 1000px)").matches);
    setNoteDraft("");
    const selectTicket = (selected) => {
      if (!active || !selected) return;
      setTicket(selected);
    };
    try {
      const cached = JSON.parse(sessionStorage.getItem("agent-full-ticket") || "null");
      if (String(cached?._id) === String(ticketId)) {
        selectTicket(cached);
        setLoading(false);
      }
    } catch { /* continue with the ticket request when the cache is unavailable */ }
    getTickets().then((result) => {
      if (!active) return;
      const found = (result.data?.tickets || []).find((item) => String(item._id) === String(ticketId));
      if (found) selectTicket(found);
      else {
        try {
          const cached = JSON.parse(sessionStorage.getItem("agent-full-ticket") || "null");
          if (String(cached?._id) === String(ticketId)) selectTicket(cached);
        } catch { /* ignore invalid cache */ }
      }
    }).catch(() => {
      if (!active) return;
      try {
        const cached = JSON.parse(sessionStorage.getItem("agent-full-ticket") || "null");
        if (String(cached?._id) === String(ticketId)) selectTicket(cached);
      } catch { /* ignore invalid cache */ }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [ticketId]);

  const updateTicket = (updated) => {
    setTicket(updated);
    try { sessionStorage.setItem("agent-full-ticket", JSON.stringify(updated)); } catch { /* keep the in-memory ticket current */ }
  };

  const addNote = async (event) => {
    event.preventDefault();
    const message = noteDraft.trim();
    if (!message || savingNote) return;
    setSavingNote(true);
    setNoteError("");
    try {
      const response = await fetch("/api/ticketaddinternalnote", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: ticket._id, internal_note: message }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not save note.");
      const saved = result.data;
      const createdAt = new Date().toLocaleString("en-IN");
      const newNote = { id: `ticket-${ticket._id}-${Date.now()}`, ticketId: ticket.ticketNumber || ticket._id, author: sessionStorage.getItem("forlogin") || "Support Agent", role: "Support Agent", createdAt, message };
      const existing = Array.isArray(ticket.internalNotes) ? ticket.internalNotes : [];
      setTicket({ ...ticket, ...saved, internalNotes: [...existing, { message, createdAt: new Date().toISOString() }] });
      setPageNotes((current) => current.some((note) => note.id === newNote.id) ? current : [...current, newNote]);
      setNoteDraft("");
      setActiveTab("notes");
    } catch (error) { setNoteError(error.message || "Could not save note."); }
    finally { setSavingNote(false); }
  };

  if (loading) return <><Nav /><main className="agent-full-ticket-page"><p className="ticket-workspace-state">Loading ticket details…</p></main></>;
  if (!ticket) return <><Nav /><main className="agent-full-ticket-page"><section className="ticket-workspace-state"><p>Ticket details are unavailable.</p><button type="button" className="agent-button agent-button-secondary" onClick={() => router.push("/tickets")}>Back to tickets</button></section></main></>;

  return (
      <>
        <Nav />
        <main className="agent-full-ticket-page ticket-workspace-page">
          <header className="ticket-workspace-header">
            {/* <div className="ticket-workspace-meta" aria-label="Ticket summary">
            <span><small>Category</small><strong>{ticket.category || "Uncategorized"}</strong></span>
            <span><small>Assigned agent</small><strong>{ticket.assignedAgentId || "Unassigned"}</strong></span>
            <span><small>Created</small><strong>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Date unavailable"}</strong></span>
          </div> */}
          </header>

          <div className="ticket-workspace-split">
            {!isCompact && <aside className={`ticket-workspace-sidebar${sidebarCollapsed ? " is-collapsed" : ""}`}>
              <div className="ticket-workspace-sidebar-heading">
                <div><p className="agent-modal-kicker">Ticket context</p><h2>Ticket &amp; details</h2></div>
                <button type="button" className="ticket-sidebar-toggle" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} aria-expanded={!sidebarCollapsed} aria-controls="ticket-sidebar-content">
                  {sidebarCollapsed ? "Show details" : "Hide details"}
                </button>
              </div>
              <div className="ticket-workspace-sidebar-content" id="ticket-sidebar-content" tabIndex={0} aria-label="Scrollable ticket and customer details">
                <TicketDetailsPage ticket={ticket} inline hideActions />
                <section className="ticket-workspace-description" aria-labelledby="ticket-description-heading">
                  <h3 id="ticket-description-heading">Ticket description</h3>
                  <textarea className="ticket-workspace-description-text" aria-label="Ticket description" value={ticket.description || "No description provided."} rows={3} readOnly />
                </section>

                <TicketLifecycle ticket={ticket} onTicketUpdated={updateTicket} />
              </div>
            </aside>}

            <section className="ticket-workspace-main" aria-label="Ticket communication workspace">
              <div className="ticket-workspace-tabs" role="tablist" aria-label="Ticket communication">
                {isCompact && <button id="ticket-details-tab" type="button" role="tab" aria-selected={activeTab === "details"} aria-controls="ticket-details-panel" className={activeTab === "details" ? "is-active" : ""} onClick={() => setActiveTab("details")}>Details</button>}
                <button id="ticket-conversation-tab" type="button" role="tab" aria-selected={activeTab === "conversation"} aria-controls="ticket-conversation-panel" className={activeTab === "conversation" ? "is-active" : ""} onClick={() => setActiveTab("conversation")}>Conversation</button>
                <button id="ticket-notes-tab" type="button" role="tab" aria-selected={activeTab === "notes"} aria-controls="ticket-notes-panel" className={activeTab === "notes" ? "is-active" : ""} onClick={() => setActiveTab("notes")}><span aria-hidden="true">🔒 </span>Internal Notes <span className="ticket-tab-count">{pageNotes.length}</span></button>
                <button id="ticket-add-note-tab" type="button" role="tab" aria-selected={activeTab === "add-note"} aria-controls="ticket-add-note-panel" className={activeTab === "add-note" ? "is-active" : ""} onClick={() => setActiveTab("add-note")}>＋ Add internal note</button>
              </div>

              {isCompact && <section id="ticket-details-panel" className="ticket-workspace-panel ticket-workspace-details" role="tabpanel" aria-labelledby="ticket-details-tab" hidden={activeTab !== "details"}>
                <div className="ticket-workspace-details-scroll">
                  <TicketDetailsPage ticket={ticket} inline hideActions />
                  <section className="ticket-workspace-description" aria-labelledby="ticket-details-description-heading">
                    <h3 id="ticket-details-description-heading">Ticket description</h3>
                    <textarea className="ticket-workspace-description-text" aria-label="Ticket description" value={ticket.description || "No description provided."} rows={3} readOnly />
                  </section>
                  <TicketLifecycle ticket={ticket} onTicketUpdated={updateTicket} />
                </div>
              </section>}

              <section id="ticket-conversation-panel" className="ticket-workspace-panel ticket-workspace-conversation" role="tabpanel" aria-labelledby="ticket-conversation-tab" hidden={activeTab !== "conversation"}>
                <ConversationModal ticket={ticket} inline active={activeTab === "conversation"} autoScroll={false} onClose={() => {}} />
              </section>

              <section id="ticket-notes-panel" className="ticket-workspace-panel ticket-workspace-notes" role="tabpanel" aria-labelledby="ticket-notes-tab" hidden={activeTab !== "notes"}>
                <header className="ticket-notes-heading">
                  <div><p className="agent-modal-kicker">🔒 Support staff only · {pageNotes.length} notes</p><h2>Internal notes</h2></div>
                  <span className="ticket-notes-private-badge">Private</span>
                </header>
                <div className="ticket-notes-history" tabIndex={0} aria-label="Scrollable internal notes history">
                  {pageNotes.length ? pageNotes.map((note, index) => {
                    const author = note.author || "Support Agent";
                    return <article className="agent-internal-note-card" key={`${ticket._id}-${note.id || note._id || index}`}>
                      <div className="agent-internal-note-card-top">
                        <div className="agent-internal-note-author-avatar" aria-hidden="true">{author.split(/\s+/).map((part) => part[0]).join("")}</div>
                        <div className="agent-internal-note-author"><strong>{author}</strong>{note.role && <span>{note.role}</span>}</div>
                        {note.createdAt && <time>{note.createdAt}</time>}
                      </div>
                      <p>{note.message || note.internal_note || "No note content provided."}</p>
                    </article>;
                  }) : <p className="ticket-notes-empty">No internal notes have been added for this ticket.</p>}
                </div>
              </section>

              <section id="ticket-add-note-panel" className="ticket-workspace-panel ticket-workspace-add-note" role="tabpanel" aria-labelledby="ticket-add-note-tab" hidden={activeTab !== "add-note"}>
                <header className="ticket-notes-heading">
                  <div><p className="agent-modal-kicker">🔒 Support staff only</p><h2>Add internal note</h2></div>
                  <span className="ticket-notes-private-badge">Private</span>
                </header>
                <form className="agent-note-content ticket-workspace-add-note-form" onSubmit={addNote}>
                  <label className="agent-note-label" htmlFor="full-ticket-note">Note for your support team</label>
                  <textarea id="full-ticket-note" className="agent-note-input" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} rows={5} maxLength={2000} placeholder="Write a private note about this ticket…" aria-describedby="full-ticket-note-help" />
                  <div className="agent-note-helper" id="full-ticket-note-help">
                    {noteError ? <span className="agent-note-error" role="alert">{noteError}</span> : <span>Visible to support staff only</span>}
                    <span>{noteDraft.length}/2000</span>
                  </div>
                  <button className="agent-button agent-button-primary" type="submit" disabled={savingNote || !noteDraft.trim()}>{savingNote ? "Adding…" : "Add internal note"}</button>
                </form>
              </section>
            </section>
          </div>
        </main>
      </>
  );
}
