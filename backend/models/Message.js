import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
    senderModel: { type: String, enum: ['Student', 'Alumni', 'Admin'], required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverModel', required: true },
    receiverModel: { type: String, enum: ['Student', 'Alumni', 'Admin'], required: true },

    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },

    isRead: { type: Boolean, default: false },

    conversationId: { type: String, required: true },

    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

messageSchema.statics.getConversationId = function (userId1, userId2) {
  return [userId1.toString(), userId2.toString()].sort().join('_');
};

const Message = mongoose.model('Message', messageSchema);
export default Message;