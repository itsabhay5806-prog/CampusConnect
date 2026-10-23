import { Response, NextFunction } from 'express';
import { Post } from '../models/Post.js';
import { Community } from '../models/Community.js';
import { Project } from '../models/Project.js';
import { Resource } from '../models/Resource.js';
import { LostFoundListing } from '../models/LostFoundListing.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getDiscoverOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const q = req.query.q as string;

    const regex = q && q.trim() ? new RegExp(q.trim(), 'i') : null;

    const [communities, events, projects, resources, lostFound] = await Promise.all([
      // Communities
      Community.find(
        regex
          ? { $or: [{ name: regex }, { description: regex }, { category: regex }] }
          : {}
      )
        .sort({ memberCount: -1 })
        .limit(6)
        .lean(),

      // Events / Updates
      Post.find(
        regex
          ? { college: user.college, isHidden: false, $or: [{ title: regex }, { content: regex }] }
          : { college: user.college, isHidden: false, category: { $in: ['event', 'announcement'] } }
      )
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('author', 'name avatarUrl department')
        .lean(),

      // Projects
      Project.find(
        regex
          ? { college: user.college, status: 'recruiting', $or: [{ title: regex }, { description: regex }, { requiredSkills: regex }] }
          : { college: user.college, status: 'recruiting' }
      )
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('creator', 'name avatarUrl department')
        .lean(),

      // Resources
      Resource.find(
        regex
          ? { college: user.college, isHidden: false, $or: [{ title: regex }, { subject: regex }, { department: regex }] }
          : { college: user.college, isHidden: false }
      )
        .sort({ downloadsCount: -1, createdAt: -1 })
        .limit(6)
        .populate('uploader', 'name avatarUrl department')
        .lean(),

      // Lost & Found
      LostFoundListing.find(
        regex
          ? { college: user.college, status: 'open', $or: [{ title: regex }, { description: regex }, { campusLocation: regex }] }
          : { college: user.college, status: 'open' }
      )
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('author', 'name avatarUrl')
        .lean(),
    ]);

    return res.json({
      success: true,
      query: q || '',
      results: {
        communities,
        events,
        projects,
        resources,
        lostFound,
      },
    });
  } catch (err) {
    next(err);
  }
}
