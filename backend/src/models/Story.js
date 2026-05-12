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
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true, toJSON: { virtuals: true } });

storySchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

const Story = mongoose.model('Story', storySchema);
export default Story;
