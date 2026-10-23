import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Code2,
  MessageSquare,
  Menu,
  X,
  Compass,
  SearchCheck,
  Users,
  Bell,
  Bookmark,
  User,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isModOrAdmin = user?.role === 'moderator' || user?.role === 'admin';

  const primaryTabs = [
    { name: 'Feed', to: '/app/feed', icon: Home },
    { name: 'Resources', to: '/app/resources', icon: BookOpen },
    { name: 'Projects', to: '/app/projects', icon: Code2 },
    { name: 'Chat', to: '/app/messages', icon: MessageSquare },
  ];

  const drawerLinks = [
    { name: 'Discover All', to: '/app/discover', icon: Compass },
    { name: 'Lost & Found', to: '/app/lost-found', icon: SearchCheck },
    { name: 'Communities', to: '/app/communities', icon: Users },
    { name: 'Notifications', to: '/app/notifications', icon: Bell },
    { name: 'Saved Items', to: '/app/saved', icon: Bookmark },
    { name: 'My Profile', to: '/app/profile', icon: User },
    { name: 'Settings', to: '/app/settings', icon: Settings },
  ];

  return (
    <>
      {/* Bottom Sticky Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-brand-600 font-bold' : 'text-slate-500'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-over Drawer for remaining destinations */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Explore Campus</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                {drawerLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{link.name}</span>
                    </NavLink>
                  );
                })}

                {isModOrAdmin && (
                  <NavLink
                    to="/app/moderation"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Moderation Queue</span>
                  </NavLink>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 text-center">
                CampusConnect • Verified Campus
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
