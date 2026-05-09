// src/components/ChatBubble.jsx
export default function ChatBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm ${
          isUser
            ? "bg-gold text-navy rounded-br-sm"
            : "bg-steel text-white rounded-bl-sm"
        }`}
      >
        {/* Audio message */}
        {message.type === "audio" && message.audio ? (
          <audio controls src={message.audio} className="w-full" />
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        )}

        {/* Timestamp */}
        <div className={`text-[10px] mt-2 ${isUser ? "text-navy/70" : "text-iron"}`}>
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}