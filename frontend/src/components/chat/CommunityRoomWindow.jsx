import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../avatar/Avatar';

export default function CommunityRoomWindow({ room, user, socket, onOpenSidebar }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { token } = useAuth();

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    // Fetch previous messages
    fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/chat/rooms/${room.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setMessages(data.data);
        scrollToBottom();
      }
    });

    if (socket) {
      socket.emit('join-room', room.id);

      const handleMessage = (msg) => {
        if (msg.roomId === room.id) {
          setMessages((prev) => {
            if (prev.find(m => m._id === msg._id)) return prev;
            
            const existingOpt = prev.find(m => m.text === msg.text && 
              m.senderId === msg.senderId && 
              m._id.toString().length < 20);
              
            if (existingOpt) {
              return prev.map(m => m === existingOpt ? msg : m);
            }
            return [...prev, msg];
          });
          scrollToBottom();
        }
      };

      socket.on('receive-message', handleMessage);

      return () => {
        socket.off('receive-message', handleMessage);
      };
    }
  }, [room.id, socket, token]);


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageObj = {
      roomId: room.id,
      senderId: user._id,
      senderName: user.name,
      text: newMessage,
      createdAt: new Date().toISOString(),
      _id: Date.now().toString() // Temp ID
    };

    setMessages(prev => [...prev, messageObj]);
    scrollToBottom();

    socket.emit('send-message', messageObj);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Header */}
      <div className="h-20 px-6 border-b border-white/5 flex items-center gap-4 bg-surface/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/5 text-tertiary"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${room.color} bg-opacity-10 border border-${room.color.split('-')[1]}/30`}>
          <span className="text-2xl">{room.icon}</span>
        </div>
        <div>
          <h3 className="font-heading font-bold text-lg leading-tight">{room.name}</h3>
          <p className="text-xs text-tertiary/50">{room.description}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-tertiary/40">
            <span className="text-4xl mb-4">{room.icon}</span>
            <p className="text-sm">Welcome to the {room.name} room!</p>
            <p className="text-xs mt-1">Be the first to say hello.</p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const senderId = msg.senderId?._id || msg.senderId;
          const isMe = senderId === user._id;
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const prevSenderId = prevMsg ? (prevMsg.senderId?._id || prevMsg.senderId) : null;
          const showAvatar = !prevMsg || prevSenderId !== senderId;
          
          return (
            <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-3`}>
              {!isMe && showAvatar ? (
                <div className="flex flex-col items-center">
                  <Avatar seed={msg.senderName} size={32} className="rounded-full shrink-0" />
                </div>
              ) : (!isMe && <div className="w-8 shrink-0"></div>)}
              
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && showAvatar && (
                  <span className="text-[10px] font-bold text-tertiary/70 ml-1 mb-1">{msg.senderName}</span>
                )}
                <div 
                  className={`px-5 py-3 rounded-2xl ${
                    isMe 
                      ? 'bg-primary text-background rounded-br-sm shadow-[0_4px_20px_rgba(34,211,238,0.2)]' 
                      : 'bg-surface border border-white/10 text-tertiary rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[10px] text-tertiary/40 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface/50 border-t border-white/5 shrink-0">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${room.name}...`}
            className="w-full bg-background border border-white/10 rounded-full py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-tertiary/30"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="absolute right-2 p-2 bg-primary text-background rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:hover:bg-primary"
          >
            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
