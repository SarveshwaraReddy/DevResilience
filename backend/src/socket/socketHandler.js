import { FocusSession } from '../models/FocusSession.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { RoomMessage } from '../models/RoomMessage.js';

const waitingSeekers = [];
const waitingListeners = [];

// Track online users
const onlineUsers = new Map(); // userId -> socketId

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // --- User Global State ---
    socket.on('setup', (userData) => {
      if (userData && userData._id) {
        socket.join(userData._id);
        onlineUsers.set(userData._id, socket.id);
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
    });

    // Authenticate and join room for specific user (multi-device sync)
    socket.on('join_user_room', (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    // Listen for Pomodoro/Session updates
    socket.on('pomodoro_update', async (data) => {
      try {
        if (data.action === 'finish' && data.sessionId) {
          const updatedSession = await FocusSession.findByIdAndUpdate(
            data.sessionId,
            {
              status: 'completed',
              endTime: Date.now(),
              distractionCount: data.distractionCount || 0,
            },
            { new: true }
          );

          socket.to(data.userId).emit('session_synced', {
            action: 'finish',
            session: updatedSession,
          });
        } else if (data.action === 'tick' || data.action === 'pause') {
          socket.to(data.userId).emit('session_synced', data);
        }
      } catch (error) {
        console.error('Socket update error:', error);
      }
    });

    // --- Support Room Matchmaking ---
    socket.on('join_support_queue', (data) => {
      console.log(`User ${data.user?.name} joined queue as ${data.role}`);

      if (data.role === 'seeker') {
        if (waitingListeners.length > 0) {
          const listener = waitingListeners.shift();
          const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;

          socket.emit('support_match_found', { roomId, partnerRole: 'listener', partner: listener.user });
          io.to(listener.socketId).emit('support_match_found', { roomId, partnerRole: 'seeker', partner: data.user });
        } else {
          waitingSeekers.push({ socketId: socket.id, user: data.user });
        }
      } else if (data.role === 'listener') {
        if (waitingSeekers.length > 0) {
          const seeker = waitingSeekers.shift();
          const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;

          socket.emit('support_match_found', { roomId, partnerRole: 'seeker', partner: seeker.user });
          io.to(seeker.socketId).emit('support_match_found', { roomId, partnerRole: 'listener', partner: data.user });
        } else {
          waitingListeners.push({ socketId: socket.id, user: data.user });
        }
      }
    });

    socket.on('leave_support_queue', () => {
      const seekerIndex = waitingSeekers.findIndex((s) => s.socketId === socket.id);
      if (seekerIndex > -1) waitingSeekers.splice(seekerIndex, 1);

      const listenerIndex = waitingListeners.findIndex((l) => l.socketId === socket.id);
      if (listenerIndex > -1) waitingListeners.splice(listenerIndex, 1);
    });

    // --- Support Room Chat ---
    socket.on('join_support_room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined support room ${roomId}`);
    });

    socket.on('support_message', (data) => {
      socket.to(data.roomId).emit('support_message_received', data.message);
    });

    // --- Real-time Chat System ---
    socket.on('join_chat', (roomId) => {
      socket.join(roomId);
      console.log(`Socket joined chat: ${roomId}`);
    });

    socket.on('typing', ({ roomId, userId }) => {
      socket.to(roomId).emit('typing', userId);
    });

    socket.on('stop_typing', ({ roomId, userId }) => {
      socket.to(roomId).emit('stop_typing', userId);
    });

    socket.on('send_message', async (message) => {
      try {
        // message should contain conversationId, senderId, text
        const newMessage = await Message.create({
          conversationId: message.conversationId,
          senderId: message.senderId,
          text: message.text,
        });

        // Update conversation lastMessage
        await Conversation.findByIdAndUpdate(message.conversationId, {
          lastMessage: message.text,
          lastMessageAt: Date.now(),
        });

        const populatedMessage = await newMessage.populate('senderId', 'name avatar');

        // Emit to the conversation room
        io.to(message.conversationId.toString()).emit('message_received', populatedMessage);
      } catch (error) {
        console.error('Send message error:', error);
      }
    });

    // --- Community Support Rooms ---
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('send-message', async (data) => {
      // data: { roomId, senderId, senderName, text }
      try {
        const savedMessage = await RoomMessage.create({
          roomId: data.roomId,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
        });

        // Broadcast to everyone in the room
        io.to(data.roomId).emit('receive-message', savedMessage);
        console.log(`Message saved and broadcasted to ${data.roomId}`);
      } catch (error) {
        console.error('Send room message error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      // Remove from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('online_users', Array.from(onlineUsers.keys()));
          break;
        }
      }
      
      const seekerIndex = waitingSeekers.findIndex((s) => s.socketId === socket.id);
      if (seekerIndex > -1) waitingSeekers.splice(seekerIndex, 1);

      const listenerIndex = waitingListeners.findIndex((l) => l.socketId === socket.id);
      if (listenerIndex > -1) waitingListeners.splice(listenerIndex, 1);
    });
  });
};
