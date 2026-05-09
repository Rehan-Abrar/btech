// src/components/Logo.jsx
import React from "react";

export const IconAxon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill="#D4AF37"/>
    <line x1="12" y1="9"  x2="7"  y2="4"  stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="12" y1="9"  x2="17" y2="4"  stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="12" y1="15" x2="7"  y2="20" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="12" y1="15" x2="17" y2="20" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export default function Logo({ collapsed = false, size = 20, fontSize = "14px" }) {
  return (
    <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
      <IconAxon size={size} />
      {!collapsed && (
        <div>
          <span
            className="text-gold font-semibold tracking-widest uppercase"
            style={{ letterSpacing: "0.12em", fontSize }}
          >
            AXON
          </span>
          <p className="text-iron text-xs font-mono mt-0.5" style={{ fontSize: "10px" }}>
            AI Task Automation
          </p>
        </div>
      )}
    </div>
  );
}
