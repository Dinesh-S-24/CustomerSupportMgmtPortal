"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Nav from "@/app/components/Nav";
import { getTickets } from "@/lib/api";
import { STATUSES } from "@/lib/statusColors";

const DASHBOARD_STATUSES = STATUSES.filter((status) => status !== "Open");

const STATUS_META = {
  Assigned: { icon: "assigned", tone: "assigned", note: "Ready for an agent" },
  "In Progress": { icon: "progress", tone: "progress", note: "Being worked on" },
  "Waiting for Customer": { icon: "waiting", tone: "waiting", note: "Customer response needed" },
  Resolved: { icon: "resolved", tone: "resolved", note: "Issue taken care of" },
  Closed: { icon: "closed", tone: "closed", note: "Conversation complete" },
};

function StatusIcon({ name }) {
  const paths = {
    assigned: <><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 9h8M8 13h5" /></>,
    progress: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    waiting: <><path d="M7 4h10M7 20h10" /><path d="M8 4c0 4 8 4 8 8s-8 4-8 8" /></>,
    resolved: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    closed: <><rect x="4" y="5" width="16" height="14" rx="3" /><path d="M8 10h8M8 14h5" /></>,
    open: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
    pulse: <><path d="M3 12h4l2-6 4 12 2-6h6" /></>,
  };
  return <span className="dashboard-status-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.pulse}</svg></span>;
}

export default function DashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getTickets()
      .then((response) => {
        if (active) setTickets(response.data.tickets || []);
      })
      .catch((loadError) => {
        console.error("Could not load dashboard tickets", loadError);
        if (active) setError(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => Object.fromEntries(
    DASHBOARD_STATUSES.map((status) => [status, tickets.filter((ticket) => ticket.status === status).length])
  ), [tickets]);
  const activeCount = tickets.filter((ticket) => !["Resolved", "Closed"].includes(ticket.status)).length;
  const completion = tickets.length ? Math.round(((tickets.length - activeCount) / tickets.length) * 100) : 0;
  const latestTickets = [...tickets].slice(-5).reverse();

  return <main className="agent-dashboard-page">
    <Nav />
    <div className="agent-dashboard-shell">
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-copy">
          <span className="dashboard-eyebrow"><span className="dashboard-live-dot" /> SUPPORT OPERATIONS</span>
          <h1>Your support, <span>in sync.</span></h1>
          <p>A clear view of every ticket and what needs attention next.</p>
        </div>
        <div className="dashboard-welcome-actions">
          <Link href="/tickets" className="dashboard-primary-link">Explore tickets <span aria-hidden="true">→</span></Link>
          <div className="dashboard-updated"><span className="dashboard-live-dot" aria-hidden="true" /> Live ticket overview</div>
        </div>
        <div className="dashboard-orb dashboard-orb-one" aria-hidden="true" />
        <div className="dashboard-orb dashboard-orb-two" aria-hidden="true" />
      </section>

      <section className="dashboard-overview" aria-label="Ticket overview">
        <div className="dashboard-section-heading">
          <div><span className="dashboard-section-kicker">AT A GLANCE</span><h2>Ticket pulse</h2></div>
          <span className="dashboard-total-pill"><strong>{loading ? "—" : tickets.length}</strong> total tickets</span>
        </div>
        <div className="dashboard-summary-grid">
          <article className="dashboard-summary-card dashboard-summary-total">
            <div className="dashboard-summary-top"><span className="dashboard-summary-label">Active workload</span><StatusIcon name="pulse" /></div>
            <div className="dashboard-summary-value">{loading ? "—" : activeCount}<span> tickets</span></div>
            <p>Across all open stages</p>
            <div className="dashboard-progress-track"><span style={{ width: `${tickets.length ? Math.max(8, (activeCount / tickets.length) * 100) : 0}%` }} /></div>
            <div className="dashboard-summary-foot"><span>{completion}% completed</span><span>{loading ? "Loading" : `${tickets.length - activeCount} done`}</span></div>
          </article>
          <article className="dashboard-summary-card dashboard-summary-resolved">
            <div className="dashboard-summary-top"><span className="dashboard-summary-label">Resolved & closed</span><StatusIcon name="resolved" /></div>
            <div className="dashboard-summary-value">{loading ? "—" : counts.Resolved + counts.Closed}<span> tickets</span></div>
            <p>Successfully wrapped up</p>
            <div className="dashboard-resolved-split"><span><i className="tone-resolved" />{loading ? "—" : counts.Resolved} resolved</span><span><i className="tone-closed" />{loading ? "—" : counts.Closed} closed</span></div>
          </article>
        </div>
      </section>

      <section className="dashboard-status-section" aria-labelledby="dashboard-status-heading">
        <div className="dashboard-section-heading">
          <div><span className="dashboard-section-kicker">THE WORKFLOW</span><h2 id="dashboard-status-heading">Every stage, one view</h2></div>
          <span className="dashboard-heading-note">Ticket distribution by status</span>
        </div>
        <div className="dashboard-status-grid">
          {DASHBOARD_STATUSES.map((status, index) => {
            const meta = STATUS_META[status];
            return <Link href="/tickets" key={status} className={`dashboard-status-card dashboard-tone-${meta.tone}`} style={{ "--card-order": index }}>
              <div className="dashboard-status-card-top"><StatusIcon name={meta.icon} /><span className="dashboard-status-arrow" aria-hidden="true">→</span></div>
              <span className="dashboard-status-count">{loading ? "—" : counts[status]}</span>
              <strong>{status}</strong>
              <span className="dashboard-status-note">{meta.note}</span>
              <span className="dashboard-status-track"><i style={{ width: `${tickets.length ? Math.max(counts[status] ? 10 : 0, (counts[status] / tickets.length) * 100) : 0}%` }} /></span>
            </Link>;
          })}
        </div>
      </section>

      <section className="dashboard-recent-section" aria-labelledby="dashboard-recent-heading">
        <div className="dashboard-section-heading">
          <div><span className="dashboard-section-kicker">RECENT ACTIVITY</span><h2 id="dashboard-recent-heading">Latest tickets</h2></div>
          <Link href="/tickets" className="dashboard-text-link">View all tickets <span aria-hidden="true">→</span></Link>
        </div>
        <div className="dashboard-recent-card">
          {loading ? <div className="dashboard-empty-state">Gathering your latest tickets…</div> : error ? <div className="dashboard-empty-state">Couldn’t load the dashboard. <button type="button" onClick={() => window.location.reload()}>Try again</button></div> : latestTickets.length ? <div className="dashboard-recent-list">
            {latestTickets.map((ticket) => {
              const meta = STATUS_META[ticket.status] || STATUS_META.Closed;
              return <div className="dashboard-recent-row" key={ticket._id}>
                <div className={`dashboard-recent-icon dashboard-tone-${meta.tone}`}><StatusIcon name={meta.icon} /></div>
                <div className="dashboard-recent-main"><strong>{ticket.subject || "Untitled ticket"}</strong><span>{ticket.ticketNumber} <i /> {ticket.category || "General"}</span></div>
                <span className={`dashboard-status-badge dashboard-tone-${meta.tone}`}>{ticket.status}</span>
                <span className="dashboard-recent-date">{ticket.createdAt || "—"}</span>
              </div>;
            })}
          </div> : <div className="dashboard-empty-state">No tickets yet. Your next conversation will show up here.</div>}
        </div>
      </section>
      <footer className="dashboard-footer"><span>SUPPORT AGENT CONSOLE</span><span>Thoughtful support starts with a clear view.</span></footer>
    </div>
  </main>;
}
