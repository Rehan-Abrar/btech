// src/components/AIChat.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import ChatBubble from "./ChatBubble";
import { chatWithAI, generateSchedule, getChatHistory } from "../api/ai";

const SUGGESTIONS = [
  "Generate my schedule for today",
  "Show high priority tasks",
  "What's overdue?",
  "Create a task: Review PR by tomorrow",
];

const initialMessages = [
  {
    id: 1,
    role: "assistant",
    text: "Hello! I'm Axon, your AI productivity assistant. I can help you manage tasks, generate schedules, and answer questions about your workload. What would you like to do?",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="9"  y1="22" x2="15" y2="22" />
  </svg>
);

const MicActiveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2.2" />
    <line x1="9"  y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);

// ── Web Speech API hook ───────────────────────────────────────────────────────

function useVoiceInput({ onResult, onError }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript,  setTranscript]  = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setIsSupported(false); return; }

    const recognition = new SpeechRecognition();
    recognition.lang             = "en-US";
    recognition.interimResults   = true;
    recognition.maxAlternatives  = 1;
    recognition.continuous       = false;

    recognition.onstart = () => { setIsListening(true); setTranscript(""); };

    recognition.onresult = (event) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(interim || final);
      if (final) { onResult(final.trim()); setTranscript(""); }
    };

    recognition.onerror = (event) => {
      setIsListening(false); setTranscript("");
      onError(
        event.error === "not-allowed" ? "Microphone access denied. Please allow mic in browser settings." :
        event.error === "no-speech"   ? "No speech detected. Try again." :
        `Voice error: ${event.error}`
      );
    };

    recognition.onend = () => { setIsListening(false); setTranscript(""); };

    recognitionRef.current = recognition;
  }, [onResult, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    try { recognitionRef.current.abort(); recognitionRef.current.start(); } catch (e) {}
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    try { recognitionRef.current.stop(); } catch (e) {}
  }, [isListening]);

  const toggle = useCallback(() => {
    isListening ? stopListening() : startListening();
  }, [isListening, startListening, stopListening]);

  return { isListening, isSupported, transcript, toggle };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIChat({ tasks, onEventCreate, onTaskCreated, initialPrompt = "" }) {
  const [messages,   setMessages]   = useState(initialMessages);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const bottomRef   = useRef(null);
  const sentInitial = useRef(false);

  // Load chat history on mount
  useEffect(() => {
    getChatHistory()
      .then(hist => {
        if (hist && hist.length > 0) {
          const formatted = hist.map((msg, i) => {
            const date = new Date(msg.timestamp);
            const ts = isNaN(date.getTime()) 
              ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return {
              id: Date.now() + i,
              role: msg.role,
              text: msg.message,
              timestamp: ts,
            };
          });
          // Prepend the initial greeting if not already present
          setMessages([initialMessages[0], ...formatted]);
        }
      })
      .catch(console.error);
  }, []);

  const handleVoiceResult = useCallback((text) => {
    setInput(text);
    setVoiceError("");
    setTimeout(() => { send(text); setInput(""); }, 400);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVoiceError = useCallback((msg) => {
    setVoiceError(msg);
    setTimeout(() => setVoiceError(""), 4000);
  }, []);

  const { isListening, isSupported, transcript, toggle } = useVoiceInput({
    onResult: handleVoiceResult,
    onError:  handleVoiceError,
  });

  const displayValue = isListening && transcript ? transcript : input;

  const send = async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || loading) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: trimmed, timestamp: ts }]);
    setInput("");
    setLoading(true);

    try {
      if (trimmed.toLowerCase().includes("schedule")) {
        const data = await generateSchedule();
        const aiMsg = { id: Date.now() + 1, role: "assistant", text: data.summary || "Schedule generated!", timestamp: ts };
        setMessages(prev => [...prev, aiMsg]);
        if (data.events?.length > 0 && onEventCreate) {
          data.events.forEach(e => onEventCreate(e));
        }
      } else {
        const data = await chatWithAI(trimmed);
        const aiMsg = { id: Date.now() + 1, role: "assistant", text: data.reply, timestamp: ts };
        setMessages(prev => [...prev, aiMsg]);
        if (data.createdTask && onTaskCreated) {
          onTaskCreated(data.createdTask);
        }
      }
    } catch (err) {
      const errMsg = { id: Date.now() + 1, role: "assistant", text: "Sorry, I ran into an error. Please try again.", timestamp: ts };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && !sentInitial.current) { sentInitial.current = true; send(initialPrompt); }
  }, [initialPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success live-dot" />
          <span className="text-xs text-iron font-mono">online</span>
        </div>
      </div>

      {/* Chat container */}
      <div
        className="rounded-2xl border border-steel flex flex-col overflow-hidden backdrop-blur-md"
        style={{ flex: 1, maxHeight: "calc(100vh - 230px)", background: "rgba(10,38,71,0.45)" }}
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

        {/* Bottom section */}
        <div className="border-t border-steel px-4 pt-3">

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-pill border border-steel text-skyblue hover:border-gold hover:text-gold transition-all duration-150">
                {s}
              </button>
            ))}
          </div>

          {/* Voice error */}
          {voiceError && (
            <div className="mb-2 px-3 py-2 rounded-lg text-xs font-mono"
              style={{ background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.35)", color: "#ff6b6b" }}>
              🎙 {voiceError}
            </div>
          )}

          {/* Listening banner */}
          {isListening && (
            <div className="mb-2 px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2"
              style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37" }}>
              <span className="flex items-end gap-0.5 h-3">
                {[0.6,1,0.7,1,0.5].map((h, i) => (
                  <span key={i} style={{ display:"inline-block", width:"2px", borderRadius:"1px", background:"#d4af37", height:`${h*12}px`, opacity: 0.8 + i * 0.04 }} />
                ))}
              </span>
              <span>{transcript ? `"${transcript}"` : "listening... speak now"}</span>
              <button onClick={toggle} className="ml-auto text-iron hover:text-white transition-colors" style={{ fontSize:"10px", letterSpacing:"0.05em" }}>
                cancel
              </button>
            </div>
          )}

          {/* Input row */}
          <div className="flex gap-2 pb-4 items-center">
            <div className="flex-1 flex items-center bg-steel rounded-pill border border-steel focus-within:border-gold transition-all">
              <span className="w-2 h-2 rounded-full bg-success live-dot ml-4 shrink-0" />
              <input
                value={displayValue}
                onChange={e => { if (!isListening) setInput(e.target.value); }}
                onKeyDown={e => { if (e.key === "Enter" && !isListening) send(input); }}
                placeholder={isListening ? "speak now..." : "Ask me anything about your tasks..."}
                readOnly={isListening}
                className="flex-1 bg-transparent text-white text-sm px-3 py-2.5 font-mono placeholder:text-iron focus:outline-none"
                style={{ caretColor: isListening ? "transparent" : undefined }}
              />
            </div>

            {/* Mic button */}
            {isSupported && (
              <button onClick={toggle}
                title={isListening ? "Stop voice input" : "Start voice input"}
                className="w-10 h-10 rounded-pill flex items-center justify-center transition-all shrink-0"
                style={{
                  background: isListening ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.06)",
                  border:     isListening ? "1px solid #d4af37"     : "1px solid rgba(255,255,255,0.12)",
                  color:      isListening ? "#d4af37"               : "#87ceeb",
                }}>
                {isListening ? <MicActiveIcon /> : <MicIcon />}
              </button>
            )}

            {/* Send button */}
            <button onClick={() => send(input)} disabled={loading || isListening}
              className="w-10 h-10 rounded-pill bg-gold text-navy flex items-center justify-center hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all shrink-0">
              <SendIcon />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}