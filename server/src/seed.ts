import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { College } from './models/College.js';
import { User } from './models/User.js';
import { Post } from './models/Post.js';
import { Comment } from './models/Comment.js';
import { Like } from './models/Like.js';
import { Resource } from './models/Resource.js';
import { LostFoundListing } from './models/LostFoundListing.js';
import { Community } from './models/Community.js';
import { CommunityMembership } from './models/CommunityMembership.js';
import { Project } from './models/Project.js';
import { ProjectApplication } from './models/ProjectApplication.js';
import { Conversation } from './models/Conversation.js';
import { Message } from './models/Message.js';
import { Notification } from './models/Notification.js';
import { Report } from './models/Report.js';

import { INSTITUTIONS } from './data/institutions.js';

export async function seedInstitutions(): Promise<number> {
  let count = 0;
  for (const inst of INSTITUTIONS) {
    await College.findOneAndUpdate(
      { code: inst.code },
      { $set: inst },
      { upsert: true, new: true }
    );
    count++;
  }
  console.log(`✅ Upserted ${count} verified institutions (Mathura, Noida, Greater Noida, & Demo).`);
  return count;
}

export async function runSeed() {
  console.log('🌱 Starting CampusConnect development database seed...');
  await connectDB();

  // Clean existing collections
  await Promise.all([
    College.deleteMany({}),
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Like.deleteMany({}),
    Resource.deleteMany({}),
    LostFoundListing.deleteMany({}),
    Community.deleteMany({}),
    CommunityMembership.deleteMany({}),
    Project.deleteMany({}),
    ProjectApplication.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
    Report.deleteMany({}),
  ]);

  console.log('🧹 Cleaned existing database records.');

  // 1. Seed Colleges with all verified institutions
  await seedInstitutions();
  const colleges = await College.find({ isActive: true });
  const ait = await College.findOne({ code: 'AIT' }) || colleges[0];
  console.log(`✅ Loaded ${colleges.length} total institutions. Primary demo: ${ait.name}`);

  // 2. Seed Users
  const defaultPassword = await bcrypt.hash('Password123!', 10);

  const users = await User.create([
    {
      name: 'Dr. Sarah Vance',
      email: 'admin@apex.edu',
      password: defaultPassword,
      college: ait._id,
      role: 'admin',
      isVerified: true,
      isOnboarded: true,
      department: 'Campus Administration',
      academicYear: 'Faculty',
      bio: 'CampusConnect Platform Administrator. Ensuring a safe, collaborative digital ecosystem for all students.',
      skills: ['Campus Management', 'Security', 'Policy'],
      interests: ['EdTech', 'Student Safety', 'Digital Campus'],
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Marcus Brody',
      email: 'moderator@apex.edu',
      password: defaultPassword,
      college: ait._id,
      role: 'moderator',
      isVerified: true,
      isOnboarded: true,
      department: 'Computer Science',
      academicYear: 'Year 4',
      bio: 'Student Honor Council Member & Peer Moderator. Keeping the feed helpful, kind, and spam-free.',
      skills: ['Community Leadership', 'Conflict Resolution', 'Python'],
      interests: ['Cybersecurity', 'Open Source', 'Hackathons'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Alex Chen',
      email: 'alex.chen@apex.edu',
      password: defaultPassword,
      college: ait._id,
      role: 'student',
      isVerified: true,
      isOnboarded: true,
      department: 'Computer Science',
      academicYear: 'Year 3',
      bio: 'Full-stack builder passionate about web development, distributed systems, and hackathons. Always excited to collaborate on creative projects!',
      skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS', 'Docker'],
      interests: ['Hackathons', 'Web Development', 'Open Source', 'Cloud Computing'],
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Maya Patel',
      email: 'maya.patel@apex.edu',
      password: defaultPassword,
      college: ait._id,
      role: 'student',
      isVerified: true,
      isOnboarded: true,
      department: 'Software Engineering',
      academicYear: 'Year 4',
      bio: 'UI/UX enthusiast and frontend engineer. Vice President of the Design Guild. Designing human-centered campus tools.',
      skills: ['UI/UX Design', 'Figma', 'React', 'Tailwind CSS', 'User Research', 'Prototyping'],
      interests: ['Design Systems', 'Accessibility', 'Entrepreneurship', 'Product Design'],
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Jordan Lee',
      email: 'jordan.lee@apex.edu',
      password: defaultPassword,
      college: ait._id,
      role: 'student',
      isVerified: true,
      isOnboarded: true,
      department: 'Data Science',
      academicYear: 'Year 2',
      bio: 'Working on NLP research and computer vision. Looking for teammates for upcoming college hackathons and Kaggle competitions.',
      skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'FastAPI', 'Pandas'],
      interests: ['AI/ML', 'Data Science', 'Research', 'Chess'],
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sam Wilson',
      email: 'sam.wilson@apex.edu',
      password: defaultPassword,
      college: ait._id,
      role: 'student',
      isVerified: true,
      isOnboarded: true,
      department: 'Electrical Engineering',
      academicYear: 'Year 3',
      bio: 'Robotics and embedded systems nerd. Building autonomous rovers in the maker space. Let’s build hardware+software syncs.',
      skills: ['C++', 'Embedded Systems', 'IoT', 'Arduino', 'Python', 'Circuit Design'],
      interests: ['Robotics', 'Hardware', 'CleanTech', 'Autonomous Systems'],
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    },
  ]);

  const [adminUser, modUser, alex, maya, jordan, sam] = users;
  console.log(`✅ Seeded ${users.length} verified users.`);

  // 3. Seed Posts & Campus Feed
  const posts = await Post.create([
    {
      author: adminUser._id,
      college: ait._id,
      title: 'Annual Apex Hackathon 2026: Registrations Open!',
      content:
        'We are thrilled to announce the 2026 Apex Annual Hackathon! Over $10,000 in project grants, sponsor prizes from leading tech companies, and mentorship booths. Head over to the Projects section to assemble your squad or join existing listings. Teams must have 3-5 members.',
      category: 'announcement',
      pinned: true,
      images: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['Hackathon', 'Grants', 'CampusEvent'],
      likesCount: 24,
      commentsCount: 2,
    },
    {
      author: alex._id,
      college: ait._id,
      title: 'Full-Stack Study Group for CS302 (Distributed Systems)',
      content:
        'Hey everyone! The midterm for Distributed Systems is coming up in two weeks. I am hosting an open study session at Library Study Room 4B this Thursday at 6:00 PM. We will cover Paxos, Raft consensus, and CAP theorem practice problems.',
      category: 'academic',
      images: [],
      tags: ['CS302', 'DistributedSystems', 'StudyGroup'],
      likesCount: 15,
      commentsCount: 1,
    },
    {
      author: maya._id,
      college: ait._id,
      title: 'Apex Design Sprint Workshop: Free Figma Licenses & Swag',
      content:
        'The Design Guild is hosting a hands-on workshop on Design Systems & Component Architecture this Friday. We have 30 sponsored Figma Education Pro licenses to distribute to attendees! RSVP in the Design Community.',
      category: 'event',
      images: [
        'https://images.unsplash.com/photo-1542744094-3a31727221eb?w=800&auto=format&fit=crop&q=80',
      ],
      tags: ['Design', 'UIUX', 'Figma', 'Workshop'],
      likesCount: 19,
      commentsCount: 0,
    },
    {
      author: jordan._id,
      college: ait._id,
      title: 'Machine Learning Reading Club: Paper Discussion on Attention Mechanisms',
      content:
        'This Saturday at 4 PM in the Science Hall auditorium, we will break down state-of-the-art multi-head attention and efficient transformer architectures. Beginners are welcome—we will walk through intuition before math equations!',
      category: 'academic',
      images: [],
      tags: ['AI', 'Transformers', 'MachineLearning'],
      likesCount: 11,
      commentsCount: 0,
    },
  ]);

  // Seed Comments & Likes
  await Comment.create([
    {
      post: posts[0]._id,
      author: alex._id,
      content: 'Can inter-departmental teams participate? E.g., CS + Electrical Engineering?',
    },
    {
      post: posts[0]._id,
      author: adminUser._id,
      content: 'Absolutely Alex! Cross-disciplinary teams are strongly encouraged and receive extra judging points.',
    },
    {
      post: posts[1]._id,
      author: jordan._id,
      content: 'Count me in for Thursday! I will bring copies of the previous semester practice exam.',
    },
  ]);

  await Like.create([
    { user: alex._id, post: posts[0]._id },
    { user: maya._id, post: posts[0]._id },
    { user: jordan._id, post: posts[1]._id },
  ]);

  console.log(`✅ Seeded ${posts.length} campus feed posts with comments and likes.`);

  // 4. Seed Academic Resources
  const resources = await Resource.create([
    {
      uploader: alex._id,
      college: ait._id,
      title: 'CS302 Distributed Systems: Comprehensive Exam Notes & Cheatsheet',
      description: 'Handwritten and typed summary notes covering Raft consensus, vector clocks, RPCs, and MapReduce paradigms.',
      department: 'Computer Science',
      academicYear: 'Year 3',
      subject: 'Distributed Systems (CS302)',
      resourceType: 'notes',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'CS302_Distributed_Systems_Summary_Notes.pdf',
      fileSize: 2450000,
      mimeType: 'application/pdf',
      downloadsCount: 42,
    },
    {
      uploader: jordan._id,
      college: ait._id,
      title: 'CS420 Machine Learning: Previous 3 Years Solved Question Papers',
      description: 'Complete solved midterm and final papers with step-by-step backpropagation derivations and ROC curve calculations.',
      department: 'Data Science',
      academicYear: 'Year 3',
      subject: 'Machine Learning (CS420)',
      resourceType: 'pyq',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'CS420_Solved_Midterms_2023_2025.pdf',
      fileSize: 3820000,
      mimeType: 'application/pdf',
      downloadsCount: 89,
    },
    {
      uploader: maya._id,
      college: ait._id,
      title: 'SE210 Software Engineering: Complete Course Syllabus & Lab Manual',
      description: 'Official department syllabus, Agile Scrum sprint guidelines, and grading rubrics for term projects.',
      department: 'Software Engineering',
      academicYear: 'Year 2',
      subject: 'Software Engineering Methodologies (SE210)',
      resourceType: 'syllabus',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'SE210_Lab_Manual_and_Rubric.pdf',
      fileSize: 1200000,
      mimeType: 'application/pdf',
      downloadsCount: 19,
    },
  ]);
  console.log(`✅ Seeded ${resources.length} academic resources.`);

  // 5. Seed Lost & Found
  const lostFoundItems = await LostFoundListing.create([
    {
      author: alex._id,
      college: ait._id,
      type: 'lost',
      title: 'Apple AirPods Pro (2nd Gen) with Spigen Black Case',
      description: 'Lost on Monday evening around 5:30 PM in Library 2nd Floor Silent Study Section. The case has a small red carabiner.',
      category: 'electronics',
      campusLocation: 'Central Library - 2nd Floor Quiet Zone',
      incidentDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&auto=format&fit=crop&q=80',
      contactPreference: 'in_app_chat',
      status: 'open',
    },
    {
      author: maya._id,
      college: ait._id,
      type: 'found',
      title: 'Blue Hydro Flask Water Bottle with Stickers',
      description: 'Found on the bench right outside the Student Union cafeteria. Has a NASA sticker and an Apex Tech sticker on the side.',
      category: 'other',
      campusLocation: 'Student Union Cafeteria Patio',
      incidentDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80',
      contactPreference: 'in_app_chat',
      status: 'open',
    },
    {
      author: sam._id,
      college: ait._id,
      type: 'found',
      title: 'TI-84 Plus CE Graphing Calculator in Yellow Case',
      description: 'Found after Physics Lab 102 in Engineering Hall room 305. Turned into the building desk or message me directly.',
      category: 'electronics',
      campusLocation: 'Engineering Hall - Lab 305',
      incidentDate: new Date(Date.now() - 72 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400&auto=format&fit=crop&q=80',
      contactPreference: 'in_app_chat',
      status: 'resolved',
    },
  ]);
  console.log(`✅ Seeded ${lostFoundItems.length} lost and found listings.`);

  // 6. Seed Communities
  const communities = await Community.create([
    {
      name: 'Apex Coders & Open Source',
      slug: 'apex-coders',
      description: 'The premier student developer collective. We collaborate on open-source projects, prepare for technical interviews, and run weekend build jams.',
      category: 'Coding',
      college: ait._id,
      creator: alex._id,
      avatarUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
      rules: ['Respect every skill level', 'Share helpful code snippets with context', 'No spam or paid service promotion'],
      memberCount: 142,
    },
    {
      name: 'AI & Machine Learning Club',
      slug: 'ai-ml-club',
      description: 'Exploring machine learning, generative models, deep reinforcement learning, and research paper reviews.',
      category: 'AI/ML',
      college: ait._id,
      creator: jordan._id,
      avatarUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=150&auto=format&fit=crop&q=80',
      rules: ['Cite all papers and sources', 'Encourage peer learning', 'No unauthorized AI homework generation sharing'],
      memberCount: 98,
    },
    {
      name: 'Design Guild & UI/UX Collective',
      slug: 'design-guild',
      description: 'For product designers, graphic artists, and design system advocates. Design sprints, portfolio critique sessions, and Figma tips.',
      category: 'Design',
      college: ait._id,
      creator: maya._id,
      avatarUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=150&auto=format&fit=crop&q=80',
      rules: ['Provide constructive, actionable critique', 'Credit original inspirations', 'Keep files neatly organized'],
      memberCount: 76,
    },
    {
      name: 'Placement & Internship Preparation 2026',
      slug: 'placement-prep',
      description: 'Mock behavioral interviews, LeetCode daily study streaks, resume reviews, and campus referral networks.',
      category: 'Placement Prep',
      college: ait._id,
      creator: adminUser._id,
      avatarUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150&auto=format&fit=crop&q=80',
      rules: ['Be honest in interview debriefs', 'Support fellow candidates', 'Strictly confidential salary/offer discussions'],
      memberCount: 210,
    },
  ]);

  // Seed memberships
  await CommunityMembership.create([
    { community: communities[0]._id, user: alex._id, role: 'admin' },
    { community: communities[0]._id, user: maya._id, role: 'member' },
    { community: communities[0]._id, user: jordan._id, role: 'member' },
    { community: communities[1]._id, user: jordan._id, role: 'admin' },
    { community: communities[1]._id, user: alex._id, role: 'member' },
    { community: communities[2]._id, user: maya._id, role: 'admin' },
    { community: communities[3]._id, user: adminUser._id, role: 'admin' },
  ]);

  console.log(`✅ Seeded ${communities.length} student communities with memberships.`);

  // 7. Seed Projects & Hackathon Listings
  const projects = await Project.create([
    {
      creator: alex._id,
      college: ait._id,
      title: 'EcoRoute: AI-Powered Smart Campus Transit Navigator',
      problemStatement:
        'Campus shuttles operate on rigid timetables that lead to overcrowding during peak lecture transitions and empty runs during midday. Students waste 20+ minutes waiting for campus transit without real-time passenger capacity visibility.',
      description:
        'We are building EcoRoute for the upcoming Apex Hackathon. The platform pairs computer-vision bus sensors with a progressive web app to provide students with real-time bus locations, seat availability, and intelligent walking route alternatives based on weather and class schedules.',
      category: 'hackathon',
      techStack: ['React', 'TypeScript', 'Node.js', 'FastAPI', 'PyTorch', 'Tailwind CSS'],
      requiredSkills: ['React', 'TypeScript', 'Node.js', 'Python'],
      projectStage: 'prototype',
      teamSize: 4,
      openRoles: ['Frontend Engineer (React/Tailwind)', 'ML Engineer (Capacity Vision)'],
      expectedCommitment: '8-10 hrs/week',
      collaborationPreference: 'hybrid',
      status: 'recruiting',
      teamMembers: [
        { user: alex._id, role: 'Tech Lead & Backend', joinedAt: new Date() },
        { user: sam._id, role: 'IoT & Sensor Integration', joinedAt: new Date() },
      ],
    },
    {
      creator: maya._id,
      college: ait._id,
      title: 'SkillSwap: Peer-to-Peer Micro-Tutoring Platform',
      problemStatement:
        'Students often excel in one subject (like Calculus) but struggle in another (like Organic Chemistry). Professional tutoring is prohibitively expensive, while peer tutoring remains unstructured and difficult to coordinate.',
      description:
        'SkillSwap is an academic micro-tutoring marketplace where college credits/hours are swapped rather than money. Help a peer for 1 hour with Python, earn 1 tutoring credit to spend with an Organic Chemistry tutor.',
      category: 'startup',
      techStack: ['React', 'Node.js', 'Figma', 'MongoDB'],
      requiredSkills: ['UI/UX Design', 'React', 'Figma'],
      projectStage: 'idea',
      teamSize: 3,
      openRoles: ['Full-Stack Developer', 'Marketing & Campus Outreach'],
      expectedCommitment: '5 hrs/week',
      collaborationPreference: 'remote',
      status: 'recruiting',
      teamMembers: [{ user: maya._id, role: 'Product & Design Lead', joinedAt: new Date() }],
    },
    {
      creator: jordan._id,
      college: ait._id,
      title: 'MediScan: Deep Learning Chest X-Ray Triage Assistant',
      problemStatement:
        'Rural and under-resourced university healthcare centers face severe backlogs in radiological image interpretation, delaying critical pulmonary diagnoses.',
      description:
        'Research project evaluating self-supervised vision transformers on anonymized chest radiography benchmarks. Aiming to submit a paper to the IEEE BioEngineering Conference.',
      category: 'research',
      techStack: ['Python', 'PyTorch', 'CUDA', 'FastAPI', 'Docker'],
      requiredSkills: ['Python', 'Machine Learning', 'PyTorch'],
      projectStage: 'in_progress',
      teamSize: 3,
      openRoles: ['Research Collaborator (NLP / Vision)'],
      expectedCommitment: '10 hrs/week',
      collaborationPreference: 'hybrid',
      status: 'recruiting',
      teamMembers: [{ user: jordan._id, role: 'Primary Researcher', joinedAt: new Date() }],
    },
  ]);

  // Seed Project Applications
  await ProjectApplication.create([
    {
      project: projects[0]._id,
      applicant: jordan._id,
      roleApplied: 'ML Engineer (Capacity Vision)',
      note: 'Hi Alex! I have experience training lightweight YOLO models and building FastAPI endpoints for streaming computer vision inference. I’d love to join EcoRoute for the hackathon!',
      status: 'pending',
    },
  ]);

  console.log(`✅ Seeded ${projects.length} collaborative projects with applications.`);

  // 8. Seed Conversation & Messages
  const conversation = await Conversation.create({
    participants: [alex._id, maya._id],
    isGroup: false,
    lastMessage: {
      text: 'Hey Maya! Are you free to review the UI wireframes for EcoRoute tomorrow?',
      sender: alex._id,
      createdAt: new Date(),
    },
  });

  await Message.create([
    {
      conversation: conversation._id,
      sender: maya._id,
      text: 'Hey Alex! Loved your post on Distributed Systems study groups.',
      readBy: [maya._id, alex._id],
    },
    {
      conversation: conversation._id,
      sender: alex._id,
      text: 'Thanks Maya! Are you free to review the UI wireframes for EcoRoute tomorrow?',
      readBy: [alex._id],
    },
  ]);

  console.log(`✅ Seeded direct messaging conversation and message history.`);

  // 9. Seed Notifications
  await Notification.create([
    {
      recipient: alex._id,
      sender: jordan._id,
      type: 'project_application',
      title: 'New Teammate Application',
      message: 'Jordan Lee applied for "ML Engineer (Capacity Vision)" on your project EcoRoute.',
      link: '/app/projects',
      isRead: false,
    },
    {
      recipient: alex._id,
      sender: maya._id,
      type: 'post_like',
      title: 'Post Liked',
      message: 'Maya Patel liked your post: "Full-Stack Study Group for CS302..."',
      link: '/app/feed',
      isRead: false,
    },
    {
      recipient: alex._id,
      sender: adminUser._id,
      type: 'campus_alert',
      title: 'Campus Announcement',
      message: 'Annual Apex Hackathon 2026 registrations are now officially open!',
      link: '/app/feed',
      isRead: true,
    },
  ]);

  console.log(`✅ Seeded sample student notifications.`);

  console.log('\n======================================================');
  console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('Demo Accounts for Testing (Password for all: Password123!)');
  console.log('1. Admin:      admin@apex.edu');
  console.log('2. Moderator:  moderator@apex.edu');
  console.log('3. Student 1:  alex.chen@apex.edu (CS Year 3, full-stack)');
  console.log('4. Student 2:  maya.patel@apex.edu (SE Year 4, UI/UX)');
  console.log('5. Student 3:  jordan.lee@apex.edu (Data Science Year 2, AI/ML)');
  console.log('======================================================\n');
}

// Execute when invoked directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failure:', err);
      process.exit(1);
    });
}
