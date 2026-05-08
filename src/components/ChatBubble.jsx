// src/components/ChatBubble.jsx
// Person C owns this component.
// Renders a single AI or user message bubble.

export default function ChatBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
        {!isUser && (
          <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center mb-1 shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="#0A2647"/>
              <line x1="12" y1="9"  x2="8"  y2="5"  stroke="#0A2647" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="9"  x2="16" y2="5"  stroke="#0A2647" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="15" x2="8"  y2="19" stroke="#0A2647" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="15" x2="16" y2="19" stroke="#0A2647" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed ${
            isUser
              ? "bg-gold text-navy rounded-br-sm font-medium"
              : "bg-steel text-white rounded-bl-sm"
          }`}
        >
          {message.text}
        </div>
        <p className="text-xs text-iron mt-1 px-1">{message.timestamp}</p>
      </div>
    </div>
  );
}