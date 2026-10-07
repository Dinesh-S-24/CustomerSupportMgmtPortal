"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from '@/context/ToastContext';

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tickets", label: "My tickets" }
  // ,
  // { href: "/tickets/new", label: "New ticket" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const menuRef = useRef(null);
    const { showToast }    = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 async function handleLogout() {
    const res=  await fetch("/api/logout", {
    method: "POST",
  });
console.log("the res is",res);
if(res.ok){
      const data = await res.json();

            showToast(data.message);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    router.push("/login");

}
  }
//       const stored2= localStorage.getItem("user");

// console.log("the user details zain are"+stored2)
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <header className="support-nav agent-portal-nav">
      <div className="support-nav-inner">
        <Link href="/dashboard" className="support-brand-wrapper" aria-label="Support Agent Console home">
          <span className="support-brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
              <path d="M4 13H3v4a2 2 0 0 0 2 2h1v-6H4Zm16 0h1v4a2 2 0 0 1-2 2h-1v-6h2Z" />
              <path d="M8 20h5" />
            </svg>
          </span>
          <span className="support-brand-copy">
            <span className="support-nav-brand-text">Support Agent</span>
            <span className="support-nav-brand-caption">SERVICE CONSOLE</span>
          </span>
        </Link>
        <div className="support-nav-right">
          <button
            type="button"
            className={`support-nav-toggle${navOpen ? " is-open" : ""}`}
            onClick={() => setNavOpen((wasOpen) => !wasOpen)}
            aria-expanded={navOpen}
            aria-controls="support-primary-navigation"
            aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <span />
            <span />
            <span />
          </button>

          <nav id="support-primary-navigation" className={`support-nav-links${navOpen ? " is-open" : ""}`} aria-label="Primary navigation">
            {LINKS.map((link) => {
              const active = pathname === link.href || (
                link.href === "/tickets" &&
                pathname.startsWith("/tickets/") &&
                !pathname.startsWith("/tickets/new")
              );
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? "support-nav-link--active" : "support-nav-link"}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setNavOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="support-account" ref={menuRef}>
            <button
              type="button"
              className="support-account-trigger"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-haspopup="true"
              aria-label={`Account menu for ${user?.name || "your account"}`}
            >
              <span className="support-account-avatar">{initial}</span>
              <span className="support-account-copy">
                <span className="support-account-name">{user?.name || "Account"}</span>
                {/* <span className="support-account-caption">Agent account</span> */}
              </span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className={`support-account-caret${open ? " support-account-caret--open" : ""}`}
              >
                <path
                  d="M1 3L5 7L9 3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {open && (
              <div className="support-account-menu">
                <div className="support-account-menu-header">
                  <p className="support-account-menu-name">{user?.name || "Customer"}</p>
                  <p className="support-account-menu-email">{user?.email || ""}</p>
                </div>
                <button className="support-account-menu-logout" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
