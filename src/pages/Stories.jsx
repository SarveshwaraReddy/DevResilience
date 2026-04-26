import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stories = [
  {
    id: 1,
    category: "CAREER",
    title: "Surviving the 24-year-old Slump",
    excerpt:
      "Three years in, the imposter syndrome didn't go away—it evolved. I felt like I was drowning in legacy code and lost my spark. Here is how I reclaimed my curiosity...",
    color: "primary",
  },
  {
    id: 2,
    category: "MENTAL HEALTH",
    title: "Finding Balance in Tech",
    excerpt:
      "The burnout wasn't a sudden crash; it was a slow leak. I had to learn that my worth wasn't tied to my PR throughput or my green GitHub squares.",
    color: "secondary",
  },
  {
    id: 3,
    category: "FAMILY",
    title: "Code, Kids, and Sanity",
    excerpt:
      "Being a senior dev and a new parent meant redefining 'productivity'. Here is how I set boundaries that saved both my career and my family time.",
    color: "secondary",
  },
  {
    id: 4,
    category: "CAREER",
    title: "The Joy of Deleting Code",
    excerpt:
      "I spent six months on a feature that was eventually scrapped. At first, I was devastated. Then, I realized the lesson was in the process, not the product.",
    color: "primary",
  },
  {
    id: 5,
    category: "MENTAL HEALTH",
    title: "When the Screen Stares Back",
    excerpt:
      "Isolation is a silent bug in remote work. Finding community wasn't just a social choice; it was a survival necessity for my mental health.",
    color: "secondary",
  },
];

export default function Stories() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".story-card");

      cards.forEach((card) => {
        gsap.fromTo(
          card,
          {
            y: 50,
            opacity: 0,
            scale: 0.95,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=100",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="pb-12">
      <div className="mb-12">
        <h1 className="font-heading text-4xl mb-4">Resilience Stories</h1>
        <p className="text-tertiary/60 max-w-2xl text-sm leading-relaxed">
          Real accounts of navigating the highs and lows of the engineering
          journey. You are not alone in the code.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div
            key={story.id}
            className="story-card glass-card p-8 flex flex-col h-[380px] group hover:border-white/10 transition-colors"
          >
            <div className="flex justify-between items-start mb-6">
              <span
                className={`text-[10px] font-label uppercase tracking-widest px-3 py-1 rounded-full border ${story.color === "primary" ? "border-primary/50 text-primary" : "border-secondary/50 text-secondary"}`}
              >
                {story.category}
              </span>
              <span className="text-4xl text-tertiary/10 font-serif leading-none">
                "
              </span>
            </div>

            <h2 className="font-heading text-2xl mb-4 leading-tight group-hover:text-primary transition-colors">
              {story.title}
            </h2>
            <p className="text-tertiary/60 text-sm leading-relaxed flex-1">
              "{story.excerpt}"
            </p>

            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
              <button className="text-primary text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all">
                Read More <span>→</span>
              </button>
              <button className="flex items-center gap-2 text-xs text-tertiary/50 hover:text-tertiary border border-white/10 rounded-full px-3 py-1.5 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                Relatable
              </button>
            </div>
          </div>
        ))}

        {/* CTA Card */}
        <div className="story-card bg-surface border border-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[380px] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>

          <h2 className="font-heading text-2xl mb-3">Share Your Story</h2>
          <p className="text-tertiary/60 text-sm mb-8 px-4">
            Your experience might be the lighthouse someone else needs tonight.
          </p>

          <button className="bg-primary text-background font-bold py-2.5 px-6 rounded-full hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-shadow text-sm">
            WRITE STORY
          </button>
        </div>
      </div>
    </div>
  );
}
