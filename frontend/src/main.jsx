import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Stories from "./pages/Stories";
import SupportRoom from "./pages/SupportRoom";
import Network from "./pages/Network";
import Landing from "./pages/Landing";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

const DummyPage = ({ title }) => (
  <div className="p-8 text-tertiary">
    <h1 className="text-2xl font-heading mb-4">{title}</h1>
    <p className="text-tertiary/60">This feature is under development.</p>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
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
            <Route path="messages" element={<DummyPage title="Messages" />} />
            <Route path="room" element={<SupportRoom />} />
            <Route path="profile" element={<DummyPage title="Profile" />} />
            <Route
              path="notifications"
              element={<DummyPage title="Notifications" />}
            />
            <Route
              path="ai-tools"
              element={<DummyPage title="AI Tools Dashboard" />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
