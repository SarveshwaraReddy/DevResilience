import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";
import Avatar from "../components/avatar/Avatar";
import { avatarStyles } from "../components/avatar/avatarStyles";
import { 
  Save, 
  User, 
  Mail, 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  MessageSquare, 
  Award, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";

export default function Profile() {
  const { user, token, updateProfile } = useAuth();
  
  // State for form
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarStyle, setAvatarStyle] = useState("lorelei");
  const [avatarSeed, setAvatarSeed] = useState("");

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  // Initialize fields
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatarStyle(user.avatar?.style || "lorelei");
      setAvatarSeed(user.avatar?.seed || user.name || "");
    }
  }, [user]);

  // Fetch Conversation History
  useEffect(() => {
    if (!token) return;
    setIsLoadingChats(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL || ""}/api/v1/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConversations(data.data);
        }
      })
      .catch((err) => console.error("Error fetching conversations:", err))
      .finally(() => setIsLoadingChats(false));
  }, [token]);

  // Handle Randomizing Avatar Seed
  const handleRandomizeSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    setAvatarSeed(randomSeed);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setSaveStatus("error");
      setErrorMessage("Username cannot be empty");
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);
    
    const result = await updateProfile({
      name,
      bio,
      avatar: {
        style: avatarStyle,
        seed: avatarSeed
      }
    });

    setIsSaving(false);
    if (result.success) {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus("error");
      setErrorMessage(result.error || "Something went wrong while saving.");
    }
  };

  // Extract unique conversation partners
  const chatPartners = conversations
    .map((conv) => {
      const partner = conv.participants?.find((p) => p._id !== user?._id);
      return partner ? { ...partner, lastMessageAt: conv.lastMessageAt } : null;
    })
    .filter((partner) => partner !== null);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-card p-8 relative overflow-hidden bg-gradient-to-r from-surface to-background border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000" />
            <Avatar 
              seed={avatarSeed || user?.name || "Guest"} 
              style={avatarStyle} 
              size={100} 
              className="relative rounded-full border-4 border-surface bg-background"
            />
          </div>
          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-glow">{name || "Developer Profile"}</h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-semibold capitalize font-label ${
                user?.role === "listener" 
                  ? "bg-secondary/20 text-secondary border border-secondary/30" 
                  : "bg-primary/20 text-primary border border-primary/30"
              }`}>
                {user?.role || "Seeker"}
              </span>
            </div>
            <p className="text-tertiary/50 text-sm max-w-xl">
              {user?.email || "developer@resilience.io"}
            </p>
            <p className="text-xs text-tertiary/40">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : "Recently"}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Customize Profile (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <h2 className="font-heading text-2xl mb-6 font-bold flex items-center gap-2">
              <User className="text-primary w-6 h-6" /> Edit Profile Settings
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-label text-tertiary/70 uppercase tracking-wider mb-2">
                  Username / Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary/30 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-background/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-tertiary/20"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-xs font-label text-tertiary/50 uppercase tracking-wider mb-2">
                  Registered Email (Linked Account)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary/20 w-4 h-4" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-background/30 border border-white/5 text-tertiary/40 rounded-xl py-3 pl-11 pr-4 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Bio Field (Instagram Like) */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="block text-xs font-label text-tertiary/70 uppercase tracking-wider">
                    Bio Description
                  </label>
                  <span className={`text-xs font-label ${bio.length >= 135 ? "text-red-400 font-bold" : "text-tertiary/40"}`}>
                    {bio.length} / 150
                  </span>
                </div>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-3 text-tertiary/30 w-4 h-4" />
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 150))}
                    placeholder="Write a bio... tell peers about your skills, current goals, and resilience journey (e.g. React & Node Dev | Building resilience one build at a time)"
                    className="w-full bg-background/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-tertiary/20 resize-none font-body leading-relaxed"
                  />
                </div>
              </div>

              {/* Save Status Banner */}
              {saveStatus === "success" && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-sm animate-pulse">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {saveStatus === "error" && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-primary text-background font-bold py-3.5 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Interactive Avatar Picker Customize Box */}
          <div className="glass-card p-8">
            <h2 className="font-heading text-2xl mb-6 font-bold flex items-center gap-2">
              <Sparkles className="text-secondary w-6 h-6" /> Customize DiceBear Avatar
            </h2>

            <div className="space-y-6">
              {/* Style selector */}
              <div>
                <label className="block text-xs font-label text-tertiary/70 uppercase tracking-wider mb-3">
                  Choose Avatar Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {avatarStyles.map((item) => {
                    const isSelected = avatarStyle === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAvatarStyle(item.id)}
                        className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                            : "border-white/5 bg-background/20 hover:border-white/10"
                        }`}
                      >
                        <Avatar
                          seed={avatarSeed || user?.name || "Temp"}
                          style={item.id}
                          size={44}
                        />
                        <span className="text-xs font-medium text-tertiary/75">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seed input & randomizer */}
              <div>
                <label className="block text-xs font-label text-tertiary/70 uppercase tracking-wider mb-2">
                  Avatar Seed (Input custom text or randomize)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={avatarSeed}
                    onChange={(e) => setAvatarSeed(e.target.value)}
                    placeholder="Enter custom seed"
                    className="flex-1 bg-background/50 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleRandomizeSeed}
                    className="px-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    title="Randomize Seed"
                  >
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <span>Random</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chats History & Metrics */}
        <div className="space-y-8">
          
          {/* Conversation history list */}
          <div className="glass-card p-6 flex flex-col min-h-[300px]">
            <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <MessageSquare className="text-primary w-5 h-5" /> Chat History
            </h2>

            {isLoadingChats ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : chatPartners.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {chatPartners.map((partner) => (
                  <div 
                    key={partner._id}
                    className="p-3 bg-background/20 rounded-xl border border-white/5 flex items-start justify-between gap-3 hover:border-white/10 hover:bg-background/40 transition-all duration-300"
                  >
                    <div className="flex gap-3 min-w-0">
                      <Avatar 
                        seed={partner.avatar?.seed || partner.name} 
                        style={partner.avatar?.style || "lorelei"} 
                        size={40} 
                        className="rounded-full bg-background border-white/10"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-tertiary">{partner.name}</p>
                        <span className="text-[10px] text-primary font-label px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20 capitalize inline-block mt-0.5">
                          {partner.role || "Seeker"}
                        </span>
                        <p className="text-xs text-tertiary/50 line-clamp-2 mt-1 italic font-body">
                          {partner.bio || "No bio set yet."}
                        </p>
                      </div>
                    </div>
                    
                    <NavLink
                      to={`/dashboard/messages?userId=${partner._id}`}
                      className="p-2 bg-primary/15 hover:bg-primary text-primary hover:text-background rounded-lg transition-all shrink-0 self-center"
                      title={`Chat with ${partner.name}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </NavLink>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-tertiary/40">
                <MessageSquare className="w-8 h-8 text-tertiary/20 mb-3" />
                <p className="text-xs font-semibold">No recent chats</p>
                <p className="text-[11px] text-tertiary/30 mb-4 max-w-[180px]">Start building connections in the community</p>
                <NavLink 
                  to="/dashboard/network" 
                  className="px-4 py-2 border border-white/10 hover:border-primary/50 text-xs hover:text-primary rounded-lg transition-colors font-label font-bold"
                >
                  Find Peers
                </NavLink>
              </div>
            )}
          </div>

          {/* Gamified stats panel */}
          <div className="glass-card p-6 bg-gradient-to-br from-surface to-background border-white/5">
            <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Award className="text-secondary w-5 h-5" /> Resilience Stats
            </h3>
            
            <div className="space-y-4">
              {/* Resilience Score */}
              <div className="bg-background/30 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-tertiary/60 font-label">Resilience Score</span>
                  <span className="text-sm font-bold text-primary font-label">
                    {user?.productivityMetrics?.currentResilienceScore || 0}%
                  </span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-1000"
                    style={{ width: `${user?.productivityMetrics?.currentResilienceScore || 0}%` }}
                  />
                </div>
              </div>

              {/* Other metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background/30 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[10px] text-tertiary/50 font-label uppercase block mb-1">Focus Sessions</span>
                  <span className="text-xl font-bold text-tertiary font-heading">
                    {user?.productivityMetrics?.totalFocusSessions || 0}
                  </span>
                </div>
                <div className="bg-background/30 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[10px] text-tertiary/50 font-label uppercase block mb-1">Tasks Done</span>
                  <span className="text-xl font-bold text-tertiary font-heading">
                    {user?.productivityMetrics?.totalTasksCompleted || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
