import React from 'react';
import { Link } from 'react-router-dom';
import { CampusConnectLogo } from '../components/common/CampusConnectLogo';
import {
  ShieldCheck,
  Compass,
  BookOpen,
  SearchCheck,
  Users,
  Code2,
  MessageSquare,
  Globe2,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  Calendar,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Verified Campus Community',
      description:
        'Access is restricted exclusively to authenticated college-domain email addresses, establishing an authentic, trusted student space free from outside spam.',
    },
    {
      icon: Compass,
      title: 'Campus Feed & Updates',
      description:
        'Official club announcements, academic events, and student discussions organized cleanly with categories, search, and respectful interactions.',
    },
    {
      icon: BookOpen,
      title: 'Academic Resources Library',
      description:
        'Searchable repository of peer notes, past-year exam questions (PYQs), and study guides indexed by semester, department, and subject.',
    },
    {
      icon: SearchCheck,
      title: 'Lost and Found Hub',
      description:
        'Centralized campus board to report missing electronics, ID cards, and keys with safe, privacy-preserving in-app contact mechanisms.',
    },
    {
      icon: Users,
      title: 'Interest-Driven Communities',
      description:
        'Discover and join student clubs across coding, design, AI/ML, competitive programming, sports, and placement preparation.',
    },
    {
      icon: Code2,
      title: 'Project & Hackathon Matcher',
      description:
        'Find skilled teammates for hackathons, capstones, and startups using deterministic skill-overlap matching and transparent open roles.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Student Messaging',
      description:
        'Real-time, focused peer communication without needing to share personal phone numbers or join noisy external group chats.',
    },
    {
      icon: Globe2,
      title: 'Future Inter-College Networking',
      description:
        'Designed to support multi-campus expansion for cross-university research, hackathons, and inter-collegiate technical conferences.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Register with College Email',
      desc: 'Sign up using your institutional email domain (@apex.edu, @metro.edu, etc.).',
    },
    {
      number: '02',
      title: 'Verify Your Email Address',
      desc: 'Enter the secure 6-digit one-time verification code sent directly to your inbox.',
    },
    {
      number: '03',
      title: 'Complete Student Profile',
      desc: 'Select your department, academic year, technical skills, and campus interests.',
    },
    {
      number: '04',
      title: 'Join College Community',
      desc: 'Instantly gain verified access to your campus feed, resource bank, and student clubs.',
    },
    {
      number: '05',
      title: 'Discover, Share & Collaborate',
      desc: 'Publish updates, download study guides, report lost items, and build hackathon teams.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <CampusConnectLogo size="md" />

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-brand-600 transition-colors">
              Campus Benefits
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
            >
              Join Your Campus
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-xs font-bold text-brand-800 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>One campus. One verified community. Multiple student needs.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            Your Campus. Your Community.{' '}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-tealAccent-600 bg-clip-text text-transparent">
              Your Connections.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Everything happening on your campus, all in one verified student community. Discover
            updates, share knowledge, find lost items, and build projects with fellow students.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Join Your Campus</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-xl shadow-xs transition-colors"
            >
              Explore Features
            </a>
          </div>

          {/* Realistic Dashboard Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-6 text-left transform transition-transform hover:scale-[1.01]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-semibold text-slate-500">
                  CampusConnect • Apex Institute of Technology
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Student Access
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Card 1: Feed Preview */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-brand-100 text-brand-800">
                    Announcement
                  </span>
                  <span className="text-[11px] text-slate-400">Campus Administration</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Annual Apex Hackathon 2026</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Over $10,000 in project grants and sponsor mentorship. Teams of 3-5 open.
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>24 Likes • 2 Comments</span>
                  <span className="text-brand-600 font-semibold">Join Team →</span>
                </div>
              </div>

              {/* Card 2: Resource Preview */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-tealAccent-100 text-tealAccent-800">
                    Study Notes
                  </span>
                  <span className="text-[11px] text-slate-400">CS302 Exam Prep</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">Distributed Systems Cheatsheet</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Raft consensus, vector clocks, and RPC practice problems.
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>PDF • 2.4 MB</span>
                  <span className="text-tealAccent-600 font-semibold">42 Downloads</span>
                </div>
              </div>

              {/* Card 3: Project Teammate Discovery */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-violetAccent-100 text-violetAccent-800">
                    Hackathon Squad
                  </span>
                  <span className="text-[11px] text-slate-400">2 Roles Open</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">EcoRoute: Transit Navigator</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  React, TypeScript, FastAPI, PyTorch. Seeking frontend & ML builder.
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    Matches 3 of 4 skills
                  </span>
                  <span className="text-brand-600 font-semibold">Apply →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Platform Features
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
              Everything Your Student Body Needs In One Place
            </h3>
            <p className="text-sm text-slate-600 mt-3">
              Eliminate fragmented WhatsApp chats, scattered Google Drive links, and untracked lost
              items.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 bg-slate-50 hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 transition-all hover:shadow-card group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{feat.title}</h4>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Simple Verification
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">How CampusConnect Works</h3>
            <p className="text-sm text-slate-600 mt-3">
              Get onboarded into your official college ecosystem in less than 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black text-brand-200">{step.number}</span>
                  <h4 className="text-sm font-bold text-slate-800 mt-2">{step.title}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Benefits */}
      <section id="benefits" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Why CampusConnect
              </h2>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
                Designed By Students, For College Life
              </h3>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Campus communication has been scattered across hundreds of unorganized channels.
                CampusConnect restores order with verified college identities, transparent project
                matching, and structured academic sharing.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Save Hours of Searching</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Find past exam papers and study guides organized by exact department and
                      semester.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Find Compatible Hackathon Teammates</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      View deterministic skill matching scores to assemble balanced development, ML,
                      and design squads.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Responsible Moderation & Privacy</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Student peer moderators and clear community guidelines prevent spam and protect
                      student safety.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-800 text-brand-300 text-xs font-semibold mb-6">
                  <Lock className="w-3.5 h-3.5 text-tealAccent-400" />
                  <span>College-Domain Security</span>
                </div>
                <h4 className="text-2xl font-bold tracking-tight">
                  One verified account. Zero unwanted outside noise.
                </h4>
                <p className="text-xs text-brand-200 mt-3 leading-relaxed">
                  Only students with an active, approved email domain can publish posts, upload study
                  material, and message peers. Safe, collegiate, and focused on learning.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-brand-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Ready to join your campus?</p>
                  <p className="text-[11px] text-brand-300">Supported colleges active today.</p>
                </div>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-brand-900 bg-white hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <CampusConnectLogo size="sm" className="brightness-200" />
              <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                A verified, student-driven digital campus ecosystem for collaboration, learning, and
                community.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-white mb-2.5">Platform</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link to="/app/feed" className="hover:text-white">Campus Feed</Link></li>
                <li><Link to="/app/resources" className="hover:text-white">Academic Library</Link></li>
                <li><Link to="/app/projects" className="hover:text-white">Project Matcher</Link></li>
                <li><Link to="/app/lost-found" className="hover:text-white">Lost & Found</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white mb-2.5">Safety & Trust</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><span className="hover:text-white cursor-pointer">Community Guidelines</span></li>
                <li><span className="hover:text-white cursor-pointer">Moderation Policy</span></li>
                <li><span className="hover:text-white cursor-pointer">Privacy Notice</span></li>
                <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white mb-2.5">Access</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link to="/login" className="hover:text-white">Student Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white">Register College Email</Link></li>
                <li><Link to="/verify-email" className="hover:text-white">Verify Code</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
            <p>One campus. One verified community. Multiple student needs.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
