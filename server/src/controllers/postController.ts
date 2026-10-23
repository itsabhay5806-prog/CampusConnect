import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Like } from '../models/Like.js';
import { SavedItem } from '../models/SavedItem.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getPosts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = Math.min(parseInt(req.query.limit as string || '15', 10), 50);
    const category = req.query.category as string;
    const search = req.query.search as string;

    const filter: any = {
      college: user.college,
      isHidden: false,
    };

    if (category && ['announcement', 'event', 'academic', 'general'].includes(category)) {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ pinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name avatarUrl department academicYear role isVerified')
      .lean();

    // Check liked & saved status for current user
    const postIds = posts.map((p) => p._id);
    const [likes, saves] = await Promise.all([
      Like.find({ user: user._id, post: { $in: postIds } }).lean(),
      SavedItem.find({ user: user._id, itemType: 'post', itemId: { $in: postIds } }).lean(),
    ]);

    const likedPostIds = new Set(likes.map((l) => l.post.toString()));
    const savedPostIds = new Set(saves.map((s) => s.itemId.toString()));

    const postsWithMeta = posts.map((post) => ({
      ...post,
      isLiked: likedPostIds.has(post._id.toString()),
      isSaved: savedPostIds.has(post._id.toString()),
      isAuthor: post.author?._id?.toString() === user._id.toString(),
    }));

    return res.json({
      success: true,
      posts: postsWithMeta,
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

export async function createPost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { title, content, category, images, tags, pinned } = req.body;

    const isModeratorOrAdmin = user.role === 'moderator' || user.role === 'admin';
    const canPin = pinned && isModeratorOrAdmin;

    const post = await Post.create({
      author: user._id,
      college: user.college,
      title: title?.trim(),
      content: content.trim(),
      category: category || 'general',
      images: Array.isArray(images) ? images : [],
      tags: Array.isArray(tags) ? tags : [],
      pinned: Boolean(canPin),
    });

    const populated = await Post.findById(post._id).populate(
      'author',
      'name avatarUrl department academicYear role isVerified'
    );

    return res.status(201).json({
      success: true,
      message: 'Post published successfully!',
      post: {
        ...populated?.toObject(),
        isLiked: false,
        isSaved: false,
        isAuthor: true,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleLikePost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const existingLike = await Like.findOne({ user: user._id, post: post._id });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();

      return res.json({
        success: true,
        liked: false,
        likesCount: post.likesCount,
      });
    } else {
      await Like.create({ user: user._id, post: post._id });
      post.likesCount += 1;
      await post.save();

      // Create notification for post author if not self
      if (post.author.toString() !== user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: user._id,
          type: 'post_like',
          title: 'New Like',
          message: `${user.name} liked your post: "${(post.title || post.content).substring(0, 40)}..."`,
          link: '/app/feed',
        });
      }

      return res.json({
        success: true,
        liked: true,
        likesCount: post.likesCount,
      });
    }
  } catch (err) {
    next(err);
  }
}

export async function getComments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .populate('author', 'name avatarUrl department role')
      .lean();

    return res.json({
      success: true,
      comments: comments.map((c) => ({
        ...c,
        isAuthor: c.author?._id?.toString() === req.user!._id.toString(),
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const postId = req.params.id;
    const { content } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comment = await Comment.create({
      post: post._id,
      author: user._id,
      content: content.trim(),
    });

    post.commentsCount += 1;
    await post.save();

    const populated = await Comment.findById(comment._id).populate('author', 'name avatarUrl department role');

    // Notify author if not self
    if (post.author.toString() !== user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: user._id,
        type: 'post_comment',
        title: 'New Comment',
        message: `${user.name} commented on your post: "${content.substring(0, 40)}..."`,
        link: '/app/feed',
      });
    }

    return res.status(201).json({
      success: true,
      comment: {
        ...populated?.toObject(),
        isAuthor: true,
      },
      commentsCount: post.commentsCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const isAuthor = post.author.toString() === user._id.toString();
    const isModOrAdmin = user.role === 'moderator' || user.role === 'admin';

    if (!isAuthor && !isModOrAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this post.' });
    }

    await Promise.all([
      Post.deleteOne({ _id: post._id }),
      Comment.deleteMany({ post: post._id }),
      Like.deleteMany({ post: post._id }),
      SavedItem.deleteMany({ itemType: 'post', itemId: post._id }),
    ]);

    return res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function toggleSavePost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const postId = req.params.id;

    const existing = await SavedItem.findOne({ user: user._id, itemType: 'post', itemId: postId });

    if (existing) {
      await SavedItem.deleteOne({ _id: existing._id });
      return res.json({ success: true, isSaved: false, message: 'Removed from saved items.' });
    } else {
      await SavedItem.create({ user: user._id, itemType: 'post', itemId: postId });
      return res.json({ success: true, isSaved: true, message: 'Saved to your collection.' });
    }
  } catch (err) {
    next(err);
  }
}
