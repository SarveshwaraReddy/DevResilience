/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const socketInstance = io(backendUrl);

      socketInstance.on('connect', () => {
        socketInstance.emit('setup', user);
        setSocket(socketInstance);
      });

      socketInstance.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socketInstance.disconnect();
        setSocket(null);
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
