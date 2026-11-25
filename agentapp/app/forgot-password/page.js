export default function ForgotPasswordPage() {
  return (
    <main className="agent-forgot-page">
      <section className="agent-forgot-card" aria-labelledby="forgot-password-title">
        <div className="agent-brand agent-forgot-brand">
          <div className="agent-brand-mark">S</div>
          <span className="agent-brand-name">Support Agent Console</span>
        </div>

        <h1 id="forgot-password-title" className="agent-form-title">Forgot password?</h1>
        <form className="agent-forgot-form">
          <div className="agent-field">
            <label className="agent-label" htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="agent@company.com"
              className="agent-input agent-forgot-input"
              required
            />
          </div>
          <button type="submit" className="agent-submit">
            <span className="agent-submit-content">Submit</span>
          </button>
        </form>
      </section>
    </main>
  );
}
