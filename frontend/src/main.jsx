import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Stories from "./pages/Stories";
import SupportRoom from "./pages/SupportRoom";
import Network from "./pages/Network";
import Landing from "./pages/Landing";
import ChatDashboard from "./pages/chat/index";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";
import Profile from "./pages/Profile";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Landing />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="stories" element={<Stories />} />
              <Route path="network" element={<Network />} />
              <Route path="messages" element={<ChatDashboard />} />
              <Route path="room/:roomId" element={<SupportRoom />} />
              <Route path="profile" element={<Profile />} />
              <Route
                path="notifications"
                element={
                  <div className="p-8 text-tertiary">
                    <h1 className="text-2xl font-heading mb-4">Notifications</h1>
                    <p className="text-tertiary/60">This feature is under development.</p>
                  </div>
                }
              />
              <Route
                path="ai-tools"
                element={
                  <div className="p-8 text-tertiary">
                    <h1 className="text-2xl font-heading mb-4">AI Tools Dashboard</h1>
                    <p className="text-tertiary/60">This feature is under development.</p>
                  </div>
                }
              />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
