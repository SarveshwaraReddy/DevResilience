import { useState } from "react";
import { Search, Users, MapPin, Briefcase } from "lucide-react";

export default function Network() {
  const [users] = useState([
    { id: 1, name: "Alice Chen", role: "Frontend Engineer", company: "TechCorp", location: "San Francisco, CA" },
    { id: 2, name: "Bob Smith", role: "Backend Developer", company: "DataSystems", location: "Remote" },
    { id: 3, name: "Charlie Davis", role: "Full Stack Dev", company: "StartupX", location: "New York, NY" },
  ]);

  return (
    <div className="pb-12">
      <div className="mb-12">
        <h1 className="font-heading text-4xl mb-4">Peer Network</h1>
        <p className="text-tertiary/60 max-w-2xl text-sm leading-relaxed">
          Connect with other developers who understand the journey.
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary/40" />
        <input
          type="text"
          placeholder="Search peers by role, company, or location..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="glass-card p-6 flex flex-col gap-4 group hover:border-white/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-heading text-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-heading text-lg group-hover:text-primary transition-colors">{user.name}</h3>
                <p className="text-tertiary/60 text-sm flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {user.role}
                </p>
              </div>
            </div>
            <div className="text-xs text-tertiary/50 space-y-2 mt-2">
              <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {user.location}</div>
              <div className="flex items-center gap-2"><Users className="w-3 h-3" /> {user.company}</div>
            </div>
            <button className="mt-4 w-full py-2 bg-white/5 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-medium transition-all">
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
