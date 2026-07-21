import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  url:  { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
}, { _id: false });

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, refPath: 'comments.authorModel', required: true },
  authorModel: { type: String, enum: ['Student', 'Alumni', 'Admin'], required: true },
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
}, { timestamps: true });

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'authorModel',
      required: true,
    },
    authorModel: { type: String, enum: ['Student', 'Alumni', 'Admin'], required: true },
    
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [1000, 'Post content cannot exceed 1000 characters'],
    },

    image: { type: String, default: '' },
    media: [mediaSchema],
    tags: [String],

    likes: [{
      user: { type: mongoose.Schema.Types.ObjectId, refPath: 'likes.userModel' },
      userModel: { type: String, enum: ['Student', 'Alumni', 'Admin'] }
    }],

    comments: [commentSchema],

    // Add to your existing postSchema fields
    verification: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      rejectionReason: { type: String, default: null },
      checkedAt: { type: Date, default: null }
    },

    aiDetection: {
      flag: {
        type: String,
        enum: ['human', 'ai_assisted', 'ai_generated'],
        default: 'human'
      },
      score: { type: Number, default: 0 }
    },

    // Add to your User/Alumni model for strike tracking
    strikes: { type: Number, default: 0 },
    restrictedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

postSchema.virtual('likesCount').get(function () { return this.likes.length; });
postSchema.virtual('commentsCount').get(function () { return this.comments.length; });
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model("Post", postSchema);
export default Post;