import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { NavLink } from "react-router-dom";

export default function Dashboard() {
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [weather, setWeather] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [storyPoints, setStoryPoints] = useState([0, 0, 0, 0, 0, 0, 0]);
  const { token, user } = useAuth();

  useEffect(() => {
    let ctx;
    if (isSearching) {
      ctx = gsap.context(() => {
        gsap.to(".pulse-ring", {
          scale: 2,
          opacity: 0,
          duration: 1.5,
          repeat: -1,
          ease: "power2.out",
          stagger: 0.2,
        });
      });
    }
    return () => ctx && ctx.revert();
  }, [isSearching]);

  useEffect(() => {
    if (!token) return;

    // Fetch Weather Context
    fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/insights/weather-context`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setWeather(data.data);
      });

    // Fetch Heatmap (still fetching but we don't use it for the graph anymore)
    fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/insights/heatmap`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setHeatmap(data.data);
      });
  }, [token]);

  useEffect(() => {
    if (!token || !user) return;

    // Fetch Stories for Graph
    fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/stories`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const myStories = data.data.filter(s => s.author?._id === user._id || s.author === user._id);
          const counts = [0, 0, 0, 0, 0, 0, 0];
          myStories.forEach(story => {
            const d = new Date(story.createdAt).getDay();
            const mappedDay = d === 0 ? 6 : d - 1; // 0=Mon, 6=Sun
            counts[mappedDay] += 1;
          });
          setStoryPoints(counts);
        }
      });
  }, [token, user]);

  const handleStartSession = () => {
    setIsSearching(true);

    // Simulate finding a match after 3 seconds
    setTimeout(() => {
      setMatchFound(true);

      // Simulate redirect after showing match overlay
      setTimeout(() => {
        window.location.href = "/room";
      }, 2000);
    }, 3000);
  };

  let cumulative = 0;
  const chartData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((name, i) => {
    cumulative += storyPoints[i] * 10;
    return { name, score: cumulative };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

          <div className="relative z-10 flex flex-col h-full justify-center">
            <span className="text-xs font-label text-primary tracking-widest uppercase mb-4 block">
              Active Pulse
            </span>
            <h1 className="font-heading text-5xl mb-4 leading-tight">
              Connect with a <br />
              Peer
            </h1>
            <p className="text-tertiary/60 mb-8 max-w-md text-sm">
              {weather ? weather.recommendation : "Overcome burnout with 1-on-1 peer sessions designed for engineers by engineers."}
            </p>

            <div className="flex items-center gap-6">
              <button
                onClick={handleStartSession}
                disabled={isSearching}
                className="bg-primary text-background font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? "Finding Peer..." : "Start Session"}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </button>

              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-tertiary/20" />
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-tertiary/30" />
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-xs font-bold">
                  +12
                </div>
              </div>
            </div>
          </div>

          {/* Searching Overlay */}
          {isSearching && !matchFound && (
            <div className="absolute inset-0 bg-surface/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <div className="absolute inset-0 border-2 border-primary rounded-full pulse-ring" />
                <div className="absolute inset-2 border-2 border-primary/50 rounded-full pulse-ring" />
                <div className="absolute inset-4 border-2 border-primary/30 rounded-full pulse-ring" />
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.6)]">
                  <svg
                    className="w-6 h-6 text-background animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </div>
              <h3 className="font-heading text-xl text-primary animate-pulse">
                Scanning Network...
              </h3>
              <p className="text-tertiary/50 text-sm mt-2">
                Looking for an available listener
              </p>
            </div>
          )}

          {/* Match Found Overlay */}
          {matchFound && (
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-md z-30 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-4 shadow-[0_0_50px_rgba(34,211,238,0.8)]"
              >
                <svg
                  className="w-12 h-12 text-background"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
              <h3 className="font-heading text-2xl font-bold">Match Found!</h3>
              <p className="text-tertiary/80 mt-2">
                Connecting to secure room...
              </p>
            </div>
          )}
        </div>

        {/* Right CTA */}
        <div className="glass-card p-8 flex flex-col justify-between bg-gradient-to-br from-surface to-background border border-white/5 relative group cursor-pointer hover:border-secondary/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

          <div>
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-6 text-secondary">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl mb-3 leading-tight">
              Become a <br />
              Listener
            </h2>
            <p className="text-tertiary/50 text-sm">
              Share your journey and guide others through the tech industry's
              mental challenges.
            </p>
          </div>

          <button className="w-full py-3 mt-6 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors text-tertiary/80">
            Learn More
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart Card */}
        {user ? (
          <div className="md:col-span-2 glass-card p-6">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-lg">{user.name}'s Journey</h3>
              <span className="text-xs text-primary font-label">
                {user?.productivityMetrics?.currentResilienceScore || 88}% Resilience Score
              </span>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#22d3ee', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 glass-card p-6 flex items-center justify-center text-tertiary/50">
            Log in to see your journey graph
          </div>
        )}

        {/* Featured Story */}
        <div className="glass-card relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
          <img
            src="/office.png"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
            alt="Office Building"
          />

          <div className="relative z-20 p-6 h-full flex flex-col justify-end">
            <span className="text-[10px] font-label text-primary uppercase border border-primary/30 bg-primary/10 px-2 py-1 rounded w-fit mb-3">
              Burnout Recovery
            </span>
            <h3 className="font-bold text-lg mb-2 leading-tight">
              Finding balance after 3 major releases...
            </h3>
            <p className="text-xs text-tertiary/60 line-clamp-2">
              "I thought constant shipping was the only way to prove value until
              I hit the wall at 3AM on a Friday..."
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary mb-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="font-bold text-sm mb-2">
            Managing Imposter Syndrome in Senior Roles
          </h3>
          <p className="text-xs text-tertiary/50">
            A practical guide by Principal Engineer Marcus...
          </p>
        </div>

        <div className="md:col-span-2 glass-card p-6 flex items-center gap-6 group cursor-pointer hover:border-white/10 transition-colors">
          <img
            src="/desk.png"
            className="w-32 h-32 rounded-xl object-cover"
            alt="Desk"
          />
          <div>
            <span className="text-[10px] font-label text-tertiary/50 uppercase tracking-widest block mb-2">
              Relatable Stories
            </span>
            <NavLink to="stories"><h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
              Why 'Deep Work' requires deep rest
            </h3></NavLink>
            <p className="text-xs text-tertiary/60 italic">
              "My productivity tripled when I started taking mandatory walk
              breaks..."
            </p>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="font-heading text-5xl font-bold mb-2">{user?.productivityMetrics?.totalFocusSessions || 24}</span>
          <span className="text-[10px] font-label text-primary uppercase tracking-widest border-b-2 border-primary pb-1">
            Total Focus Sessions
          </span>
        </div>
      </div>
    </div>
  );
}
