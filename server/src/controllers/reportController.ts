import { Response, NextFunction } from 'express';
import { Report } from '../models/Report.js';
import { ModerationAction } from '../models/ModerationAction.js';
import { Post } from '../models/Post.js';
import { Resource } from '../models/Resource.js';
import { LostFoundListing } from '../models/LostFoundListing.js';
import { Project } from '../models/Project.js';
import { Comment } from '../models/Comment.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function submitReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { targetType, targetId, reason, details } = req.body;

    const report = await Report.create({
      reporter: user._id,
      college: user.college,
      targetType,
      targetId,
      reason,
      details: details.trim(),
      status: 'pending',
    });

    // Mark content as reported
    if (targetType === 'post') {
      await Post.findByIdAndUpdate(targetId, { isReported: true });
    } else if (targetType === 'resource') {
      await Resource.findByIdAndUpdate(targetId, { isReported: true });
    } else if (targetType === 'lost_found') {
      await LostFoundListing.findByIdAndUpdate(targetId, { isReported: true });
    } else if (targetType === 'project') {
      await Project.findByIdAndUpdate(targetId, { isReported: true });
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for keeping CampusConnect safe. Your report has been submitted to the moderation team.',
      reportId: report._id,
    });
  } catch (err) {
    next(err);
  }
}

export async function getModerationQueue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { status = 'pending' } = req.query;

    const filter: any = { college: user.college };
    if (status !== 'all') {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('reporter', 'name email department')
      .populate('reviewedBy', 'name')
      .lean();

    return res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
}

export async function takeModerationAction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const moderator = req.user!;
    const reportId = req.params.id;
    const { action, notes } = req.body; // action: 'hide_content' | 'delete_content' | 'dismiss_report'

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    if (action === 'hide_content') {
      if (report.targetType === 'post') {
        await Post.findByIdAndUpdate(report.targetId, { isHidden: true });
      } else if (report.targetType === 'resource') {
        await Resource.findByIdAndUpdate(report.targetId, { isHidden: true });
      }
      report.status = 'resolved';
    } else if (action === 'delete_content') {
      if (report.targetType === 'post') {
        await Post.findByIdAndDelete(report.targetId);
      } else if (report.targetType === 'resource') {
        await Resource.findByIdAndDelete(report.targetId);
      } else if (report.targetType === 'lost_found') {
        await LostFoundListing.findByIdAndDelete(report.targetId);
      } else if (report.targetType === 'project') {
        await Project.findByIdAndDelete(report.targetId);
      } else if (report.targetType === 'comment') {
        await Comment.findByIdAndDelete(report.targetId);
      }
      report.status = 'resolved';
    } else if (action === 'dismiss_report') {
      report.status = 'dismissed';
    }

    report.reviewedBy = moderator._id;
    report.moderatorNotes = notes || '';
    await report.save();

    // Audit record
    await ModerationAction.create({
      moderator: moderator._id,
      action: action as any,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: notes || `Moderator action taken for report ${report._id}`,
    });

    return res.json({
      success: true,
      message: `Moderation action "${action}" successfully executed.`,
      report,
    });
  } catch (err) {
    next(err);
  }
}

export async function getModerationAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const logs = await ModerationAction.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('moderator', 'name role')
      .lean();

    return res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
}
