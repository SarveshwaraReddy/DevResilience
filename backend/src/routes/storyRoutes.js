import express from 'express';
import { getStories, createStory, getStoryById, deleteStory, likeStory, unlikeStory } from '../controllers/storyController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getStories)
  .post(protect, createStory);

router.route('/:id')
  .get(getStoryById)
  .delete(protect, deleteStory);

router.route('/:id/like')
  .post(protect, likeStory);

router.route('/:id/unlike')
  .post(protect, unlikeStory);

export default router;
