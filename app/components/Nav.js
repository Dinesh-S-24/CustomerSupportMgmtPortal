"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from '@/context/ToastContext';

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tickets", label: "My tickets" },
  { href: "/tickets/new", label: "New ticket" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
    const { showToast }    = useToast();

  useEffect(() => {
    function loadUser() {
      const stored = sessionStorage.getItem("user") || localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    }

    loadUser();
    window.addEventListener("auth-change", loadUser);
    return () => window.removeEventListener("auth-change", loadUser);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

 async function handleLogout() {
    const res = await fetch("/api/logout", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      showToast(data.message);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setUser(null);
      window.dispatchEvent(new Event("auth-change"));
      router.push("/login");
    }
  }
//       const stored2= localStorage.getItem("user");

// console.log("the user details zain are"+stored2)
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <header className="support-nav">
      <div className="support-nav-inner">
        <Link href="/dashboard" className="support-brand-wrapper" aria-label="Support home">
          <span className="support-brand-icon" aria-hidden="true">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3a9 9 0 1 0 9 9M12 3v4m0-4 3 3m6 6h-4m4 0-3 3M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8M3 12h4m-4 0 3-3m6 8v2m0-2a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
            </svg>
          </span>
          <span className="support-brand-copy">
            <span className="support-nav-brand-text">Support</span>
            <span className="support-brand-caption">CUSTOMER PORTAL</span>
          </span>
        </Link>
        <button
          className="support-mobile-toggle"
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="support-navigation"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>
        <div id="support-navigation" className={`support-nav-right${mobileOpen ? " support-nav-right--open" : ""}`}>
          <nav className="support-nav-links" aria-label="Main navigation">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`support-nav-link${active ? " support-nav-link--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="support-account" ref={menuRef}>
            <button className="support-account-trigger" type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
              <span className="support-account-avatar">{initial}</span>
              <span className="support-account-name">{user?.name || "Account"}</span>
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
              <div className="support-account-menu" role="menu">
                <div className="support-account-menu-header">
                  <p className="support-account-menu-name">{user?.name || "Customer"}</p>
                  <p className="support-account-menu-email">{user?.email || ""}</p>
                </div>
                <button className="support-account-menu-logout" role="menuitem" onClick={handleLogout}>
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
