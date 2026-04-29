import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['CAREER', 'MENTAL HEALTH', 'FAMILY', 'PRODUCTIVITY', 'OTHER'],
    default: 'OTHER'
  },
  excerpt: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Story = mongoose.model('Story', storySchema);
export default Story;
