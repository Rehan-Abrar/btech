// src/pages/Register.jsx
// Person C owns this component — production version for Person A's routing.

import { useState } from "react";
import { Link } from "react-router-dom";

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

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Student" });

  const fields = [
    { key: "name",     label: "Full name",  type: "text",     ph: "Your full name"    },
    { key: "email",    label: "Email",      type: "email",    ph: "you@axon.app"      },
    { key: "password", label: "Password",   type: "password", ph: "Min 8 characters"  },
  ];

  return (
    <div className="min-h-screen bg-richblack flex items-center justify-center p-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(10,38,71,0.7) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="bg-navy border border-steel rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-0.5 bg-gold w-full" />
          <div className="p-8">
            <AxonLogo />
            <p className="text-center text-skyblue text-sm mb-8">Create your account</p>

            <div className="flex flex-col gap-4">
              {fields.map(({ key, label, type, ph }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-iron uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <input
                    id={`register-${key}`}
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={ph}
                    className={inputClass}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-iron uppercase tracking-wider mb-1.5">
                  I am a...
                </label>
                <select
                  id="register-role"
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className={inputClass}
                >
                  <option value="Student"  className="bg-navy">Student</option>
                  <option value="Manager"  className="bg-navy">Manager</option>
                  <option value="Freelancer" className="bg-navy">Freelancer</option>
                </select>
              </div>

              <button
                id="register-submit-btn"
                className="w-full bg-gold text-navy font-semibold py-3 rounded-pill
                           hover:brightness-110 active:scale-95 transition-all mt-2 text-sm"
              >
                {/* Day 2: wire to register() from api/auth.js */}
                Create account
              </button>
            </div>

            <p className="text-center text-sm text-iron mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-gold hover:underline font-medium">
                Sign in
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