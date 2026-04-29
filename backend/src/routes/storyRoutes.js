import express from 'express';
import { getStories, createStory, getStoryById, deleteStory } from '../controllers/storyController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getStories)
  .post(protect, createStory);

router.route('/:id')
  .get(getStoryById)
  .delete(protect, deleteStory);

export default router;
