import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Project } from '../models/Project.js';
import { Resource } from '../models/Resource.js';
import { SavedItem } from '../models/SavedItem.js';
import { CommunityMembership } from '../models/CommunityMembership.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getUserProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const targetUserId = req.params.id;
    const currentUser = req.user!;

    const targetUser = await User.findById(targetUserId)
      .populate('college', 'name code city state')
      .lean();

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    // Check if viewing own profile
    const isSelf = targetUser._id.toString() === currentUser._id.toString();

    // Check privacy settings
    if (!isSelf) {
      if (targetUser.privacySettings?.profileVisibility === 'private') {
        return res.status(403).json({
          success: false,
          message: 'This student has set their profile to private.',
        });
      }
      if (
        targetUser.privacySettings?.profileVisibility === 'college' &&
        targetUser.college?._id?.toString() !== currentUser.college.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'This profile is only visible to verified students of the same college.',
        });
      }
    }

    // Fetch user's joined communities, posts, and projects
    const [memberships, posts, projects] = await Promise.all([
      CommunityMembership.find({ user: targetUser._id }).populate('community', 'name slug category avatarUrl memberCount').lean(),
      Post.find({ author: targetUser._id, isHidden: false }).sort({ createdAt: -1 }).limit(10).lean(),
      Project.find({ $or: [{ creator: targetUser._id }, { 'teamMembers.user': targetUser._id }] }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const isBlocked = currentUser.blockedUsers?.some((id) => id.toString() === targetUser._id.toString());

    return res.json({
      success: true,
      profile: {
        _id: targetUser._id,
        name: targetUser.name,
        email: isSelf || targetUser.privacySettings?.showEmail ? targetUser.email : undefined,
        college: targetUser.college,
        department: targetUser.department,
        academicYear: targetUser.academicYear,
        bio: targetUser.bio,
        skills: targetUser.skills,
        interests: targetUser.interests,
        avatarUrl: targetUser.avatarUrl,
        role: targetUser.role,
        isVerified: targetUser.isVerified,
        createdAt: targetUser.createdAt,
        privacySettings: isSelf ? targetUser.privacySettings : undefined,
      },
      communities: memberships.map((m) => m.community).filter(Boolean),
      posts,
      projects,
      isSelf,
      isBlocked: Boolean(isBlocked),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { name, department, academicYear, bio, skills, interests, avatarUrl, privacySettings } = req.body;

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) userDoc.name = name.trim();
    if (department) userDoc.department = department.trim();
    if (academicYear) userDoc.academicYear = academicYear.trim();
    if (bio !== undefined) userDoc.bio = bio.trim();
    if (Array.isArray(skills)) userDoc.skills = skills.map((s: string) => s.trim()).filter(Boolean);
    if (Array.isArray(interests)) userDoc.interests = interests.map((i: string) => i.trim()).filter(Boolean);
    if (avatarUrl !== undefined) userDoc.avatarUrl = avatarUrl;
    if (privacySettings) {
      userDoc.privacySettings = {
        ...userDoc.privacySettings,
        ...privacySettings,
      };
    }

    await userDoc.save();
    const updated = await User.findById(userDoc._id).populate('college', 'name code domains city state');

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { currentPassword, newPassword } = req.body;

    const userDoc = await User.findById(user._id).select('+password');
    if (!userDoc || !userDoc.password) {
      return res.status(400).json({ success: false, message: 'Account error.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userDoc.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    userDoc.password = await bcrypt.hash(newPassword, salt);
    await userDoc.save();

    return res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function toggleBlockUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const currentUser = req.user!;
    const targetUserId = req.params.id;

    if (currentUser._id.toString() === targetUserId) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself.' });
    }

    const userDoc = await User.findById(currentUser._id);
    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isBlocked = userDoc.blockedUsers.some((id) => id.toString() === targetUserId);

    if (isBlocked) {
      userDoc.blockedUsers = userDoc.blockedUsers.filter((id) => id.toString() !== targetUserId);
      await userDoc.save();
      return res.json({ success: true, isBlocked: false, message: 'User unblocked.' });
    } else {
      userDoc.blockedUsers.push(targetUserId as any);
      await userDoc.save();
      return res.json({ success: true, isBlocked: true, message: 'User blocked.' });
    }
  } catch (err) {
    next(err);
  }
}

export async function getBlockedUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!._id).populate('blockedUsers', 'name avatarUrl department');
    return res.json({ success: true, blockedUsers: user?.blockedUsers || [] });
  } catch (err) {
    next(err);
  }
}

export async function getSavedItems(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const saved = await SavedItem.find({ user: user._id }).sort({ createdAt: -1 }).lean();

    const postIds = saved.filter((s) => s.itemType === 'post').map((s) => s.itemId);
    const resourceIds = saved.filter((s) => s.itemType === 'resource').map((s) => s.itemId);
    const projectIds = saved.filter((s) => s.itemType === 'project').map((s) => s.itemId);

    const [posts, resources, projects] = await Promise.all([
      Post.find({ _id: { $in: postIds } }).populate('author', 'name avatarUrl department').lean(),
      Resource.find({ _id: { $in: resourceIds } }).populate('uploader', 'name avatarUrl').lean(),
      Project.find({ _id: { $in: projectIds } }).populate('creator', 'name avatarUrl').lean(),
    ]);

    return res.json({
      success: true,
      savedItems: {
        posts,
        resources,
        projects,
      },
    });
  } catch (err) {
    next(err);
  }
}
