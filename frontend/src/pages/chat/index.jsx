import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatWindow from '../../components/chat/ChatWindow';
import CommunityRoomWindow from '../../components/chat/CommunityRoomWindow';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const COMMUNITY_ROOMS = [
  { id: 'interview-prep', name: 'Interview Prep', icon: '💼', description: 'Mock interviews, DSA, system design', color: 'text-blue-400 bg-blue-500' },
  { id: 'react-help', name: 'React Help', icon: '⚛️', description: 'React, Next.js, and frontend chat', color: 'text-cyan-400 bg-cyan-500' },
  { id: 'career-guidance', name: 'Career Guidance', icon: '🚀', description: 'Resume reviews, promotions, negotiation', color: 'text-purple-400 bg-purple-500' },
  { id: 'productivity-sprint', name: 'Productivity Sprint', icon: '⚡', description: 'Pomodoro sessions and focus', color: 'text-yellow-400 bg-yellow-500' },
  { id: 'late-night-coding', name: 'Late Night Coding', icon: '🌙', description: 'For the night owls building things', color: 'text-indigo-400 bg-indigo-500' },
];

export default function ChatDashboard() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'rooms'
  const { socket, onlineUsers } = useSocket();
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(async (data) => {
        if (data.success) {
          setConversations(data.data);
          
          const selectConvId = searchParams.get('convId');
          const selectUserId = searchParams.get('userId');
          
          if (selectConvId) {
            const found = data.data.find(c => c._id === selectConvId);
            if (found) {
              setSelectedConversation(found);
            }
          } else if (selectUserId) {
            const found = data.data.find(c => 
              c.participants.some(p => p._id === selectUserId)
            );
            if (found) {
              setSelectedConversation(found);
            } else {
              try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/chat/conversations`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                  },
                  body: JSON.stringify({ receiverId: selectUserId })
                });
                const createData = await res.json();
                if (createData.success) {
                  setConversations(prev => {
                    if (!prev.find(c => c._id === createData.data._id)) {
                      return [createData.data, ...prev];
                    }
                    return prev;
                  });
                  setSelectedConversation(createData.data);
                }
              } catch (err) {
                console.error('Failed to create/get conversation', err);
              }
            }
          }
        }
      });
    }
  }, [token, searchParams]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;
    
    const handleMessage = (message) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c._id === message.conversationId);
        if (index > -1) {
          const updated = [...prev];
          updated[index].lastMessage = message.text;
          updated[index].lastMessageAt = message.createdAt;
          return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        }
        return prev;
      });
    };

    socket.on('message_received', handleMessage);

    return () => {
      socket.off('message_received', handleMessage);
    };
  }, [socket]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setSelectedRoom(null);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setSelectedConversation(null);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden glass-card rounded-2xl border border-white/5 relative">
      {/* Sidebar - Mobile Toggle */}
      <div 
        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 absolute lg:relative z-20 w-80 lg:w-1/3 h-full transition-transform duration-300 ease-in-out bg-surface/95 backdrop-blur-md lg:bg-transparent border-r border-white/5 flex flex-col`}
      >
        <ChatSidebar 
          conversations={conversations}
          setConversations={setConversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={handleSelectConversation}
          onlineUsers={onlineUsers}
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          communityRooms={COMMUNITY_ROOMS}
          selectedRoom={selectedRoom}
          setSelectedRoom={handleSelectRoom}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 h-full relative bg-background/30 flex flex-col">
        {selectedConversation ? (
          <ChatWindow 
            conversation={selectedConversation} 
            user={user} 
            socket={socket} 
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        ) : selectedRoom ? (
          <CommunityRoomWindow
            room={selectedRoom}
            user={user}
            socket={socket}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-tertiary/50">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-heading text-xl text-tertiary mb-2">DevResilience Chat</h3>
            <p className="text-sm">Select a direct message or join a community room.</p>
            {window.innerWidth < 1024 && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="mt-6 px-6 py-2 bg-primary/20 text-primary rounded-full hover:bg-primary/30 transition-colors"
              >
                Open Messages
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden absolute inset-0 bg-background/50 backdrop-blur-sm z-10"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
