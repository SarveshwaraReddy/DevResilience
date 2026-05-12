import Comment from '../models/Comment.js';
import Story from '../models/Story.js';

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ story: req.params.storyId })
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('[commentController.getComments] error', {
      message: error?.message,
      stack: error?.stack,
    });

    return res.status(500).json({ success: false, message: 'Error fetching comments' });
  }
};

export const createComment = async (req, res) => {
  try {
    console.log('[commentController.createComment] request', {
      storyId: req.params.storyId,
      bodyText: typeof req.body?.text === 'string' ? req.body.text.slice(0, 50) : req.body?.text,
      hasReqUser: !!req.user,
    });

    // Validate auth
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Validate storyId
    const storyId = req.params.storyId;
    if (!storyId || !storyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid storyId' });
    }

    // Validate request body
    const text = req.body?.text;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    // Validate story exists before creating comment
    const story = await Story.findById(storyId).select('_id');
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const comment = await Comment.create({
      text: text.trim(),
      author: req.user._id,
      story: storyId,
    });
    
    await comment.populate('author', 'name');

    console.log('[commentController.createComment] created', {
      commentId: comment?._id,
      authorId: comment?.author,
      storyId: comment?.story,
    });

    return res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('[commentController.createComment] error', {
      message: error?.message,
      stack: error?.stack,
    });

    return res.status(500).json({ success: false, message: 'Error creating comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    if (!commentId || !commentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid commentId' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(commentId);
    
    console.log("Deleting comment:", commentId);
    console.log("User:", req.user);

    return res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('[commentController.deleteComment] error', {
      message: error?.message,
      stack: error?.stack,
    });

    return res.status(500).json({ success: false, message: 'Error deleting comment' });
  }
};

