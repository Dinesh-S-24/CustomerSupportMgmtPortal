"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error,    setError]    = useState("");
    const [loading,  setLoading]  = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Enter your email and password to continue.");
            return;
        }

        setLoading(true);

        try {
            const data = await loginUser(email, password, rememberMe);
            // localStorage.setItem("token", data.token);
            sessionStorage.setItem("forlogin",data.data.user._id);
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem("token", data.data.token);
            storage.setItem("user", JSON.stringify(data.data.user));
            if (!rememberMe) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
            window.dispatchEvent(new Event("auth-change"));

            console.log('the id si',data);
            //changed from dashboardforcsms to tickets
           
            router.push("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="support-page support-login-page"
              style={{ minHeight: '100vh',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center' }}>

            <div className="support-login-shell" style={{ width: '100%', maxWidth: '400px', padding: '0 16px' }}>

                {/* ── Brand / Logo area ── */}
                {/* ── Card — matches support-card ── */}
                <div className="support-card support-login-card" style={{ padding: '28px' }}>

                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div style={{ marginBottom: '16px' }}>
                                          <div className="support-login-heading" style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div className="support-login-mark" style={{
                        width:          '44px',
                        height:         '44px',
                        borderRadius:   '10px',
                        background:     '#0F766E',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        margin:         '0 auto 12px',
                        color:          '#fff',
                        fontSize:       '20px',
                        fontWeight:     '600'
                    }}>
                        S
                    </div>
                    <h1 style={{
                        fontSize:   '20px',
                        fontWeight: '600',
                        color:      '#1A2130',
                        margin:     '0 0 4px'
                    }}>
                        Sign in to Support
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color:    '#64748b',
                        margin:   0
                    }}>
                        Track and manage your support tickets
                    </p>
                </div>


                            <label style={{
                                display:    'block',
                                fontSize:   '13px',
                                fontWeight: '500',
                                color:      '#475569',
                                marginBottom:'6px'
                            }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="support-input"
                                style={{ width: '93%' }}
                                autoComplete="username"
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '8px' }}>
                            <div style={{
                                display:        'flex',
                                justifyContent: 'space-between',
                                alignItems:     'center',
                                marginBottom:   '6px'
                            }}>
                                <label style={{
                                    fontSize:   '13px',
                                    fontWeight: '500',
                                    color:      '#475569'
                                }}>
                                    Password
                                </label>
                                <a href="/forgot-password" style={{
                                    fontSize:       '12px',
                                    color:          '#0F766E',
                                    textDecoration: 'none'
                                }}>
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="support-input"
                                style={{ width: '93%' }}
                                autoComplete="current-password"
                            />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', marginTop: '12px' }}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                            />
                            Keep me signed in
                        </label>

                        {/* Error message */}
                        {error && (
                            <div style={{
                                background:   '#fef2f2',
                                border:       '1px solid #fecaca',
                                borderRadius: '8px',
                                padding:      '10px 14px',
                                marginTop:    '12px',
                                marginBottom: '4px',
                                display:      'flex',
                                alignItems:   'center',
                                gap:          '8px'
                            }}>
                                <span style={{ color: '#ef4444', fontSize: '14px' }}>⚠</span>
                                <p style={{
                                    fontSize: '13px',
                                    color:    '#dc2626',
                                    margin:   0
                                }}>
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="support-btn support-btn-primary"
                            style={{
                                width:     '100%',
                                marginTop: '20px',
                                padding:   '11px',
                                fontSize:  '14px',
                                opacity:   loading ? 0.65 : 1,
                                cursor:    loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? (
                                <span style={{
                                    display:    'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    <span className="support-spinner"
                                          style={{ width: '14px', height: '14px' }}>
                                    </span>
                                    Signing in…
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>

                    </form>

                </div>

                {/* ── Footer note ── */}
                <p style={{
                    textAlign: 'center',
                    fontSize:  '13px',
                    color:     '#94a3b8',
                    marginTop: '20px'
                }}>
                    Don't have an account?{' '}
                    <a href="/register" style={{
                        color:          '#0F766E',
                        fontWeight:     '500',
                        textDecoration: 'none'
                    }}>
                        Contact support
                    </a>
                </p>

            </div>
        </main>
    );
}
