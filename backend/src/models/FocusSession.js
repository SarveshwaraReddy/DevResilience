import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    description: 'Optional reference to a specific task being worked on'
  },
  sessionType: {
    type: String,
    enum: ['pomodoro', 'short-break', 'long-break', 'deep-work'],
    required: [true, 'Please specify the session type']
  },
  startTime: {
    type: Date,
    required: [true, 'Session start time is required'],
    default: Date.now
  },
  endTime: {
    type: Date
  },
  distractionCount: {
    type: Number,
    default: 0,
    min: [0, 'Distraction count cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create compound indexes for fast analysis queries
focusSessionSchema.index({ user: 1, startTime: -1, status: 1 });

export const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
