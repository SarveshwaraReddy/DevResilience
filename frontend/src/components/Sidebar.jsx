import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Users,
  MessageSquare,
  Bell,
  User,
  Cpu,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Feed", href: "/dashboard/stories", icon: BookOpen },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Network", href: "/dashboard/network", icon: Users },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "AI Tools", href: "/dashboard/ai-tools", icon: Cpu },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="w-64 glass border-r border-white/5 h-screen sticky top-0 flex flex-col pt-8 pb-4">
      <div className="px-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
          <div className="flex flex-col">
            <NavLink to='/'>
              <span className="font-heading font-bold text-primary tracking-wide text-lg leading-none">
                DevResilience
              </span>
            </NavLink>
            <span className="text-[10px] text-tertiary/50 uppercase tracking-widest mt-1">
              Peer Support Network
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${isActive ? "text-primary" : "text-tertiary/60 hover:text-tertiary hover:bg-white/5"}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              )}
              <item.icon
                className={`w-5 h-5 z-10 ${isActive ? "text-primary" : ""}`}
              />
              <span className="font-label text-sm font-medium z-10">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto space-y-4">
        <div className="glass-card p-4 flex flex-col gap-3">
          <span className="text-xs text-tertiary/60">Need help now?</span>
          <button className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-500/50 rounded-lg text-sm font-medium transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            Crisis Resources
          </button>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-tertiary/60 hover:text-tertiary hover:bg-white/5 rounded-xl transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-label text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
