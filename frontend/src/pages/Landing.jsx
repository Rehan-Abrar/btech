// src/pages/Landing.jsx
// AXON landing page (original implementation inspired by the provided layout).

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import gradiantBg from "../gradiant.png";
import Logo from "../components/Logo";
import image1 from "../image1.jpeg";
import image2 from "../image2.jpeg";

export default function Landing() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const stats = useMemo(
    () => [
      { value: "students", label: "students" },
      { value: "freelancers", label: "freelancers" },
      { value: "teams", label: "teams" },
    ],
    []
  );

  return (
    <div className="relative min-h-screen bg-[#05070C]">
      {/* Fixed/static gradient background (always visible) */}
      <div
        className="fixed inset-0 z-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${gradiantBg})`,
          backgroundSize: "contain",
          backgroundColor: "#05070C",
        }}
        aria-hidden="true"
      />

      {/* Scrollable content overlay */}
      <div className="relative z-10 min-h-screen" style={{ background: "rgba(0,0,0,0.40)" }}>
        {/* Top nav */}
        <header className="max-w-6xl mx-auto px-6 pt-6">
          <nav className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 text-white font-medium"
              aria-label="AXON"
            >
              <Logo size={24} fontSize="18px" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-pill px-5 py-2 text-sm font-medium bg-gold text-navy hover:brightness-110 active:scale-95 transition"
            >
              Get started →
            </button>
          </nav>
        </header>

        {/* Hero */}
        <main className="max-w-6xl mx-auto px-6 pt-20 pb-10">
          <section className="text-center">
            <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight leading-tight">
              intelligence that turns tasks
              <br />
              into a plan.
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-sm md:text-base text-iron leading-relaxed">
              Built for students, freelancers, and teams—AXON auto-prioritizes your workload,
              generates recurring tasks safely, and keeps Kanban + Calendar in sync with clear
              reasoning for every change.
            </p>

            {/* Prompt bar */}
            <div className="mt-10 flex items-center justify-center">
              <div
                className="w-full max-w-2xl rounded-full border border-steel px-4 py-3 flex items-center gap-3"
                style={{ background: "rgba(10,38,71,0.55)", backdropFilter: "blur(10px)" }}
              >
                <span className="w-2 h-2 rounded-full bg-success" />
                <input
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-iron"
                  placeholder="automate my weekly reporting…"
                />
                <button
                  type="button"
                  onClick={() => navigate("/ai")}
                  className="w-10 h-10 rounded-full border border-steel text-gold hover:border-gold transition grid place-items-center"
                  aria-label="Ask AXON"
                  title="Ask AXON"
                >
                  →
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-pill px-10 py-3 bg-gold text-navy text-sm font-semibold hover:brightness-110 active:scale-95 transition"
              >
                Launch dashboard
              </button>

              <button
                type="button"
                onClick={() => navigate("/ai")}
                className="rounded-pill px-10 py-3 border border-steel text-white/90 text-sm font-semibold hover:border-white/30 hover:text-white transition"
                style={{ background: "rgba(0,0,0,0.10)" }}
              >
                Chat with Axon
              </button>
            </div>

            {/* Stats strip */}
            <div
              className="mt-16 rounded-2xl border border-steel px-6 py-4"
              style={{ background: "rgba(10,38,71,0.35)", backdropFilter: "blur(10px)" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-center gap-3 py-1"
                  >
                    <div className="text-sm font-semibold text-gold capitalize">{s.value}</div>
                    <div className="text-xs text-iron">•</div>
                    <div className="text-xs text-iron capitalize">built for {s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Immersive image sections */}
          <section className="mt-16 space-y-8">
            {/* 1: right-aligned copy */}
            <div
              className="relative overflow-hidden rounded-3xl border border-steel"
              style={{ background: "rgba(10,38,71,0.25)" }}
            >
              <div
                className="absolute inset-0 bg-center bg-cover"
                style={{ backgroundImage: `url(${image1})`, opacity: 0.55 }}
              />
              <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
              <div className="relative min-h-[60vh] md:min-h-[72vh] flex items-center justify-end px-6 md:px-12 py-12">
                <div className="max-w-xl text-right">
                  <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
                    study sessions that stay on track.
                  </h2>
                  <p className="mt-4 text-sm md:text-base text-iron leading-relaxed">
                    For students: AXON breaks the chaos into a ranked plan—deadlines first,
                    recurring assignments handled, and your calendar always current.
                  </p>
                </div>
              </div>
            </div>

            {/* 2: left-aligned copy */}
            <div
              className="relative overflow-hidden rounded-3xl border border-steel"
              style={{ background: "rgba(10,38,71,0.25)" }}
            >
              <div
                className="absolute inset-0 bg-center bg-cover"
                style={{ backgroundImage: `url(${image2})`, opacity: 0.55 }}
              />
              <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
              <div className="relative min-h-[60vh] md:min-h-[72vh] flex items-center justify-start px-6 md:px-12 py-12">
                <div className="max-w-xl text-left">
                  <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
                    client work, instantly prioritized.
                  </h2>
                  <p className="mt-4 text-sm md:text-base text-iron leading-relaxed">
                    For freelancers: AXON flags urgency, de-risks due dates, and explains its
                    reasoning—so you always know what to ship next.
                  </p>
                </div>
              </div>
            </div>

            {/* 3: right-aligned copy */}
            <div
              className="relative overflow-hidden rounded-3xl border border-steel"
              style={{ background: "rgba(10,38,71,0.25)" }}
            >
              <div
                className="absolute inset-0 bg-center bg-cover"
                style={{ backgroundImage: `url(${image1})`, opacity: 0.55 }}
              />
              <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
              <div className="relative min-h-[60vh] md:min-h-[72vh] flex items-center justify-end px-6 md:px-12 py-12">
                <div className="max-w-xl text-right">
                  <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
                    one source of truth for teams.
                  </h2>
                  <p className="mt-4 text-sm md:text-base text-iron leading-relaxed">
                    For teams: combine Kanban execution with calendar visibility and
                    AI-assisted prioritization—without losing context.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Feature cards (top) */}
          <section id="platform" className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "smart reprioritization",
                  desc:
                    "when urgent work lands, axon recalculates what matters most using due dates, priority, and status—then shows exactly what changed and why.",
                },
                {
                  title: "recurrence engine",
                  desc:
                    "create a repeating task once (daily/weekly/monthly, interval, days, end date). axon generates the next occurrence only, prevents duplicates, and keeps your list clean.",
                },
                {
                  title: "unified execution view",
                  desc:
                    "track progress on kanban, see deadlines on calendar, and get workload signals on the dashboard—so planning and execution stay connected in one system.",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-steel p-6 backdrop-blur-md"
                  style={{ background: "rgba(10,38,71,0.50)" }}
                >
                  <div className="text-gold text-sm mb-3">⎯</div>
                  <h3 className="text-white font-semibold text-sm capitalize">{c.title}</h3>
                  <p className="text-xs text-iron mt-3 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <section id="solutions" className="mt-20 pb-14 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
              join the elite automation tier.
            </h2>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter operational email"
                className="w-full sm:w-96 px-6 py-3 rounded-pill outline-none border border-steel text-sm text-white placeholder:text-iron"
                style={{ background: "rgba(10,38,71,0.45)" }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!email.trim()) return;
                  alert("Access request captured (demo).");
                  setEmail("");
                }}
                className="w-full sm:w-auto rounded-pill px-12 py-3 bg-gold text-navy text-sm font-semibold hover:brightness-110 active:scale-95 transition"
              >
                secure access
              </button>
            </div>

            {/* anchors for nav */}
            <div id="pricing" />
            <div id="docs" />
          </section>
        </main>
      </div>
    </div>
  );
}