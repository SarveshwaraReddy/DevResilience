import { useState } from "react";
import { MessageSquare, Star, Clock } from "lucide-react";

export default function Mentors() {
  const [mentors] = useState([
    { id: 1, name: "Dr. Sarah Jenkins", title: "Engineering Manager", expertise: "Leadership, Burnout Recovery", rating: 4.9 },
    { id: 2, name: "David Kim", title: "Senior Staff Engineer", expertise: "System Design, Career Growth", rating: 4.8 },
    { id: 3, name: "Elena Rodriguez", title: "Tech Lead", expertise: "Frontend Architecture, Mentoring", rating: 5.0 },
  ]);

  return (
    <div className="pb-12">
      <div className="mb-12">
        <h1 className="font-heading text-4xl mb-4">Find a Mentor</h1>
        <p className="text-tertiary/60 max-w-2xl text-sm leading-relaxed">
          Guidance from experienced professionals who have navigated the same challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="glass-card p-6 flex flex-col group hover:border-secondary/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center text-secondary font-heading text-2xl">
                {mentor.name.charAt(0)}
              </div>
              <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full text-xs font-medium">
                <Star className="w-3 h-3 fill-current" /> {mentor.rating}
              </div>
            </div>
            
            <h3 className="font-heading text-xl mb-1 group-hover:text-secondary transition-colors">{mentor.name}</h3>
            <p className="text-tertiary/50 text-sm mb-4">{mentor.title}</p>
            
            <div className="space-y-3 flex-1">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-tertiary/40">Expertise</span>
                <p className="text-sm text-tertiary/80">{mentor.expertise}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
              <button className="flex-1 py-2.5 bg-secondary text-background font-bold rounded-lg text-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
                Request Session
              </button>
              <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-tertiary transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
