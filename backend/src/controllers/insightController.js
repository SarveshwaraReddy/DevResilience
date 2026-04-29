import { FocusSession } from '../models/FocusSession.js';
import { Task } from '../models/Task.js';

// Simple in-memory cache for weather and AQI
const weatherCache = {
  data: null,
  lastFetch: null,
  ttl: 1000 * 60 * 30 // 30 minutes cache duration
};

// @desc    Fetch and cache real-time weather and AQI data
// @route   GET /api/v1/insights/weather-context
// @access  Private
export const getWeatherContext = async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached data if valid
    if (weatherCache.data && weatherCache.lastFetch && (now - weatherCache.lastFetch < weatherCache.ttl)) {
      return res.status(200).json({ success: true, cached: true, data: weatherCache.data });
    }

    // In a production environment, you would call an external API here:
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.lon}&appid=${process.env.WEATHER_API_KEY}`);
    // const data = await response.json();
    
    // Mock response for demonstration
    const mockWeatherData = {
      temperature: 24,
      condition: "Haze",
      aqi: 115, // Moderate/Poor AQI
      recommendation: "AQI is elevated today. Consider limiting outdoor breaks and focusing on indoor deep work."
    };

    // Update cache
    weatherCache.data = mockWeatherData;
    weatherCache.lastFetch = now;

    res.status(200).json({ success: true, cached: false, data: mockWeatherData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send 7 days of FocusSession data to GenAI for 'Resilience Post-Mortem'
// @route   POST /api/v1/insights/analyze-productivity
// @access  Private
export const analyzeProductivity = async (req, res) => {
  try {
    const userId = req.user._id; 
    
    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch the last 7 days of completed FocusSessions
    const sessions = await FocusSession.find({
      user: userId,
      startTime: { $gte: sevenDaysAgo },
      status: 'completed'
    }).sort({ startTime: 1 });

    if (!sessions || sessions.length === 0) {
      return res.status(400).json({ success: false, message: 'Insufficient data in the last 7 days to generate a report.' });
    }

    // Format the data to pass into the LLM prompt
    const sessionData = sessions.map(s => ({
      date: s.startTime.toISOString().split('T')[0],
      durationMins: s.endTime ? Math.round((s.endTime - s.startTime) / 60000) : 0,
      type: s.sessionType,
      distractions: s.distractionCount
    }));

    // Example prompt construction
    const prompt = `Analyze the following productivity session data for a software engineer over the last 7 days. Generate a personalized 'Resilience Post-Mortem' report highlighting patterns, burnout risks, and actionable recommendations.
    
    Data:
    ${JSON.stringify(sessionData, null, 2)}`;

    // In a production environment, you would call a GenAI API here (e.g., Gemini, OpenAI, Anthropic)
    // const aiResponse = await fetch('YOUR_GEN_AI_ENDPOINT', { method: 'POST', body: JSON.stringify({ prompt }) });
    
    // Mock AI response for demonstration
    const mockReport = {
      summary: "You've maintained a steady cadence of deep-work sessions, but your distraction count spikes significantly during late afternoon Pomodoros.",
      burnoutRisk: "Low to Moderate",
      insights: [
        "Your longest consecutive deep-work stretches occur on Tuesdays.",
        "Short breaks are frequently skipped after 3 PM."
      ],
      recommendations: [
        "Schedule your most demanding, high-resilience tasks before 2 PM.",
        "Take longer breaks after consecutive 'deep-work' sessions.",
        "Implement a hard stop for checking emails during afternoon Pomodoros."
      ]
    };

    res.status(200).json({ success: true, data: mockReport, analyzedSessions: sessions.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Calculate hourly productivity heatmaps based on task completion
// @route   GET /api/v1/insights/heatmap
// @access  Private
export const getHeatmap = async (req, res) => {
  try {
    const heatmapData = await Task.aggregate([
      // 1. Match only completed tasks for the authenticated user
      { 
        $match: { 
          user: req.user._id,
          status: 'completed',
          completedAt: { $exists: true }
        } 
      },
      // 2. Extract the hour of day and day of week from the completedAt timestamp
      {
        $project: {
          hourCompleted: { $hour: "$completedAt" },
          dayOfWeek: { $dayOfWeek: "$completedAt" }, // 1 (Sunday) to 7 (Saturday)
          resilienceScoreWeight: 1
        }
      },
      // 3. Group by Day and Hour to aggregate total tasks completed and total resilience score gained
      {
        $group: {
          _id: { day: "$dayOfWeek", hour: "$hourCompleted" },
          tasksCompleted: { $sum: 1 },
          totalResilienceGained: { $sum: "$resilienceScoreWeight" }
        }
      },
      // 4. Sort chronologically (by day, then hour)
      { $sort: { "_id.day": 1, "_id.hour": 1 } }
    ]);

    // Format the aggregation result into a clean array structure for the frontend
    const formattedHeatmap = heatmapData.map(item => ({
      day: item._id.day,
      hour: item._id.hour,
      tasksCompleted: item.tasksCompleted,
      resilienceGained: item.totalResilienceGained
    }));

    res.status(200).json({ success: true, data: formattedHeatmap });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
