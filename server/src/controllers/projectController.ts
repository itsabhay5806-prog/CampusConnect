import { Response, NextFunction } from 'express';
import { Project, IProject } from '../models/Project.js';
import { ProjectApplication } from '../models/ProjectApplication.js';
import { SavedItem } from '../models/SavedItem.js';
import { Notification } from '../models/Notification.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

function calculateSkillMatch(userSkills: string[], requiredSkills: string[]) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { matchCount: 0, totalRequired: 0, matchPercentage: 100, matchingSkills: [] };
  }
  const normalizedUser = (userSkills || []).map((s) => s.toLowerCase().trim());
  const matchingSkills = requiredSkills.filter((reqSkill) =>
    normalizedUser.includes(reqSkill.toLowerCase().trim())
  );
  const matchCount = matchingSkills.length;
  const matchPercentage = Math.round((matchCount / requiredSkills.length) * 100);

  return {
    matchCount,
    totalRequired: requiredSkills.length,
    matchPercentage,
    matchingSkills,
    summary:
      matchCount > 0
        ? `Matches ${matchCount} of ${requiredSkills.length} required skill${requiredSkills.length > 1 ? 's' : ''} (${matchingSkills.join(', ')})`
        : `No direct skill overlap with your profile yet`,
  };
}

export async function getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { category, stage, status, search, skill } = req.query;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = Math.min(parseInt(req.query.limit as string || '12', 10), 50);

    const filter: any = {
      college: user.college,
    };

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (stage && stage !== 'all') {
      filter.projectStage = stage;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (skill && skill !== 'all') {
      filter.requiredSkills = { $in: [new RegExp(String(skill).trim(), 'i')] };
    }
    if (search && String(search).trim()) {
      filter.$or = [
        { title: { $regex: String(search).trim(), $options: 'i' } },
        { problemStatement: { $regex: String(search).trim(), $options: 'i' } },
        { description: { $regex: String(search).trim(), $options: 'i' } },
        { techStack: { $in: [new RegExp(String(search).trim(), 'i')] } },
      ];
    }

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('creator', 'name avatarUrl department academicYear')
      .populate('teamMembers.user', 'name avatarUrl')
      .lean();

    const projectIds = projects.map((p) => p._id);
    const [savedItems, applications] = await Promise.all([
      SavedItem.find({ user: user._id, itemType: 'project', itemId: { $in: projectIds } }).lean(),
      ProjectApplication.find({ applicant: user._id, project: { $in: projectIds } }).lean(),
    ]);

    const savedIds = new Set(savedItems.map((s) => s.itemId.toString()));
    const appMap = new Map(applications.map((a) => [a.project.toString(), a]));

    const formatted = projects.map((project) => {
      const matchData = calculateSkillMatch(user.skills, project.requiredSkills);
      const userApp = appMap.get(project._id.toString());
      const isCreator = project.creator?._id?.toString() === user._id.toString();
      const isMember = project.teamMembers?.some(
        (m: any) => m.user?._id?.toString() === user._id.toString() || m.user?.toString() === user._id.toString()
      );

      return {
        ...project,
        isSaved: savedIds.has(project._id.toString()),
        isCreator,
        isMember,
        myApplication: userApp
          ? {
              id: userApp._id,
              status: userApp.status,
              roleApplied: userApp.roleApplied,
              createdAt: userApp.createdAt,
            }
          : null,
        skillMatch: matchData,
      };
    });

    // Optionally sort by matchPercentage if requested
    if (req.query.sortByMatch === 'true') {
      formatted.sort((a, b) => b.skillMatch.matchPercentage - a.skillMatch.matchPercentage);
    }

    return res.json({
      success: true,
      projects: formatted,
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

export async function getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const project = await Project.findById(req.params.id)
      .populate('creator', 'name avatarUrl department academicYear email')
      .populate('teamMembers.user', 'name avatarUrl department')
      .lean();

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const [saved, application, applicationsForOwner] = await Promise.all([
      SavedItem.findOne({ user: user._id, itemType: 'project', itemId: project._id }),
      ProjectApplication.findOne({ applicant: user._id, project: project._id }).lean(),
      project.creator?._id?.toString() === user._id.toString()
        ? ProjectApplication.find({ project: project._id })
            .populate('applicant', 'name avatarUrl department academicYear skills')
            .sort({ createdAt: -1 })
            .lean()
        : null,
    ]);

    const isCreator = project.creator?._id?.toString() === user._id.toString();
    const isMember = project.teamMembers?.some(
      (m: any) => m.user?._id?.toString() === user._id.toString() || m.user?.toString() === user._id.toString()
    );

    return res.json({
      success: true,
      project: {
        ...project,
        isSaved: Boolean(saved),
        isCreator,
        isMember,
        myApplication: application,
        skillMatch: calculateSkillMatch(user.skills, project.requiredSkills),
        ownerApplications: applicationsForOwner || [],
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const {
      title,
      problemStatement,
      description,
      category,
      techStack,
      requiredSkills,
      projectStage,
      teamSize,
      openRoles,
      expectedCommitment,
      deadline,
      collaborationPreference,
    } = req.body;

    const project = await Project.create({
      creator: user._id,
      college: user.college,
      title: title.trim(),
      problemStatement: problemStatement.trim(),
      description: description.trim(),
      category: category || 'hackathon',
      techStack: Array.isArray(techStack) ? techStack : [],
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      projectStage: projectStage || 'idea',
      teamSize: Number(teamSize) || 4,
      openRoles: Array.isArray(openRoles) ? openRoles : [],
      expectedCommitment: expectedCommitment || '5-10 hrs/week',
      deadline: deadline ? new Date(deadline) : undefined,
      collaborationPreference: collaborationPreference || 'hybrid',
      status: 'recruiting',
      teamMembers: [
        {
          user: user._id,
          role: 'Project Lead',
          joinedAt: new Date(),
        },
      ],
    });

    const populated = await Project.findById(project._id)
      .populate('creator', 'name avatarUrl department')
      .populate('teamMembers.user', 'name avatarUrl');

    return res.status(201).json({
      success: true,
      message: 'Project listing created successfully! Students can now discover and apply.',
      project: populated,
    });
  } catch (err) {
    next(err);
  }
}

export async function applyToProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const projectId = req.params.id;
    const { roleApplied, note } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.creator.toString() === user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You are the creator of this project.' });
    }

    const isAlreadyMember = project.teamMembers.some((m) => m.user.toString() === user._id.toString());
    if (isAlreadyMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this project team.' });
    }

    const existingApplication = await ProjectApplication.findOne({
      project: project._id,
      applicant: user._id,
      status: 'pending',
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending application for this project.',
      });
    }

    const application = await ProjectApplication.create({
      project: project._id,
      applicant: user._id,
      roleApplied: roleApplied.trim(),
      note: note.trim(),
      status: 'pending',
    });

    // Notify project creator
    await Notification.create({
      recipient: project.creator,
      sender: user._id,
      type: 'project_application',
      title: 'New Teammate Application',
      message: `${user.name} applied for "${roleApplied}" on your project "${project.title}".`,
      link: `/app/projects`,
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully! The project lead will review your submission.',
      application,
    });
  } catch (err) {
    next(err);
  }
}

export async function withdrawApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const application = await ProjectApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.applicant.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to withdraw this application.' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot withdraw an application that is already ${application.status}.` });
    }

    application.status = 'withdrawn';
    await application.save();

    return res.json({ success: true, message: 'Application withdrawn successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function manageApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { action, decisionNote } = req.body; // action: 'accept' | 'reject'
    const application = await ProjectApplication.findById(req.params.id).populate('project');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const project = await Project.findById(application.project);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Associated project not found.' });
    }

    if (project.creator.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project creator can review applications.' });
    }

    if (action === 'accept') {
      application.status = 'accepted';
      application.decisionNote = decisionNote?.trim();
      await application.save();

      // Add to teamMembers if not present
      const alreadyMember = project.teamMembers.some((m) => m.user.toString() === application.applicant.toString());
      if (!alreadyMember) {
        project.teamMembers.push({
          user: application.applicant,
          role: application.roleApplied,
          joinedAt: new Date(),
        });
        await project.save();
      }

      await Notification.create({
        recipient: application.applicant,
        sender: user._id,
        type: 'application_decision',
        title: 'Application Accepted! 🎉',
        message: `Congratulations! You were accepted as "${application.roleApplied}" on "${project.title}".`,
        link: '/app/projects',
      });

      return res.json({
        success: true,
        message: 'Application accepted! Applicant has been added to your team.',
        application,
      });
    } else if (action === 'reject') {
      application.status = 'rejected';
      application.decisionNote = decisionNote?.trim();
      await application.save();

      await Notification.create({
        recipient: application.applicant,
        sender: user._id,
        type: 'application_decision',
        title: 'Application Update',
        message: `Your application for "${project.title}" was not selected at this time.`,
        link: '/app/projects',
      });

      return res.json({
        success: true,
        message: 'Application declined.',
        application,
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action specified.' });
    }
  } catch (err) {
    next(err);
  }
}

export async function toggleSaveProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const projectId = req.params.id;

    const existing = await SavedItem.findOne({ user: user._id, itemType: 'project', itemId: projectId });

    if (existing) {
      await SavedItem.deleteOne({ _id: existing._id });
      return res.json({ success: true, isSaved: false, message: 'Removed from saved projects.' });
    } else {
      await SavedItem.create({ user: user._id, itemType: 'project', itemId: projectId });
      return res.json({ success: true, isSaved: true, message: 'Saved to your projects list.' });
    }
  } catch (err) {
    next(err);
  }
}
