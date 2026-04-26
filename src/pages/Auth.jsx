import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function Auth() {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("seeker");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".stagger-item",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2,
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, [activeTab]);

  const handleGuestEntry = () => {
    const uuid = crypto.randomUUID();
    sessionStorage.setItem("guest_id", uuid);
    window.location.href = "/"; // Simple redirect for now
  };

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden"
      ref={containerRef}
    >
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -translate-y-1/2" />

      {/* Header */}
      <div className="absolute top-8 w-full px-12 flex justify-between items-center text-sm font-label z-10">
        <div className="font-heading font-bold text-primary text-xl flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary" />
          DevResilience
        </div>
        <div className="flex gap-8 text-tertiary/60">
          <span className="hover:text-tertiary cursor-pointer transition">
            JOIN
          </span>
          <span className="hover:text-tertiary cursor-pointer transition">
            EXPLORE
          </span>
          <span className="text-primary cursor-pointer transition border-b border-primary pb-1">
            SUPPORT
          </span>
        </div>
      </div>

      <div className="flex w-full max-w-[1000px] h-[600px] glass-card overflow-hidden z-10">
        {/* Left Side: Value Prop */}
        <div className="flex-1 relative p-12 flex flex-col justify-center bg-gradient-to-br from-surface to-background border-r border-white/5">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
          <h1 className="font-heading text-4xl mb-4 leading-tight">
            Elevate Your Connectivity
          </h1>
          <p className="text-tertiary/60 mb-8 font-body leading-relaxed max-w-sm">
            Access the next generation of digital synergy within the Aetheris
            ecosystem.
          </p>
          <div className="glass p-4 rounded-xl inline-flex items-center gap-3 border border-primary/20 bg-primary/5 w-fit">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-background text-xs font-bold">
              ✓
            </div>
            <span className="font-label text-sm">
              Secure Authentication Suite
            </span>
          </div>
          {/* Decorative Progress Line */}
          <div className="mt-6 w-full max-w-[200px] h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-[1.2] p-12 flex flex-col justify-center bg-surface relative">
          <h2 className="font-heading text-3xl mb-2 stagger-item">
            Welcome Back
          </h2>
          <p className="text-tertiary/50 text-sm mb-8 stagger-item">
            Configure your access parameters below.
          </p>

          {/* Toggle */}
          <div className="flex bg-background rounded-lg p-1 mb-8 stagger-item border border-white/5">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "seeker" ? "bg-surface text-primary shadow-sm border border-white/5" : "text-tertiary/50 hover:text-tertiary"}`}
              onClick={() => setActiveTab("seeker")}
            >
              Find Support
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "listener" ? "bg-surface text-primary shadow-sm border border-white/5" : "text-tertiary/50 hover:text-tertiary"}`}
              onClick={() => setActiveTab("listener")}
            >
              Join as a Peer
            </button>
          </div>

          <div className="space-y-6 stagger-item">
            <div>
              <label className="block text-sm font-label mb-2 text-tertiary/80">
                Identity Identifier
              </label>
              <input
                type="email"
                placeholder="email@devresilience.com"
                className={`w-full bg-transparent border-b ${isFocused ? "border-primary shadow-[0_1px_10px_-2px_rgba(34,211,238,0.3)]" : "border-white/10"} py-2 text-tertiary focus:outline-none transition-all placeholder:text-tertiary/30`}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-label text-tertiary/80">
                  Security Key
                </label>
                <span className="text-[10px] text-tertiary/40 uppercase tracking-wider cursor-pointer hover:text-primary transition">
                  Forgot Password?
                </span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-white/10 py-2 text-tertiary focus:outline-none focus:border-primary transition-all placeholder:text-tertiary/30"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="persistent"
                className="accent-primary w-4 h-4 rounded border-white/10 bg-transparent"
              />
              <label
                htmlFor="persistent"
                className="text-sm text-tertiary/60 cursor-pointer"
              >
                Persistent Session
              </label>
            </div>
          </div>

          <div className="mt-8 space-y-4 stagger-item">
            <button className="w-full py-3 bg-gradient-to-r from-primary to-[#06b6d4] text-background font-bold rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-2">
              Initialize Session
              <span className="text-lg leading-none">→</span>
            </button>
            <button
              onClick={handleGuestEntry}
              className="w-full py-3 bg-transparent border border-white/10 text-tertiary font-medium rounded-lg hover:bg-white/5 transition-all"
            >
              Continue as Guest
            </button>
          </div>

          <div className="mt-8 flex items-center gap-4 stagger-item">
            <div className="flex-1 h-[1px] bg-white/5"></div>
            <span className="text-[10px] text-tertiary/40 uppercase tracking-widest">
              Or Register Via
            </span>
            <div className="flex-1 h-[1px] bg-white/5"></div>
          </div>

          <div className="mt-6 flex gap-4 stagger-item">
            <button className="flex-1 py-3 border border-white/5 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 transition text-xs font-label text-tertiary/60">
              <div className="w-4 h-4 bg-tertiary/80 mask-network"></div>{" "}
              Network
            </button>
            <button className="flex-1 py-3 border border-white/5 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 transition text-xs font-label text-tertiary/60">
              <div className="w-4 h-4 bg-tertiary/80 mask-terminal"></div>{" "}
              Terminal
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-6 flex justify-between items-center text-[10px] text-tertiary/40 uppercase tracking-widest border-t border-white/5 bg-background/80 backdrop-blur-md">
        <span>© 2026 DevResilience. Built for the resilient.</span>
        <div className="flex gap-6">
          <span className="hover:text-tertiary cursor-pointer transition">
            Privacy Policy
          </span>
          <span className="hover:text-tertiary cursor-pointer transition">
            Terms of Service
          </span>
          <span className="hover:text-tertiary cursor-pointer transition">
            Help Center
          </span>
        </div>
      </div>
    </div>
  );
}
