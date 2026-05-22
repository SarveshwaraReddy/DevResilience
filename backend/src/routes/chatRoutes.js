import express from 'express';
import { protect } from '../middlewares/auth.js';
import {
  getConversations,
  getMessages,
  createConversation,
  searchUsers,
  getRoomMessages,
} from '../controllers/chatController.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/users/search', searchUsers);
router.get('/rooms/:roomId/messages', getRoomMessages);
router.get('/:conversationId', getMessages);

export default router;
