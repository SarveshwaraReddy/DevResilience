import { NavLink, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Search, Bell } from "lucide-react";
import Avatar from "../components/avatar/Avatar";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();
  return (
    <div className="flex bg-background min-h-screen text-tertiary font-body">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Topbar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 z-10 glass sticky top-0">
          <div className="flex items-center gap-6 text-sm text-tertiary/60 font-medium">
            <span className="text-tertiary">Dashboard</span>
            <NavLink to="/dashboard/stories">
              {" "}
              <span className="hover:text-tertiary cursor-pointer transition-colors">
                Stories
              </span>{" "}
            </NavLink>
            <NavLink to="/dashboard/network">
              <span className="hover:text-tertiary cursor-pointer transition-colors">
                Network
              </span>
            </NavLink>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-tertiary/40" />
              <input
                type="text"
                placeholder="Search stories..."
                className="bg-surface border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors w-64 placeholder:text-tertiary/30"
              />
            </div>
            <NavLink to="/dashboard/notifications" className="text-tertiary/60 hover:text-tertiary transition-colors">
              <Bell className="w-5 h-5" />
            </NavLink>
            <NavLink to="/dashboard/profile" className="flex items-center justify-center cursor-pointer transition-transform hover:scale-105">
              <Avatar 
                seed={user?.avatar?.seed || user?.name || "Guest"} 
                style={user?.avatar?.style || "lorelei"} 
                size={32} 
              />
            </NavLink>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
