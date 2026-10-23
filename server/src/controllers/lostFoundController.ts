import { Response, NextFunction } from 'express';
import { LostFoundListing } from '../models/LostFoundListing.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getLostFoundListings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { type, category, status, search } = req.query;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = Math.min(parseInt(req.query.limit as string || '15', 10), 50);

    const filter: any = {
      college: user.college,
    };

    if (type && ['lost', 'found'].includes(type as string)) {
      filter.type = type;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search && String(search).trim()) {
      filter.$or = [
        { title: { $regex: String(search).trim(), $options: 'i' } },
        { description: { $regex: String(search).trim(), $options: 'i' } },
        { campusLocation: { $regex: String(search).trim(), $options: 'i' } },
      ];
    }

    const total = await LostFoundListing.countDocuments(filter);
    const listings = await LostFoundListing.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name avatarUrl department role')
      .lean();

    const formatted = listings.map((item) => ({
      ...item,
      isAuthor: item.author?._id?.toString() === user._id.toString(),
    }));

    return res.json({
      success: true,
      listings: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createLostFoundListing(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { type, title, description, category, campusLocation, incidentDate, imageUrl, contactPreference } = req.body;

    const listing = await LostFoundListing.create({
      author: user._id,
      college: user.college,
      type,
      title: title.trim(),
      description: description.trim(),
      category,
      campusLocation: campusLocation.trim(),
      incidentDate: new Date(incidentDate),
      imageUrl,
      contactPreference: contactPreference || 'in_app_chat',
      status: 'open',
    });

    const populated = await LostFoundListing.findById(listing._id).populate('author', 'name avatarUrl department role');

    return res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`,
      listing: {
        ...populated?.toObject(),
        isAuthor: true,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateListingStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { status } = req.body;
    const listing = await LostFoundListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const isAuthor = listing.author.toString() === user._id.toString();
    const isModOrAdmin = user.role === 'moderator' || user.role === 'admin';

    if (!isAuthor && !isModOrAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this listing.' });
    }

    listing.status = status;
    await listing.save();

    return res.json({
      success: true,
      message: `Listing status updated to ${status}.`,
      listing,
    });
  } catch (err) {
    next(err);
  }
}

export async function contactListingOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { messageText } = req.body;
    const listing = await LostFoundListing.findById(req.params.id).populate('author', 'name');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.author._id.toString() === user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself about your own listing.' });
    }

    // Find or create conversation
    let conv = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [user._id, listing.author._id], $size: 2 },
    });

    if (!conv) {
      conv = await Conversation.create({
        participants: [user._id, listing.author._id],
        isGroup: false,
      });
    }

    const defaultMsg = messageText || `Hi! I am reaching out regarding your ${listing.type} item listing: "${listing.title}".`;

    const newMsg = await Message.create({
      conversation: conv._id,
      sender: user._id,
      text: defaultMsg,
      readBy: [user._id],
    });

    conv.lastMessage = {
      text: defaultMsg,
      sender: user._id,
      createdAt: new Date(),
    };
    await conv.save();

    await Notification.create({
      recipient: listing.author._id,
      sender: user._id,
      type: 'direct_message',
      title: 'Lost & Found Inquiry',
      message: `${user.name} messaged you about "${listing.title}".`,
      link: '/app/messages',
    });

    return res.json({
      success: true,
      message: 'Inquiry sent via secure in-app messaging.',
      conversationId: conv._id,
      messageRecord: newMsg,
    });
  } catch (err) {
    next(err);
  }
}
