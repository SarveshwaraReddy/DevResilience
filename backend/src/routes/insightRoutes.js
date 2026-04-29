import express from 'express';
import { getWeatherContext, analyzeProductivity, getHeatmap } from '../controllers/insightController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All insight routes require the user to be authenticated
router.use(protect);

router.get('/weather-context', getWeatherContext);
router.post('/analyze-productivity', analyzeProductivity);
router.get('/heatmap', getHeatmap);

export default router;
