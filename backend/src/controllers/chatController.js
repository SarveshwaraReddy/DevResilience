import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { RoomMessage } from '../models/RoomMessage.js';
import { User } from '../models/User.js';

// @desc    Get user conversations
// @route   GET /api/v1/chat/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name email avatar bio')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/v1/chat/:conversationId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create or get existing conversation
// @route   POST /api/v1/chat/conversations
// @access  Private
export const createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Receiver ID is required' });
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate('participants', 'name email avatar bio');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
      conversation = await conversation.populate('participants', 'name email avatar bio');
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Search users for chat
// @route   GET /api/v1/chat/users/search?q=query
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(200).json({ success: true, data: [] });

    const users = await User.find({
      name: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id }
    }).select('name email avatar bio').limit(10);

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get messages for a community room
// @route   GET /api/v1/chat/rooms/:roomId/messages
// @access  Private
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await RoomMessage.find({ roomId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
