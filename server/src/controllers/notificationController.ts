import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const notifications = await Notification.find({ recipient: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'name avatarUrl')
      .lean();

    const unreadCount = await Notification.countDocuments({ recipient: user._id, isRead: false });

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const notif = await Notification.findOne({ _id: req.params.id, recipient: user._id });

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    notif.isRead = true;
    await notif.save();

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    await Notification.updateMany({ recipient: user._id, isRead: false }, { isRead: true });

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}
