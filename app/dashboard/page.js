"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusTag from "@/app/components/StatusTag";
import { getTickets } from "@/lib/api";
import Nav       from '@/app/components/Nav';

export default function DashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    high: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getTickets({ page: 1 });

        console.log("the tickets are", res);

        const res2 = res.data.tickets;
        const total = res.data.total;

        const open = res2.filter(
          (x) => x.status === "Open"
        ).length;

        const resolved = res2.filter(
          (x) => x.status === "Resolved"
        ).length;

        const high = res2.filter(
          (x) => x.priority === "High"
        ).length;

        setCounts({
          total,
          open,
          resolved,
          high,
        });

        setTickets(res2.slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const statCards = [
    {
      label: "Total tickets",
      value: counts.total,
      icon: "ti-ticket",
      badge: "All",
      type: "total",
    },
    {
      label: "Open tickets",
      value: counts.open,
      icon: "ti-clock",
      badge: "Pending",
      type: "open",
    },
    {
      label: "Resolved tickets",
      value: counts.resolved,
      icon: "ti-circle-check",
      badge: "Done",
      type: "resolved",
    },
    {
      label: "High priority",
      value: counts.high,
      icon: "ti-alert-triangle",
      badge: "Urgent",
      type: "high",
    },
  ];

  const resolvedPct = counts.total
    ? Math.round((counts.resolved / counts.total) * 100)
    : 0;

  const openPct = counts.total
    ? Math.round((counts.open / counts.total) * 100)
    : 0;

  const highPct = counts.total
    ? Math.round((counts.high / counts.total) * 100)
    : 0;

  return (
    <main className="support-page">

      <Nav />

      <div className="support-container">

        {/* PAGE HEADER */}

        <div className="support-page-header">

          <div>
            <p className="support-dashboard-welcome">
              Welcome back
            </p>

            <h1 className="support-page-title">
              Support dashboard
            </h1>
          </div>

          <Link
            href="/tickets"
            className="support-btn support-btn-primary"
          >
            View tickets
          </Link>

        </div>


        {/* STAT CARDS */}

        <div className="support-dashboard-stats">

          {statCards.map((card) => (

            <div
              key={card.label}
              className="support-dashboard-stat-card"
            >

              <div className="support-dashboard-stat-top">

                <div
                  className={`support-dashboard-stat-icon ${card.type}`}
                >
                  <i
                    className={`ti ${card.icon}`}
                    aria-hidden="true"
                  />
                </div>

                <span
                  className={`support-dashboard-stat-badge ${card.type}`}
                >
                  {card.badge}
                </span>

              </div>

              <p className="support-dashboard-stat-value">
                {loading ? "–" : card.value}
              </p>

              <p className="support-dashboard-stat-label">
                {card.label}
              </p>

            </div>

          ))}

        </div>


        {/* BOTTOM GRID */}

        <div className="support-dashboard-grid">

          {/* RECENT TICKETS */}

          <div className="support-card support-dashboard-recent">

            <div className="support-card-header">

              <div>
                <h2 className="support-card-title">
                  Recent tickets
                </h2>

                <p className="support-card-description">
                  Your latest support requests
                </p>
              </div>

              {/* <Link
                href="/tickets"
                className="support-dashboard-view-all"
              >
                View all →
              </Link> */}

            </div>


            {/* LOADING */}

            {loading && (

              <div className="support-dashboard-message">
                Loading tickets...
              </div>

            )}


            {/* EMPTY */}

            {!loading && tickets.length === 0 && (

              <div className="support-dashboard-message">

                <p>
                  No tickets yet.
                </p>

                <Link href="/tickets/new">
                  Raise one →
                </Link>

              </div>

            )}


            {/* TICKETS */}

            {!loading && tickets.length > 0 && (

              <div className="support-dashboard-ticket-list">

                {tickets.map((t, i) => (

                  <div
                    key={t._id}
                    className={`support-dashboard-ticket ${
                      i < tickets.length - 1
                        ? "support-dashboard-ticket-border"
                        : ""
                    }`}
                  >

                    <div className="support-dashboard-ticket-info">

                      <p className="support-dashboard-ticket-subject">
                        {t.subject}
                      </p>

                      <p className="support-dashboard-ticket-meta">
                        {t.ticketNumber} · {t.category}
                      </p>

                    </div>

                    <StatusTag status={t.status} />

                  </div>

                ))}

              </div>

            )}

          </div>


          {/* RIGHT COLUMN */}

          <div className="support-dashboard-right">


            {/* STATUS BREAKDOWN */}

            <div className="support-card support-dashboard-breakdown">

              <h2 className="support-card-title">
                Status breakdown
              </h2>


              {[
                {
                  label: "Resolved",
                  pct: resolvedPct,
                  type: "resolved",
                },
                {
                  label: "Open",
                  pct: openPct,
                  type: "open",
                },
                {
                  label: "High priority",
                  pct: highPct,
                  type: "high",
                },
              ].map((row) => (

                <div
                  key={row.label}
                  className="support-dashboard-progress-row"
                >

                  <div className="support-dashboard-progress-header">

                    <span>
                      {row.label}
                    </span>

                    <strong>
                      {loading ? "–" : `${row.pct}%`}
                    </strong>

                  </div>

                  <div className="support-dashboard-progress">

                    <div
                      className={`support-dashboard-progress-bar ${row.type}`}
                      style={{
                        width: loading
                          ? "0%"
                          : `${row.pct}%`,
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>


            {/* HELP CARD */}

            <div className="support-dashboard-help-card">

              <i
                className="ti ti-headset support-dashboard-help-icon"
                aria-hidden="true"
              />

              <p className="support-dashboard-help-title">
                Need help?
              </p>

              <p className="support-dashboard-help-text">
                Our support team responds within 24 hours.
              </p>

              <Link
                href="/tickets/new"
                className="support-dashboard-help-button"
              >
                Raise a ticket →
              </Link>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}