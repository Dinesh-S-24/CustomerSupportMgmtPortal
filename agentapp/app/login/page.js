"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";

/* ── Small icon set (SVG attributes only, all styling lives in global CSS) ── */
const MailIcon = () => (
    <svg className="agent-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 8 8 6 8-6" />
    </svg>
);

const LockIcon = () => (
    <svg className="agent-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="10" width="16" height="10" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
);

const EyeIcon = ({ off }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        {off && <path d="M4 4l16 16" />}
    </svg>
);

const AlertIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16.5v.01" />
    </svg>
);

export default function AgentLoginPage() {
    const router = useRouter();
    const [email,        setEmail]        = useState("");
    const [password,     setPassword]     = useState("");
    const [error,        setError]        = useState("");
    const [loading,      setLoading]      = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Enter your email and password to continue.");
            return;
        }

        setLoading(true);

        try {
            const data = await loginUser(email, password);
            sessionStorage.setItem("forlogin", data.data.user._id);
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));
console.log("the suudsu",data);
            router.push("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="agent-login-page">
            <div className="agent-login-frame">
                <div className="agent-login-shell">

                    {/* ── Left: showcase ── */}
                    <section className="agent-showcase" aria-label="About the agent console">
                        <div className="agent-brand">
                            <div className="agent-brand-mark">S</div>
                            <span className="agent-brand-name">Support Agent Console</span>
                        </div>

                        <div>
                            <h2 className="agent-showcase-title">
                                Your assigned tickets, ready when you are.
                            </h2>
                            <p className="agent-showcase-text">
                                See what your admin assigned to you, reply to customers,
                                and move each ticket to resolved from one place.
                            </p>
                        </div>

                        <div className="agent-ticket-stack" aria-hidden="true">
                            <div className="agent-ticket">
                                <div>
                                    <div className="agent-ticket-id">TCK-2041</div>
                                    <div className="agent-ticket-title">Refund not received</div>
                                </div>
                                <span className="agent-pill">Assigned</span>
                            </div>
                            <div className="agent-ticket">
                                <div>
                                    <div className="agent-ticket-id">TCK-2038</div>
                                    <div className="agent-ticket-title">Wrong item delivered</div>
                                </div>
                                <span className="agent-pill agent-pill-progress">Resolved</span>
                            </div>
                            {/* <div className="agent-ticket">
                                <div>
                                    <div className="agent-ticket-id">TCK-2029</div>
                                    <div className="agent-ticket-title">Wrong item delivered</div>
                                </div>
                                <span className="agent-pill agent-pill-resolved">Resolved</span>
                            </div> */}
                        </div>
                    </section>

                    {/* ── Right: form ── */}
                    <section className="agent-form-side">
                        <div className="agent-form-inner">
                            <h1 className="agent-form-title">Agent sign in</h1>
                            <p className="agent-form-subtitle">
                                Use the email and password your admin set up for you.
                            </p>

                            <form onSubmit={handleSubmit} noValidate>

                                {/* Email */}
                                <div className="agent-field">
                                    <label className="agent-label" htmlFor="agent-email">
                                        Work email
                                    </label>
                                    <div className="agent-input-wrap">
                                        <MailIcon />
                                        <input
                                            id="agent-email"
                                            type="email"
                                            autoComplete="username"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="agent@company.com"
                                            className="agent-input"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="agent-field">
                                    <div className="agent-label-row">
                                        <label className="agent-label" htmlFor="agent-password">
                                            Password
                                        </label>
                                        <a href="/forgot-password" className="agent-link">
                                            Forgot password?
                                        </a>
                                    </div>
                                    <div className="agent-input-wrap">
                                        <LockIcon />
                                        <input
                                            id="agent-password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="agent-input"
                                        />
                                        <button
                                            type="button"
                                            className="agent-toggle-btn"
                                            onClick={() => setShowPassword(v => !v)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            <EyeIcon off={showPassword} />
                                        </button>
                                    </div>
                                </div>

                                {/* Error */}
                                {/* {error && (
                                    <div className="agent-error" role="alert">
                                        <AlertIcon />
                                        <span>{error}</span>
                                    </div>
                                )} */}
{/* Error (slot is always reserved so the layout never jumps) */}
<div className="agent-error-slot">
    {error && (
        <div className="agent-error" role="alert">
            <AlertIcon />
            <span>{error}</span>
        </div>
    )}
</div>
                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="agent-submit"
                                >
                                    <span className="agent-submit-content">
                                        {loading && <span className="agent-spinner" />}
                                        {loading ? "Signing in…" : "Sign in to console"}
                                    </span>
                                </button>
                            </form>

                            <p className="agent-form-footer">
                                Agent accounts are created by your admin.
                                Can&apos;t sign in? Ask your admin to reset your access.
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </main>
    );
}
