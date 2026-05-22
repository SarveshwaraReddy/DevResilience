import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../avatar/Avatar';
import RoomCard from './RoomCard';

export default function ChatSidebar({ 
  conversations, setConversations, 
  selectedConversation, setSelectedConversation, 
  onlineUsers, user,
  activeTab, setActiveTab,
  communityRooms, selectedRoom, setSelectedRoom
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (searchQuery.length > 1 && activeTab === 'direct') {
      setIsSearching(true);
      fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/chat/users/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) setSearchResults(data.data);
      })
      .finally(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, token, activeTab]);

  const startConversation = async (otherUser) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/chat/conversations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ receiverId: otherUser._id })
      });
      const data = await res.json();
      if (data.success) {
        if (!conversations.find(c => c._id === data.data._id)) {
          setConversations([data.data, ...conversations]);
        }
        setSelectedConversation(data.data);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getOtherUser = (conv) => {
    return conv.participants.find(p => p._id !== user._id);
  };

  return (
    <div className="flex flex-col h-full bg-surface/50">
      <div className="p-5 border-b border-white/5">
        <h2 className="font-heading text-xl mb-4 font-bold tracking-tight">Messages</h2>
        
        {/* Tabs */}
        <div className="flex bg-background/50 p-1 rounded-xl mb-4">
          <button 
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'direct' ? 'bg-primary/20 text-primary' : 'text-tertiary/60 hover:text-tertiary'}`}
          >
            Direct
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'rooms' ? 'bg-primary/20 text-primary' : 'text-tertiary/60 hover:text-tertiary'}`}
          >
            Rooms
          </button>
        </div>

        {activeTab === 'direct' && (
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search By Username" 
              className="w-full bg-background/50 border border-white/10 rounded-xl py-2.5 px-4 pl-10 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="absolute left-3.5 top-3 w-4 h-4 text-tertiary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'direct' ? (
          searchQuery ? (
            <div className="p-3">
              <p className="text-xs font-label text-tertiary/50 uppercase px-2 mb-2">Search Results</p>
              {isSearching ? (
                <div className="flex justify-center p-4"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : searchResults.length > 0 ? (
                searchResults.map(u => (
                  <div 
                    key={u._id} 
                    onClick={() => startConversation(u)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <Avatar seed={u.name} size={40} className="rounded-full" />
                    <div>
                      <p className="text-sm font-semibold">{u.name}</p>
                      <p className="text-xs text-tertiary/50">Start a conversation</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-tertiary/50 text-center p-4">No users found</p>
              )}
            </div>
          ) : (
            <div className="p-3">
              <p className="text-xs font-label text-tertiary/50 uppercase px-2 mb-2">Recent</p>
              <div className="space-y-1">
                {conversations.map(conv => {
                  const otherUser = getOtherUser(conv);
                  if (!otherUser) return null;
                  const isOnline = onlineUsers.includes(otherUser._id);
                  const isSelected = selectedConversation?._id === conv._id;

                  return (
                    <div 
                      key={conv._id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}`}
                    >
                      <div className="relative">
                        <Avatar seed={otherUser.name} size={42} className="rounded-full bg-background" />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-tertiary'}`}>{otherUser.name}</p>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] text-tertiary/40 shrink-0">
                              {new Date(conv.lastMessageAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }).split(',')[1]}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${isSelected ? 'text-primary/70' : 'text-tertiary/50'}`}>
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {conversations.length === 0 && (
                  <p className="text-xs text-tertiary/50 text-center p-8">No recent conversations. Search for a user to start chatting.</p>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="p-3">
            <p className="text-xs font-label text-tertiary/50 uppercase px-2 mb-2">Community Rooms</p>
            <div className="space-y-2">
              {communityRooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isActive={selectedRoom?.id === room.id}
                  onClick={setSelectedRoom}
                  membersCount={onlineUsers.length > 0 ? Math.floor(Math.random() * 5) + 1 : 0} // Mock count for demo
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
