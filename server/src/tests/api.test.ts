import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { College } from '../models/College.js';
import { User } from '../models/User.js';
import { EmailVerification } from '../models/EmailVerification.js';

import { devOtpStore } from '../config/mailer.js';
import { CollegeSuggestion } from '../models/CollegeSuggestion.js';

describe('CampusConnect API Test Suite', () => {
  let collegeId: string;
  let testUserToken: string;
  let testUserId: string;

  beforeAll(async () => {
    await connectDB();

    // Upsert a test college
    const college = await College.findOneAndUpdate(
      { code: 'TU' },
      {
        $set: {
          name: 'Test University',
          code: 'TU',
          domains: ['test.edu'],
          city: 'Test City',
          district: 'Test District',
          state: 'Test State',
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );
    collegeId = college._id.toString();
  }, 30000);

  afterAll(async () => {
    await College.deleteMany({ code: 'TU' });
    await User.deleteMany({ email: 'jane.doe@test.edu' });
    await EmailVerification.deleteMany({ email: 'jane.doe@test.edu' });
    await CollegeSuggestion.deleteMany({ submitterEmail: 'jane.doe@test.edu' });
    await disconnectDB();
  }, 30000);

  describe('Health Check', () => {
    it('GET /api/health returns 200 with healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('CampusConnect API');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('College Registry & Institutional Domain Search', () => {
    it('GET /api/v1/auth/colleges returns registered institutions with city filters', async () => {
      const res = await request(app).get('/api/v1/auth/colleges');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.colleges.length).toBeGreaterThan(0);
      expect(res.body.availableCities).toContain('All');
    });

    it('Filters institutions by city (Mathura)', async () => {
      const res = await request(app).get('/api/v1/auth/colleges?city=Mathura');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Mathura colleges should all have city Mathura
      for (const c of res.body.colleges) {
        expect(c.city).toBe('Mathura');
      }
    });

    it('Filters institutions by city (Noida)', async () => {
      const res = await request(app).get('/api/v1/auth/colleges?city=Noida');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const c of res.body.colleges) {
        expect(c.city).toBe('Noida');
      }
    });

    it('Submits a college suggestion and rejects duplicate pending submissions', async () => {
      const suggestionPayload = {
        name: 'New Mathura Polytechnic Institute',
        city: 'Mathura',
        district: 'Mathura',
        state: 'Uttar Pradesh',
        website: 'https://nmpi.edu.in',
        domain: 'nmpi.edu.in',
        submitterEmail: 'jane.doe@test.edu',
      };

      const res1 = await request(app).post('/api/v1/auth/college-suggestions').send(suggestionPayload);
      expect(res1.status).toBe(201);
      expect(res1.body.success).toBe(true);
      expect(res1.body.message).toContain('submitted for administrative verification');

      // Duplicate submission test
      const res2 = await request(app).post('/api/v1/auth/college-suggestions').send(suggestionPayload);
      expect(res2.status).toBe(409);
      expect(res2.body.success).toBe(false);
      expect(res2.body.message).toContain('already been submitted and is currently pending review');
    });
  });

  describe('College Domain & OTP Authentication Flow', () => {
    it('Rejects registration with personal or disposable email domain', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Unauthorized Student',
        email: 'student@gmail.com',
        password: 'Password123!',
        collegeId,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Personal email addresses|does not match approved/);
    });

    it('Accepts registration with valid college email and dispatches hashed OTP', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test Student',
        email: 'jane.doe@test.edu',
        password: 'Password123!',
        collegeId,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.email).toBe('jane.doe@test.edu');

      // Verify OTP record exists in DB with hashed storage
      const record = await EmailVerification.findOne({ email: 'jane.doe@test.edu' });
      expect(record).toBeDefined();
      expect(record?.otp.length).toBeGreaterThanOrEqual(6);

      // Verify plain OTP was dispatched to mailer dev store
      const otp = devOtpStore.get('jane.doe@test.edu');
      expect(otp).toBeDefined();
      expect(otp).toHaveLength(6);
    });

    it('Verifies OTP, marks student verified, and returns JWT token', async () => {
      const otp = devOtpStore.get('jane.doe@test.edu')!;

      const res = await request(app).post('/api/v1/auth/verify-otp').send({
        email: 'jane.doe@test.edu',
        otp,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.isVerified).toBe(true);

      testUserToken = res.body.token;
      testUserId = res.body.user.id;
    });

    it('Logs in successfully with verified credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'jane.doe@test.edu',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('jane.doe@test.edu');
    });
  });

  describe('Authenticated Profile Onboarding', () => {
    it('Completes student onboarding with skills and academic details', async () => {
      const res = await request(app)
        .post('/api/v1/auth/onboarding')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          department: 'Computer Science',
          academicYear: 'Year 3',
          bio: 'Building reliable distributed systems.',
          skills: ['React', 'TypeScript', 'Node.js', 'Python'],
          interests: ['Hackathons', 'Cloud'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.isOnboarded).toBe(true);
      expect(res.body.user.skills).toContain('React');
    });
  });

  describe('Campus Feed & Ownership Protection', () => {
    let createdPostId: string;

    it('Publishes a post to the campus feed', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          title: 'First Campus Test Post',
          content: 'Excited to be testing CampusConnect live!',
          category: 'general',
          tags: ['Welcome'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.post.content).toBe('Excited to be testing CampusConnect live!');
      createdPostId = res.body.post._id;
    });

    it('Toggles like on the post', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${createdPostId}/like`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.liked).toBe(true);
      expect(res.body.likesCount).toBe(1);
    });

    it('Adds a comment to the post', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${createdPostId}/comments`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'Awesome to see this working!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.comment.content).toBe('Awesome to see this working!');
    });
  });

  describe('Project Collaboration & Skill Matching', () => {
    it('Creates a project listing with required skills', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          title: 'Campus Hackathon Team',
          problemStatement: 'Need talented builders for upcoming 48hr hackathon.',
          description: 'Developing a campus navigation system.',
          category: 'hackathon',
          requiredSkills: ['React', 'TypeScript', 'Figma'],
          openRoles: ['Frontend Developer', 'Designer'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.project.title).toBe('Campus Hackathon Team');
    });

    it('Calculates deterministic skill match score for the authenticated student', async () => {
      const res = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.projects.length).toBeGreaterThan(0);
      const project = res.body.projects[0];
      // Student has React and TypeScript out of ['React', 'TypeScript', 'Figma'] -> 2 of 3 match (67%)
      expect(project.skillMatch.matchCount).toBe(2);
      expect(project.skillMatch.totalRequired).toBe(3);
      expect(project.skillMatch.matchPercentage).toBe(67);
      expect(project.skillMatch.matchingSkills).toEqual(['React', 'TypeScript']);
    });
  });

  describe('Role-Based Access Control', () => {
    it('Denies standard student from accessing moderator review queue (403)', async () => {
      const res = await request(app)
        .get('/api/v1/reports/queue')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('insufficient administrative permissions');
    });
  });
});
