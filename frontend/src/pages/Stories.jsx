/*
 * Stories Page
 * - Renders the stories list, story detail view, and story creation flow
 * - Uses GSAP + ScrollTrigger to animate story cards
 * - Communicates with backend APIs for stories and comments
 *
 * Notes:
 * - This page includes a `fallbackStories` list so the UI remains usable while the API
 *   is unavailable (e.g., during local development or authentication failures).
 */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Trash2, Heart } from "lucide-react";
import Avatar from "../components/avatar/Avatar";

// Register GSAP plugins once at module level.
gsap.registerPlugin(ScrollTrigger);

export default function Stories() {
  const containerRef = useRef(null);
  const [stories, setStories] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ title: '', category: 'CAREER', excerpt: '', content: '' });

  useEffect(() => {
    fetchStories();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id || payload.userId || payload._id);
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/stories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      // Set stories from the API unconditionally if successful
      if (data?.success && Array.isArray(data?.data)) {
        setStories(data.data);
      }

    } catch (err) {
      console.log('Error fetching stories:', err);
    }
  };

  const fetchComments = async (storyId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/comments/${storyId}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (err) {
      console.log('Error fetching comments');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/comments/${selectedStory._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: newComment })
      });
      const data = await res.json();
      if (data.success) {
        setComments([data.data, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.log('Error adding comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComments(comments.filter(c => c._id !== commentId));
      } else {
        alert(data.message || 'Failed to delete comment');
      }
    } catch (err) {
      console.log('Error deleting comment:', err);
    }
  };

  useEffect(() => {
    if (selectedStory) {
      fetchComments(selectedStory._id);
    }
  }, [selectedStory]);

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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/stories`, {
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
      console.log('Error submitting story:', err);
      alert('Failed to submit story. Please try again.');
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/stories/${storyId}`, {
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
      alert('Failed to delete story. Please try again.');
    }
  };

  const handleLike = async (storyId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/stories/${storyId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Update the story likes count
        setStories(stories.map(s => s._id === storyId ? { ...s, likesCount: data.likes, likes: [...(s.likes || []), currentUserId] } : s));
        if (selectedStory && selectedStory._id === storyId) {
          setSelectedStory({ ...selectedStory, likesCount: data.likes, likes: [...(selectedStory.likes || []), currentUserId] });
        }
      } else if (data.message === 'Already liked') {
        // Unlike
        const unlikeRes = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/stories/${storyId}/unlike`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const unlikeData = await unlikeRes.json();
        if (unlikeData.success) {
          setStories(stories.map(s => s._id === storyId ? { ...s, likesCount: unlikeData.likes, likes: (s.likes || []).filter(id => id !== currentUserId) } : s));
          if (selectedStory && selectedStory._id === storyId) {
            setSelectedStory({ ...selectedStory, likesCount: unlikeData.likes, likes: (selectedStory.likes || []).filter(id => id !== currentUserId) });
          }
        }
      }
    } catch (err) {
      console.log('Error liking story');
    }
  };

  if (selectedStory) {
    const isLiked = currentUserId && selectedStory.likes?.includes(currentUserId);

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
            <div className="flex items-center gap-2">
              <button onClick={() => handleLike(selectedStory._id)} className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 p-2 hover:bg-white/5 rounded-lg">
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                <span className="text-sm">{selectedStory.likesCount || 0}</span>
              </button>
              <button
                onClick={() => handleDeleteStory(selectedStory._id)}
                className="text-tertiary/60 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg"
                title="Delete story"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <h1 className="font-heading text-4xl mt-6 mb-4">{selectedStory.title}</h1>
          <div className="flex items-center gap-3 mb-8">
            <Avatar
              seed={selectedStory.author?.avatar?.seed || selectedStory.author?.name || 'Anonymous'}
              style={selectedStory.author?.avatar?.style || 'lorelei'}
              size={40}
            />
            <p className="text-sm text-tertiary/50">By {selectedStory.author?.name || 'Anonymous'}</p>
          </div>
          <div className="prose prose-invert max-w-none text-tertiary/80 leading-relaxed whitespace-pre-wrap">
            {selectedStory.content || selectedStory.excerpt}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="font-heading text-2xl mb-6">Comments ({comments.length})</h3>
          <form onSubmit={handleAddComment} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 resize-none"
              rows="3"
              required
            />
            <button type="submit" className="mt-4 bg-primary text-background font-bold py-2 px-4 rounded-lg">
              Add Comment
            </button>
          </form>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-white/5 p-4 rounded-lg relative group">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Avatar
                      seed={comment.author?.avatar?.seed || comment.author?.name || 'Anonymous'}
                      style={comment.author?.avatar?.style || 'lorelei'}
                      size={32}
                    />
                    <div>
                      <p className="text-tertiary/80">{comment.text}</p>
                      <p className="text-xs text-tertiary/50 mt-2">By {comment.author?.name || 'Anonymous'} • {new Date(comment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-tertiary/40 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg opacity-0 group-hover:opacity-100"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
              onChange={e => setFormData({ ...formData, category: e.target.value })}
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
              required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="A captivating title..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-tertiary/60 mb-2">Short Excerpt (Teaser)</label>
            <textarea
              required value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="A 1-2 sentence summary to hook readers..." rows="2"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-tertiary/60 mb-2">Full Story</label>
            <textarea
              required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
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
        {stories.map((story) => {
          const isLiked = currentUserId && story.likes?.includes(currentUserId);

          return (
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
                <div className="flex items-center gap-4">
                  <button onClick={() => handleLike(story._id)} className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                    <span className="text-sm">{story.likesCount || 0}</span>
                  </button>
                  <button onClick={() => setSelectedStory(story)} className="text-primary text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all">
                    Read More <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}

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