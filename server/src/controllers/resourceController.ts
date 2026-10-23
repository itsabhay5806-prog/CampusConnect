import { Response, NextFunction } from 'express';
import { Resource } from '../models/Resource.js';
import { SavedItem } from '../models/SavedItem.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getResources(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { department, academicYear, subject, resourceType, search } = req.query;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = Math.min(parseInt(req.query.limit as string || '15', 10), 50);

    const filter: any = {
      college: user.college,
      isHidden: false,
    };

    if (department && department !== 'all') {
      filter.department = department;
    }
    if (academicYear && academicYear !== 'all') {
      filter.academicYear = academicYear;
    }
    if (subject && subject !== 'all') {
      filter.subject = { $regex: String(subject), $options: 'i' };
    }
    if (resourceType && resourceType !== 'all') {
      filter.resourceType = resourceType;
    }
    if (search && String(search).trim()) {
      filter.$or = [
        { title: { $regex: String(search).trim(), $options: 'i' } },
        { description: { $regex: String(search).trim(), $options: 'i' } },
        { subject: { $regex: String(search).trim(), $options: 'i' } },
      ];
    }

    const total = await Resource.countDocuments(filter);
    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('uploader', 'name avatarUrl department role')
      .lean();

    const resourceIds = resources.map((r) => r._id);
    const savedItems = await SavedItem.find({
      user: user._id,
      itemType: 'resource',
      itemId: { $in: resourceIds },
    }).lean();

    const savedIds = new Set(savedItems.map((s) => s.itemId.toString()));

    const formatted = resources.map((resItem) => ({
      ...resItem,
      isSaved: savedIds.has(resItem._id.toString()),
      isUploader: resItem.uploader?._id?.toString() === user._id.toString(),
    }));

    return res.json({
      success: true,
      resources: formatted,
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

export async function uploadResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { title, description, department, academicYear, subject, resourceType, fileUrl, fileName, fileSize, mimeType } = req.body;

    if (!fileUrl || !fileName || !fileSize) {
      return res.status(400).json({ success: false, message: 'Uploaded file details are missing.' });
    }

    const resource = await Resource.create({
      uploader: user._id,
      college: user.college,
      title: title.trim(),
      description: description?.trim(),
      department: department.trim(),
      academicYear: academicYear.trim(),
      subject: subject.trim(),
      resourceType,
      fileUrl,
      fileName,
      fileSize: Number(fileSize),
      mimeType: mimeType || 'application/octet-stream',
    });

    const populated = await Resource.findById(resource._id).populate('uploader', 'name avatarUrl department role');

    return res.status(201).json({
      success: true,
      message: 'Academic resource uploaded successfully!',
      resource: {
        ...populated?.toObject(),
        isSaved: false,
        isUploader: true,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function incrementDownload(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadsCount: 1 } },
      { new: true }
    );
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    return res.json({ success: true, downloadsCount: resource.downloadsCount });
  } catch (err) {
    next(err);
  }
}

export async function toggleSaveResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const resourceId = req.params.id;

    const existing = await SavedItem.findOne({ user: user._id, itemType: 'resource', itemId: resourceId });

    if (existing) {
      await SavedItem.deleteOne({ _id: existing._id });
      return res.json({ success: true, isSaved: false, message: 'Removed from saved resources.' });
    } else {
      await SavedItem.create({ user: user._id, itemType: 'resource', itemId: resourceId });
      return res.json({ success: true, isSaved: true, message: 'Saved to your study collection.' });
    }
  } catch (err) {
    next(err);
  }
}

export async function deleteResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const isUploader = resource.uploader.toString() === user._id.toString();
    const isModOrAdmin = user.role === 'moderator' || user.role === 'admin';

    if (!isUploader && !isModOrAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this resource.' });
    }

    await Resource.deleteOne({ _id: resource._id });
    await SavedItem.deleteMany({ itemType: 'resource', itemId: resource._id });

    return res.json({ success: true, message: 'Resource deleted successfully.' });
  } catch (err) {
    next(err);
  }
}
