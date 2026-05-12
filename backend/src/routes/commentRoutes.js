import express from 'express';
import { getComments, createComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.route('/:storyId/comments').get(getComments).post(protect, createComment);
router.route('/:id').delete(protect, deleteComment);

export default router;