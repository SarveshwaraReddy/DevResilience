import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './src/config/db.js';
import app from './src/app.js';
import { FocusSession } from './src/models/FocusSession.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server instead of using Express directly to attach Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict to frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Socket.io Real-time State Synchronization
const waitingSeekers = [];
const waitingListeners = [];

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Authenticate and join room for specific user (multi-device sync)
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });

  // Listen for Pomodoro/Session updates
  socket.on('pomodoro_update', async (data) => {
    try {
      // The prompt asks to push the update to the DB and to all other active sessions immediately.
      if (data.action === 'finish' && data.sessionId) {
        // 1. Push update to database
        const updatedSession = await FocusSession.findByIdAndUpdate(
          data.sessionId, 
          {
            status: 'completed',
            endTime: Date.now(),
            distractionCount: data.distractionCount || 0
          },
          { new: true }
        );

        // 2. Broadcast to all OTHER connected clients in the user's room (maintaining the 60FPS feel without waiting for REST)
        socket.to(data.userId).emit('session_synced', {
          action: 'finish',
          session: updatedSession
        });
      } else if (data.action === 'tick' || data.action === 'pause') {
        // Just broadcast visual updates without DB hits
        socket.to(data.userId).emit('session_synced', data);
      }
    } catch (error) {
      console.error('Socket update error:', error);
    }
  });

  // --- Support Room Matchmaking ---
  socket.on('join_support_queue', (data) => {
    // data: { role: 'seeker' | 'listener', user: { _id, name, avatar } }
    console.log(`User ${data.user?.name} joined queue as ${data.role}`);
    
    if (data.role === 'seeker') {
      if (waitingListeners.length > 0) {
        // Match found!
        const listener = waitingListeners.shift();
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Notify both
        socket.emit('support_match_found', { roomId, partnerRole: 'listener', partner: listener.user });
        io.to(listener.socketId).emit('support_match_found', { roomId, partnerRole: 'seeker', partner: data.user });
      } else {
        waitingSeekers.push({ socketId: socket.id, user: data.user });
      }
    } else if (data.role === 'listener') {
      if (waitingSeekers.length > 0) {
        // Match found!
        const seeker = waitingSeekers.shift();
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Notify both
        socket.emit('support_match_found', { roomId, partnerRole: 'seeker', partner: seeker.user });
        io.to(seeker.socketId).emit('support_match_found', { roomId, partnerRole: 'listener', partner: data.user });
      } else {
        waitingListeners.push({ socketId: socket.id, user: data.user });
      }
    }
  });

  socket.on('leave_support_queue', () => {
    const seekerIndex = waitingSeekers.findIndex(s => s.socketId === socket.id);
    if (seekerIndex > -1) waitingSeekers.splice(seekerIndex, 1);
    
    const listenerIndex = waitingListeners.findIndex(l => l.socketId === socket.id);
    if (listenerIndex > -1) waitingListeners.splice(listenerIndex, 1);
  });

  // --- Support Room Chat ---
  socket.on('join_support_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined support room ${roomId}`);
  });

  socket.on('support_message', (data) => {
    // data: { roomId, message: { id, sender, text, time, role } }
    socket.to(data.roomId).emit('support_message_received', data.message);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
