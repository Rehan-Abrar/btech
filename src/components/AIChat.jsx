// src/components/AIChat.jsx
// Person C owns this component — production stub for Person A's integration.
// Prop contract: tasks={Task[]}, onEventCreate={fn}, initialPrompt=""

import { useEffect, useRef, useState } from "react";
import ChatBubble from "./ChatBubble";
import { mockResponses, initialMessages } from "../data/mockChats";

const SUGGESTIONS = [
  "Generate my schedule for today",
  "Show high priority tasks",
  "What's overdue?",
  "Create a task: Review PR by tomorrow",
];

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

function getResponse(text) {
  const lower = text.toLowerCase();
  if (lower.includes("schedule")) return mockResponses.schedule;
  if (lower.includes("overdue"))  return mockResponses.overdue;
  if (lower.includes("priority") || lower.includes("high")) return mockResponses.priority;
  if (lower.includes("create") || lower.includes("add"))    return mockResponses.create;
  return mockResponses.default;
}

export default function AIChat({ tasks, onEventCreate, initialPrompt = "" }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef  = useRef(null);

  const send = (text) => {
    if (!text.trim()) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { id: Date.now(), user_id: 1, role: "user", text, timestamp: ts };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Day 2: replace setTimeout with chatWithAI() from api/ai.js
    setTimeout(() => {
      const reply = getResponse(text);
      const aiMsg = { id: Date.now() + 1, user_id: 1, role: "assistant", text: reply, timestamp: ts };
      setMessages(prev => [...prev, aiMsg]);

      // Wire AI schedule → calendar event
      if (text.toLowerCase().includes("schedule") && onEventCreate && tasks.length > 0) {
        onEventCreate({
          id:      Date.now() + 2,
          task_id: tasks[0].id,
          title:   tasks[0].title,
          start:   `${new Date().toISOString().split("T")[0]}T09:00`,
          end:     `${new Date().toISOString().split("T")[0]}T10:00`,
        });
      }
      setLoading(false);
    }, 800);
  };

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-fire initialPrompt (for /ai/schedule route)
  useEffect(() => {
    if (initialPrompt) send(initialPrompt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col fade-in">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="#0A2647"/>
            <line x1="12" y1="9"  x2="8"  y2="5"  stroke="#0A2647" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="9"  x2="16" y2="5"  stroke="#0A2647" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="15" x2="8"  y2="19" stroke="#0A2647" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="15" x2="16" y2="19" stroke="#0A2647" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">AI Assistant</h1>
          <p className="text-xs text-skyblue">Natural language task management</p>
        </div>
        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success live-dot" />
          <span className="text-xs text-iron font-mono">online</span>
        </div>
      </div>

      {/* Chat container */}
      <div
        className="bg-navy rounded-2xl border border-steel flex flex-col overflow-hidden"
        style={{ flex: 1, maxHeight: "calc(100vh - 230px)" }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map(m => <ChatBubble key={m.id} message={m} />)}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="bg-steel rounded-2xl rounded-bl-sm px-5 py-3.5 flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-gold dot-1" />
                <span className="w-2 h-2 rounded-full bg-gold dot-2" />
                <span className="w-2 h-2 rounded-full bg-gold dot-3" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="border-t border-steel px-4 pt-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                id={`ai-suggestion-${s.slice(0, 10).replace(/\s/g, "-").toLowerCase()}`}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-pill border border-steel text-skyblue
                           hover:border-gold hover:text-gold transition-all duration-150"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 pb-4">
            <div className="flex-1 relative flex items-center bg-steel rounded-pill border border-steel focus-within:border-gold transition-all">
              <span className="w-2 h-2 rounded-full bg-success live-dot ml-4 shrink-0" />
              <input
                id="ai-chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send(input)}
                placeholder="Ask me anything about your tasks..."
                className="flex-1 bg-transparent text-white text-sm px-3 py-2.5
                           font-mono placeholder:text-iron
                           focus:outline-none"
              />
            </div>
            <button
              id="ai-send-btn"
              onClick={() => send(input)}
              disabled={loading}
              className="w-10 h-10 rounded-pill bg-gold text-navy flex items-center justify-center
                         hover:brightness-110 active:scale-95 disabled:opacity-40
                         transition-all shrink-0"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}