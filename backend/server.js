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
