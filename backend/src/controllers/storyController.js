import Story from '../models/Story.js';

export const getStories = async (req, res) => {
  try {
    const stories = await Story.find().populate('author', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: stories.length, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching stories', error: error.message });
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
    res.status(201).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating story', error: error.message });
  }
};

export const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('author', 'name');
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
