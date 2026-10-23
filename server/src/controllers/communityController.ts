import { Response, NextFunction } from 'express';
import { Community } from '../models/Community.js';
import { CommunityMembership } from '../models/CommunityMembership.js';
import { Post } from '../models/Post.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getCommunities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { category, search } = req.query;

    const filter: any = {
      $or: [{ college: user.college }, { college: { $exists: false } }, { college: null }],
    };

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search && String(search).trim()) {
      filter.$or = [
        { name: { $regex: String(search).trim(), $options: 'i' } },
        { description: { $regex: String(search).trim(), $options: 'i' } },
      ];
    }

    const communities = await Community.find(filter)
      .sort({ memberCount: -1, createdAt: -1 })
      .populate('creator', 'name avatarUrl')
      .lean();

    // Check memberships for current user
    const memberships = await CommunityMembership.find({ user: user._id }).lean();
    const joinedCommunityIds = new Set(memberships.map((m) => m.community.toString()));

    const formatted = communities.map((c) => ({
      ...c,
      isMember: joinedCommunityIds.has(c._id.toString()),
      isCreator: c.creator?._id?.toString() === user._id.toString(),
    }));

    return res.json({
      success: true,
      communities: formatted,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCommunityBySlug(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const community = await Community.findOne({ slug: req.params.slug })
      .populate('creator', 'name avatarUrl department')
      .lean();

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found.' });
    }

    const membership = await CommunityMembership.findOne({
      community: community._id,
      user: user._id,
    });

    const members = await CommunityMembership.find({ community: community._id })
      .sort({ joinedAt: -1 })
      .limit(30)
      .populate('user', 'name avatarUrl department academicYear')
      .lean();

    return res.json({
      success: true,
      community: {
        ...community,
        isMember: Boolean(membership),
        membershipRole: membership ? membership.role : null,
      },
      members: members.map((m) => ({
        ...m.user,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createCommunity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { name, description, category, rules, isPrivate, avatarUrl } = req.body;

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await Community.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A community with a similar name already exists.' });
    }

    const community = await Community.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      category: category.trim(),
      college: user.college,
      creator: user._id,
      rules: Array.isArray(rules) ? rules : [],
      isPrivate: Boolean(isPrivate),
      avatarUrl: avatarUrl || '',
      memberCount: 1,
    });

    // Automatically join creator as admin
    await CommunityMembership.create({
      community: community._id,
      user: user._id,
      role: 'admin',
    });

    return res.status(201).json({
      success: true,
      message: 'Community created successfully!',
      community: {
        ...community.toObject(),
        isMember: true,
        membershipRole: 'admin',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleJoinCommunity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found.' });
    }

    const existing = await CommunityMembership.findOne({
      community: community._id,
      user: user._id,
    });

    if (existing) {
      // Leave
      await CommunityMembership.deleteOne({ _id: existing._id });
      community.memberCount = Math.max(0, community.memberCount - 1);
      await community.save();

      return res.json({
        success: true,
        isMember: false,
        memberCount: community.memberCount,
        message: `You have left ${community.name}.`,
      });
    } else {
      // Join
      await CommunityMembership.create({
        community: community._id,
        user: user._id,
        role: 'member',
      });
      community.memberCount += 1;
      await community.save();

      return res.json({
        success: true,
        isMember: true,
        memberCount: community.memberCount,
        message: `Welcome to ${community.name}!`,
      });
    }
  } catch (err) {
    next(err);
  }
}
