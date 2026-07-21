import Message from "../models/Message.js";
import { findUserById } from "../utils/userModels.js";
import Student from "../models/Student.js";

const roleToMessageModel = {
  student: "Student",
  alumni: "Alumni",
  admin: "Admin",
};

// Token rules
const TOKENS = {
  REPLY_2H: 5,
  REPLY_4H: 3,
};

// ─────────────────────────────────────────────
// GET CONVERSATIONS
// ─────────────────────────────────────────────
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$content" }, // ✅ FIX (text → content)
          lastTime: { $first: "$createdAt" },
          unread: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastTime: -1 } },
    ]);

    let studentMembershipSet = new Set();
    if (req.user.role === "student") {
      const student = await Student.findById(userId).select("takenMemberships").lean();
      studentMembershipSet = new Set((student?.takenMemberships || []).map((item) => String(item.alumni)));
    }

    let alumniMembershipSet = new Set();
    if (req.user.role === "alumni") {
      const partnerStudentIds = conversations.map((c) => c._id);
      if (partnerStudentIds.length > 0) {
        const students = await Student.find({
          _id: { $in: partnerStudentIds },
          "takenMemberships.alumni": userId,
        })
          .select("_id")
          .lean();

        alumniMembershipSet = new Set(students.map((s) => String(s._id)));
      }
    }

    const result = (
      await Promise.all(
        conversations.map(async (conversation) => {
          const partner = await findUserById(conversation._id);

          if (!partner) {
            return null;
          }

          const partnerObj = partner.toObject ? partner.toObject() : { ...partner };

          if (req.user.role === "student" && partnerObj.role === "alumni") {
            const taken = studentMembershipSet.has(String(partnerObj._id));
            partnerObj.membershipTaken = taken;
            partnerObj.subscribed = taken;
          }

          if (req.user.role === "alumni" && partnerObj.role === "student") {
            const active = alumniMembershipSet.has(String(partnerObj._id));
            partnerObj.membershipTaken = active;
            partnerObj.subscribed = active;
          }

          return {
            partner: partnerObj,
            lastMessage: conversation.lastMessage,
            lastTime: conversation.lastTime,
            unread: conversation.unread,
          };
        })
      )
    ).filter(Boolean);

    res.json({ conversations: result });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET MESSAGES
// ─────────────────────────────────────────────
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.user._id; // ✅ FIX

    const rawMessages = await Message.find({
      $or: [
        { sender: me, receiver: userId },
        { sender: userId, receiver: me },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    const messages = await Promise.all(
      rawMessages.map(async (message) => {
        const [senderUser, receiverUser] = await Promise.all([
          findUserById(message.sender),
          findUserById(message.receiver),
        ]);

        return {
          ...message,
          sender: senderUser
            ? {
                _id: senderUser._id,
                name: senderUser.name,
                avatar: senderUser.avatar,
                role: senderUser.role,
              }
            : { _id: message.sender },
          receiver: receiverUser
            ? {
                _id: receiverUser._id,
                name: receiverUser.name,
                avatar: receiverUser.avatar,
                role: receiverUser.role,
              }
            : { _id: message.receiver },
        };
      })
    );

    // mark as read
    await Message.updateMany(
      { sender: userId, receiver: me, isRead: false },
      { isRead: true }
    );

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// SEND MESSAGE
// ─────────────────────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    const me = req.user._id;
    const senderModel = roleToMessageModel[req.user.role];
    const receiverUser = await findUserById(userId);
    const receiverModel = roleToMessageModel[receiverUser?.role];

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (!senderModel || !receiverUser || !receiverModel) {
      return res.status(400).json({ message: "Invalid sender/receiver for message" });
    }

    const conversationId = Message.getConversationId(me, userId);

    const message = await Message.create({
      sender: me,
      senderModel,
      receiver: userId,
      receiverModel,
      content: content.trim(),
      conversationId,
    });

    await message.populate("sender", "name avatar role");
    await message.populate("receiver", "name avatar role");

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// ❗ MARK AS READ (MISSING)
// ─────────────────────────────────────────────
export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.user._id;

    await Message.updateMany(
      { sender: userId, receiver: me, isRead: false },
      { isRead: true }
    );

    res.json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};