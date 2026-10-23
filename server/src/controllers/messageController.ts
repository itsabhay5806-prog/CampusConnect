import { Response, NextFunction } from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { getIO } from '../socket/socketHandler.js';

export async function getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const conversations = await Conversation.find({ participants: user._id })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name avatarUrl department academicYear isVerified')
      .lean();

    // Compute unread count for each conversation
    const convIds = conversations.map((c) => c._id);
    const unreadMessages = await Message.aggregate([
      {
        $match: {
          conversation: { $in: convIds },
          sender: { $ne: user._id },
          readBy: { $ne: user._id },
        },
      },
      {
        $group: {
          _id: '$conversation',
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = new Map(unreadMessages.map((u) => [u._id.toString(), u.count]));

    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p: any) => p._id.toString() !== user._id.toString()
      );

      return {
        _id: conv._id,
        isGroup: conv.isGroup,
        groupName: conv.groupName,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
        otherUser: otherParticipant || null,
        unreadCount: unreadMap.get(conv._id.toString()) || 0,
      };
    });

    return res.json({ success: true, conversations: formatted });
  } catch (err) {
    next(err);
  }
}

export async function getOrCreateConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID is required.' });
    }

    if (recipientId === user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot start conversation with yourself.' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    // Check blocked status
    if (recipient.blockedUsers.includes(user._id as any) || user.blockedUsers.includes(recipient._id as any)) {
      return res.status(403).json({ success: false, message: 'Unable to message this student.' });
    }

    let conv = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [user._id, recipient._id], $size: 2 },
    }).populate('participants', 'name avatarUrl department academicYear isVerified');

    if (!conv) {
      conv = await Conversation.create({
        participants: [user._id, recipient._id],
        isGroup: false,
      });
      conv = await Conversation.findById(conv._id).populate(
        'participants',
        'name avatarUrl department academicYear isVerified'
      );
    }

    const otherUser = conv?.participants.find((p: any) => p._id.toString() !== user._id.toString());

    return res.json({
      success: true,
      conversation: {
        _id: conv?._id,
        isGroup: false,
        otherUser,
        lastMessage: conv?.lastMessage,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const convId = req.params.conversationId;

    const conv = await Conversation.findOne({
      _id: convId,
      participants: user._id,
    });

    if (!conv) {
      return res.status(403).json({ success: false, message: 'Conversation not found or access denied.' });
    }

    const messages = await Message.find({ conversation: conv._id })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatarUrl')
      .lean();

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversation: conv._id,
        sender: { $ne: user._id },
        readBy: { $ne: user._id },
      },
      {
        $addToSet: { readBy: user._id },
      }
    );

    return res.json({
      success: true,
      messages: messages.map((m) => ({
        ...m,
        isMine: m.sender?._id?.toString() === user._id.toString(),
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const convId = req.params.conversationId;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    const conv = await Conversation.findOne({
      _id: convId,
      participants: user._id,
    });

    if (!conv) {
      return res.status(403).json({ success: false, message: 'Conversation not found or access denied.' });
    }

    const message = await Message.create({
      conversation: conv._id,
      sender: user._id,
      text: text.trim(),
      readBy: [user._id],
    });

    conv.lastMessage = {
      text: text.trim(),
      sender: user._id,
      createdAt: new Date(),
    };
    await conv.save();

    const populated = await Message.findById(message._id).populate('sender', 'name avatarUrl');

    // Emit Socket.IO event to room if configured
    const io = getIO();
    if (io) {
      io.to(`conversation_${conv._id}`).emit('new_message', {
        ...populated?.toObject(),
        isMine: false,
      });

      // Also notify recipient participants
      conv.participants.forEach((pId) => {
        if (pId.toString() !== user._id.toString()) {
          io.to(`user_${pId}`).emit('unread_message', {
            conversationId: conv._id,
            sender: { id: user._id, name: user.name },
            text: text.trim(),
          });
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: {
        ...populated?.toObject(),
        isMine: true,
      },
    });
  } catch (err) {
    next(err);
  }
}
