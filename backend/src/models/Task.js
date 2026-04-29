import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [150, 'Title cannot be more than 150 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'archived'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    required: [true, 'Please provide a priority level']
  },
  resilienceScoreWeight: {
    type: Number,
    required: [true, 'Please provide a resilience score weight for this task'],
    min: [1, 'Resilience score weight must be at least 1'],
    max: [10, 'Resilience score weight cannot exceed 10'],
    default: 5
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create compound indexes for fast heatmap and analytics queries
taskSchema.index({ user: 1, status: 1, completedAt: -1 });
taskSchema.index({ user: 1, priority: 1 });

export const Task = mongoose.model('Task', taskSchema);
