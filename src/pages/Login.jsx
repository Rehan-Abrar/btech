// src/pages/Login.jsx
// Person C owns this component — production version for Person A's routing.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const inputClass = `
  w-full bg-steel border border-steel/60 text-white text-sm rounded-xl
  px-4 py-3 placeholder:text-iron font-mono
  focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30
  transition-all
`;

const AxonLogo = () => (
  <div className="flex items-center gap-2 justify-center mb-2">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3.5" fill="#D4AF37"/>
      <line x1="12" y1="8.5" x2="7"  y2="3"  stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="8.5" x2="17" y2="3"  stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="15.5" x2="7"  y2="21" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="15.5" x2="17" y2="21" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
    <span className="text-gold font-semibold tracking-widest uppercase text-lg" style={{ letterSpacing: "0.12em" }}>
      AXON
    </span>
  </div>
);

export default function Login({ onLogin }) {
  const [form,  setForm]  = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    // Day 2: replace with login() from api/auth.js + JWT storage
    onLogin();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-richblack flex items-center justify-center p-4">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(10,38,71,0.7) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-navy border border-steel rounded-2xl shadow-2xl overflow-hidden">
          {/* Gold accent top bar */}
          <div className="h-0.5 bg-gold w-full" />

          <div className="p-8">
            <AxonLogo />
            <p className="text-center text-skyblue text-sm mb-8">Sign in to your workspace</p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-alert/10 border border-alert/30 text-alert text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-iron uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@axon.app"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-iron uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              <button
                id="login-submit-btn"
                onClick={handleSubmit}
                className="w-full bg-gold text-navy font-semibold py-3 rounded-pill
                           hover:brightness-110 active:scale-95 transition-all mt-2 text-sm"
              >
                Sign in
              </button>
            </div>

            <p className="text-center text-sm text-iron mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-gold hover:underline font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-iron mt-6 font-mono">
          axon · your work, wired for intelligence.
        </p>
      </div>
    </div>
  );
}