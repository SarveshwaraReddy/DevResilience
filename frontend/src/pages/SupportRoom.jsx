import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import Avatar from "../components/avatar/Avatar";

export default function Room() {
  const { user } = useAuth();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  
  const [partner] = useState(() => {
    const p = sessionStorage.getItem('supportPartner');
    return p ? JSON.parse(p) : null;
  });
  const [role] = useState(() => sessionStorage.getItem('supportRole') || 'seeker');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "system",
      text: "Welcome to your Safe Space session. Everything shared here remains private.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isSpeaking] = useState(true);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect to Socket.io backend
  useEffect(() => {
    if (!roomId) {
      navigate('/dashboard');
      return;
    }

    socketRef.current = io(import.meta.env.VITE_BACKEND_URL || '/');

    // Join the specific support room
    socketRef.current.emit('join_support_room', roomId);

    socketRef.current.on('support_message_received', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId, navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now(),
      sender: user?.name || "Anonymous",
      senderId: user?._id,
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, msg]);
    socketRef.current.emit('support_message', { roomId, message: msg });
    setNewMessage("");
  };

  return (
    <div className="h-[calc(100vh-80px)] flex bg-background -m-8">
      {/* Video/Audio Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 left-6 z-10 font-heading text-primary font-bold tracking-widest text-sm">
          SUPPORT ROOM
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-4 right-6 z-10 flex items-center gap-4 text-tertiary/60">
          <div className="flex items-center gap-2 bg-surface/50 px-3 py-1.5 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary">00:42:15</span>
          </div>
          <button className="hover:text-tertiary transition">
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button className="hover:text-tertiary transition">
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {/* Avatars Area */}
        <div className="flex-1 flex items-center justify-center gap-16 relative">
          {/* Partner */}
          <div className="flex flex-col items-center relative">
            <div
              className={`relative w-48 h-48 rounded-full flex items-center justify-center ${isSpeaking ? "bg-surface shadow-[0_0_30px_rgba(34,211,238,0.2)]" : "bg-surface"}`}
            >
              {/* Speaking Visualizer Ring */}
              {isSpeaking && (
                <div
                  className="absolute inset-[-10px] rounded-full border-2 border-primary border-t-transparent animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              )}
              {isSpeaking && (
                <div
                  className="absolute inset-[-15px] rounded-full border-2 border-primary/40 border-b-transparent animate-spin"
                  style={{
                    animationDuration: "4s",
                    animationDirection: "reverse",
                  }}
                />
              )}

              {partner ? (
                <Avatar seed={partner.avatar?.seed || partner.name} style={partner.avatar?.style || 'lorelei'} size={180} className="rounded-full z-10 bg-surface-hover" />
              ) : (
                <div className="w-[180px] h-[180px] rounded-full bg-surface-hover flex items-center justify-center text-5xl font-heading text-tertiary/20 z-10">
                  ?
                </div>
              )}

              {/* Badge */}
              <div className="absolute -bottom-4 bg-primary text-background text-[10px] font-bold px-3 py-1 rounded-full border-2 border-background z-20">
                CONNECTED
              </div>
            </div>

            <div className="mt-8 text-center">
              <h3 className="font-heading font-bold text-lg">
                {partner?.name || "Searching..."}
              </h3>
              <span className="text-xs text-tertiary/50 uppercase tracking-widest mt-1 block">
                {role === 'seeker' ? 'Listener' : 'Seeker'}
              </span>
            </div>
          </div>

          {/* You */}
          <div className="flex flex-col items-center">
            {user ? (
              <Avatar seed={user.avatar?.seed || user.name} style={user.avatar?.style || 'lorelei'} size={180} className="rounded-full border border-white/5 bg-surface z-10" />
            ) : (
              <div className="w-48 h-48 rounded-full bg-surface border border-white/5 flex items-center justify-center text-3xl font-heading text-tertiary/20">
                YOU
              </div>
            )}
            <div className="mt-8 text-center">
              <h3 className="font-heading font-bold text-lg text-tertiary/80">
                {user?.name || "You"}
              </h3>
              <span className="text-xs text-tertiary/40 uppercase tracking-widest mt-1 block">
                {role === 'seeker' ? 'Seeker' : 'Listener'}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="h-24 flex items-center justify-center pb-6">
          <div className="glass px-6 py-3 rounded-full flex items-center gap-4">
            <button className="flex flex-col items-center gap-1 w-16 text-tertiary/60 hover:text-tertiary transition">
              <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <span className="text-[9px] uppercase tracking-wider">Mute</span>
            </button>
            <button className="flex flex-col items-center gap-1 w-16 text-tertiary/60 hover:text-tertiary transition">
              <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-[9px] uppercase tracking-wider">Video</span>
            </button>
            <button className="flex flex-col items-center gap-1 w-16 text-tertiary/60 hover:text-tertiary transition">
              <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <span className="text-[9px] uppercase tracking-wider">Share</span>
            </button>
            <div className="w-[1px] h-8 bg-white/10 mx-2" />
            <button className="flex flex-col items-center gap-1 w-16 text-primary hover:text-primary/80 transition">
              <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <span className="text-[9px] uppercase tracking-wider">
                Record
              </span>
            </button>
            <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-1 w-16 text-red-500 hover:text-red-400 transition">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 04-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                  />
                </svg>
              </div>
              <span className="text-[9px] uppercase tracking-wider">Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Chat */}
      <div className="w-80 border-l border-white/5 bg-surface flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-heading text-sm text-tertiary/80 mb-1">
            LIVE SESSION
          </h3>
          <span className="text-[10px] text-primary uppercase">
            2 Members Active
          </span>
        </div>

        <div className="flex border-b border-white/5 text-xs font-label">
          <button className="flex-1 py-3 border-b-2 border-primary text-primary flex items-center justify-center gap-2">
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            CHAT
          </button>
          <button className="flex-1 py-3 text-tertiary/50 hover:text-tertiary transition flex items-center justify-center gap-2">
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            PARTICIPANTS
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className="flex flex-col"
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className={`text-[10px] uppercase tracking-widest font-bold ${msg.sender === "system" ? "text-tertiary/30" : msg.senderId === user?._id ? "text-primary" : "text-secondary"}`}
                >
                  {msg.sender === "system" ? "" : msg.sender}
                </span>
                <span className="text-[9px] text-tertiary/30">{msg.time}</span>
              </div>
              <div
                className={`p-3 rounded-xl text-sm ${msg.sender === "system" ? "bg-white/5 text-tertiary/60 text-center italic" : "bg-background border border-white/5 text-tertiary/80"}`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-white/5 bg-surface mt-auto">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-background border border-white/10 rounded-lg py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-tertiary/30"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-tertiary/40 hover:text-primary transition-colors"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
