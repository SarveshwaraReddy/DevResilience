import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../avatar/Avatar';

export default function ChatWindow({ conversation, user, socket, onOpenSidebar }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const { token } = useAuth();
  const typingTimeoutRef = useRef(null);

  const otherUser = conversation.participants.find(p => p._id !== user._id);

  useEffect(() => {
    // Fetch messages
    fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/chat/${conversation._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setMessages(data.data);
        scrollToBottom();
      }
    });

    // Socket joins
    if (socket) {
      socket.emit('join_chat', conversation._id);

      const handleMessage = (msg) => {
        if (msg.conversationId === conversation._id) {
          setMessages(prev => {
            if (prev.find(m => m._id === msg._id)) return prev;
            
            const existingOpt = prev.find(m => m.text === msg.text && 
              ((m.senderId._id && msg.senderId._id && m.senderId._id === msg.senderId._id) || 
               (m.senderId === msg.senderId._id)) && 
              m._id.toString().length < 20);
              
            if (existingOpt) {
              return prev.map(m => m === existingOpt ? msg : m);
            }
            return [...prev, msg];
          });
          scrollToBottom();
        }
      };

      const handleTyping = (userId) => {
        if (userId === otherUser._id) {
          setTypingUser(otherUser);
        }
      };

      const handleStopTyping = (userId) => {
        if (userId === otherUser._id) {
          setTypingUser(null);
        }
      };

      socket.on('message_received', handleMessage);
      socket.on('typing', handleTyping);
      socket.on('stop_typing', handleStopTyping);

      return () => {
        socket.off('message_received', handleMessage);
        socket.off('typing', handleTyping);
        socket.off('stop_typing', handleStopTyping);
      };
    }
  }, [conversation._id, token, socket, otherUser._id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', { roomId: conversation._id, userId: user._id });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('stop_typing', { roomId: conversation._id, userId: user._id });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage;
    setNewMessage('');
    
    // Optimistic UI
    const tempMsg = {
      _id: Date.now().toString(),
      conversationId: conversation._id,
      senderId: user,
      text: messageText,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();
    
    if (socket) {
      socket.emit('stop_typing', { roomId: conversation._id, userId: user._id });
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      socket.emit('send_message', {
        conversationId: conversation._id,
        senderId: user._id,
        text: messageText
      });
    }
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
        <Avatar seed={otherUser?.name || 'User'} size={44} className="rounded-full bg-background border border-white/10" />
        <div>
          <h3 className="font-heading font-bold text-lg leading-tight">{otherUser?.name}</h3>
          {typingUser && <p className="text-xs text-primary animate-pulse">typing...</p>}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user._id || (msg.senderId && msg.senderId._id === user._id);
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
          
          return (
            <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-3`}>
              {!isMe && showAvatar ? (
                <Avatar seed={otherUser?.name} size={32} className="rounded-full shrink-0 mt-auto" />
              ) : (!isMe && <div className="w-8 shrink-0"></div>)}
              
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
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
            onChange={handleTyping}
            placeholder="Type your message..."
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
