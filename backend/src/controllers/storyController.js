import Story from '../models/Story.js';

// -------------------------------
// Story Controller
// -------------------------------
// Contains request handlers for:
//  - Listing stories (GET /api/v1/stories)
//  - Creating stories (POST /api/v1/stories)
//  - Fetching a story by id (GET /api/v1/stories/:id)
//  - Deleting stories (DELETE /api/v1/stories/:id)
//  - Liking/unliking stories (POST /like and /unlike)

// GET /api/v1/stories

// Returns a stable response shape for the frontend:
//   { success: true, data: [] }
export const getStories = async (req, res) => {
  try {
    // Debug log to confirm route hit and auth context (if any)
    console.log('[GET /api/v1/stories] start', {
      at: new Date().toISOString(),
      userId: req.user?._id || null,
    });

    // Query: fetch stories, populate author name, sort newest first
    const storiesFromDb = await Story.find({})
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    // Safety: ensure we always have an array before accessing `.length`
    const stories = Array.isArray(storiesFromDb) ? storiesFromDb : [];

    // Debug log: report result size
    console.log('[GET /api/v1/stories] success', { count: stories.length });

    // Frontend contract: always include `data` as an array
    return res.status(200).json({
      success: true,
      count: stories.length,
      data: stories,
    });
  } catch (error) {
    // Error log with stack trace for root-cause debugging
    console.error('[GET /api/v1/stories] error', {
      message: error?.message,
      stack: error?.stack,
    });

    // Safety: never return undefined `data` (avoid frontend crashes)
    return res.status(500).json({
      success: false,
      message: 'Server error fetching stories',
      error: error?.message || 'Unknown error',
      data: [],
      count: 0,
    });
  }
};

export const createStory = async (req, res) => {

  try {
    const { title, category, excerpt, content } = req.body;
    const story = await Story.create({
      title,
      category,
      excerpt,
      content,
      author: req.user._id // assuming protect middleware is used
    });
    await story.populate('author', 'name avatar');
    res.status(201).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating story', error: error.message });
  }
};

export const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('author', 'name avatar');
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching story', error: error.message });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    
    // Check if user is the author of the story
    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this story' });
    }
    
    await Story.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting story', error: error.message });
  }
};

export const likeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    // Ensure likes array exists
    if (!story.likes) {
      story.likes = [];
    }

    console.log("Story before like:", story.likes);
    console.log("User ID:", req.user._id);

    if (story.likes.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already liked' });
    }

    story.likes.push(req.user._id);
    await story.save();
    
    console.log("Updated likes:", story.likes.length);
    
    res.status(200).json({ success: true, likes: story.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error liking story', error: error.message });
  }
};

export const unlikeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    // Ensure likes array exists
    if (!story.likes) {
      story.likes = [];
    }

    const index = story.likes.indexOf(req.user._id);
    if (index === -1) {
      return res.status(400).json({ success: false, message: 'Not liked yet' });
    }

    story.likes.splice(index, 1);
    await story.save();
    res.status(200).json({ success: true, likes: story.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error unliking story', error: error.message });
  }
};
