import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Trash2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const fallbackStories = [
  {
    _id: "1",
    category: "CAREER",
    title: "Surviving the 24-year-old Slump",
    excerpt: "Three years in, the imposter syndrome didn't go away...",
    content: "Three years in, the imposter syndrome didn't go away—it evolved. I felt like I was drowning in legacy code and lost my spark. Here is how I reclaimed my curiosity. I started by taking small breaks, and focusing on one tiny win a day. Eventually, the mountain looked like a staircase again.",
    color: "primary",
    author: { name: "Alex Developer" }
  },
  {
    _id: "2",
    category: "MENTAL HEALTH",
    title: "Finding Balance in Tech",
    excerpt: "The burnout wasn't a sudden crash; it was a slow leak...",
    content: "The burnout wasn't a sudden crash; it was a slow leak. I had to learn that my worth wasn't tied to my PR throughput or my green GitHub squares. Stepping away from the keyboard and picking up a physical hobby—woodworking—changed how my brain processed problem-solving.",
    color: "secondary",
    author: { name: "Sam Coder" }
  }
];

export default function Stories() {
  const containerRef = useRef(null);
  const [stories, setStories] = useState(fallbackStories);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ title: '', category: 'CAREER', excerpt: '', content: '' });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/stories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setStories(data.data);
      }
    } catch (err) {
      console.log('Using fallback stories, API not ready or logged out.');
    }
  };

  useEffect(() => {
    if (!isWriting && !selectedStory) {
      const ctx = gsap.context(() => {
        const cards = gsap.utils.toArray(".story-card");
        cards.forEach((card) => {
          gsap.fromTo(card,
            { y: 50, opacity: 0, scale: 0.95 },
            {
              y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power2.out",
              scrollTrigger: { trigger: card, start: "top bottom-=100", toggleActions: "play none none reverse" }
            }
          );
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isWriting, selectedStory, stories]);

  const handleSubmitStory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setStories([data.data, ...stories]);
        setIsWriting(false);
        setFormData({ title: '', category: 'CAREER', excerpt: '', content: '' });
      } else {
        alert("Make sure you are logged in to submit a story to the database.");
      }
    } catch (err) {
      // Fallback local update
      const newStory = { ...formData, _id: Date.now().toString(), color: 'primary', author: { name: 'You' } };
      setStories([newStory, ...stories]);
      setIsWriting(false);
      setFormData({ title: '', category: 'CAREER', excerpt: '', content: '' });
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/stories/${storyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStories(stories.filter(s => s._id !== storyId));
        if (selectedStory?._id === storyId) {
          setSelectedStory(null);
        }
      } else {
        alert(data.message || 'Failed to delete story');
      }
    } catch (err) {
      console.log('Error deleting story:', err);
      // Fallback local delete
      setStories(stories.filter(s => s._id !== storyId));
      if (selectedStory?._id === storyId) {
        setSelectedStory(null);
      }
    }
  };

  if (selectedStory) {
    return (
      <div className="pb-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setSelectedStory(null)}
          className="mb-8 flex items-center gap-2 text-tertiary/60 hover:text-primary transition-colors"
        >
          <span>←</span> Back to Stories
        </button>
        <div className="glass-card p-10 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 bg-${selectedStory.category === 'MENTAL HEALTH' ? 'secondary' : 'primary'}`} />
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-label uppercase tracking-widest text-primary border border-primary/30 px-3 py-1 rounded-full">
              {selectedStory.category}
            </span>
            <button
              onClick={() => handleDeleteStory(selectedStory._id)}
              className="text-tertiary/60 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg"
              title="Delete story"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <h1 className="font-heading text-4xl mt-6 mb-4">{selectedStory.title}</h1>
          <p className="text-sm text-tertiary/50 mb-8">By {selectedStory.author?.name || 'Anonymous'}</p>
          <div className="prose prose-invert max-w-none text-tertiary/80 leading-relaxed whitespace-pre-wrap">
            {selectedStory.content || selectedStory.excerpt}
          </div>
        </div>
      </div>
    );
  }

  if (isWriting) {
    return (
      <div className="pb-12 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-3xl">Share Your Story</h1>
          <button onClick={() => setIsWriting(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-tertiary/60" />
          </button>
        </div>
        <form onSubmit={handleSubmitStory} className="glass-card p-8 flex flex-col gap-6">
          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-tertiary/60 mb-2">Category</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 text-tertiary"
            >
              <option className="bg-black text-white" value="CAREER">Career</option>
              <option className="bg-black text-white" value="MENTAL HEALTH">Mental Health</option>
              <option className="bg-black text-white" value="FAMILY">Family</option>
              <option className="bg-black text-white" value="PRODUCTIVITY">Productivity</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-tertiary/60 mb-2">Title</label>
            <input 
              required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="A captivating title..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-tertiary/60 mb-2">Short Excerpt (Teaser)</label>
            <textarea 
              required value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}
              placeholder="A 1-2 sentence summary to hook readers..." rows="2"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-tertiary/60 mb-2">Full Story</label>
            <textarea 
              required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="Share your experience..." rows="8"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>
          <button type="submit" className="mt-4 bg-primary text-background font-bold py-3 px-6 rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all">
            Publish Story
          </button>
        </form>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="pb-12">
      <div className="mb-12">
        <h1 className="font-heading text-4xl mb-4">Resilience Stories</h1>
        <p className="text-tertiary/60 max-w-2xl text-sm leading-relaxed">
          Real accounts of navigating the highs and lows of the engineering journey. You are not alone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div key={story._id || story.id} className="story-card glass-card p-8 flex flex-col h-[380px] group hover:border-white/10 transition-colors relative">
            <div className="flex justify-between items-start mb-6">
              <span className={`text-[10px] font-label uppercase tracking-widest px-3 py-1 rounded-full border border-primary/50 text-primary`}>
                {story.category}
              </span>
              <button
                onClick={() => handleDeleteStory(story._id)}
                className="text-tertiary/40 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg opacity-0 group-hover:opacity-100"
                title="Delete story"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h2 className="font-heading text-2xl mb-4 leading-tight group-hover:text-primary transition-colors">
              {story.title}
            </h2>
            <p className="text-tertiary/60 text-sm leading-relaxed flex-1">
              "{story.excerpt}"
            </p>
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
              <button onClick={() => setSelectedStory(story)} className="text-primary text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all">
                Read More <span>→</span>
              </button>
            </div>
          </div>
        ))}

        <div className="story-card bg-surface border border-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[380px] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <h2 className="font-heading text-2xl mb-3 z-10">Share Your Story</h2>
          <p className="text-tertiary/60 text-sm mb-8 px-4 z-10">
            Your experience might be the lighthouse someone else needs tonight.
          </p>
          <button onClick={() => setIsWriting(true)} className="bg-primary text-background font-bold py-2.5 px-6 rounded-full hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-shadow text-sm z-10">
            WRITE STORY
          </button>
        </div>
      </div>
    </div>
  );
}
