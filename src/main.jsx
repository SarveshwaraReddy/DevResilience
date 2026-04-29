import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Stories from "./pages/Stories";
import SupportRoom from "./pages/SupportRoom";
import Network from "./pages/Network";
import Mentors from "./pages/Mentors";
import Landing from "./pages/Landing";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="stories" element={<Stories />} />
            <Route path="network" element={<Network />} />
            <Route path="mentors" element={<Mentors />} />
            <Route path="room" element={<SupportRoom />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
