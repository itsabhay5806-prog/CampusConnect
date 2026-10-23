import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AppLayout } from './components/layout/AppLayout';

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { OnboardingPage } from './pages/auth/OnboardingPage';

// Authenticated Pages
import { FeedPage } from './pages/app/FeedPage';
import { DiscoverPage } from './pages/app/DiscoverPage';
import { ResourcesPage } from './pages/app/ResourcesPage';
import { LostFoundPage } from './pages/app/LostFoundPage';
import { CommunitiesPage } from './pages/app/CommunitiesPage';
import { ProjectsPage } from './pages/app/ProjectsPage';
import { MessagesPage } from './pages/app/MessagesPage';
import { NotificationsPage } from './pages/app/NotificationsPage';
import { SavedPage } from './pages/app/SavedPage';
import { ProfilePage } from './pages/app/ProfilePage';
import { SettingsPage } from './pages/app/SettingsPage';
import { ModerationPage } from './pages/app/ModerationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Marketing & Auth */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Authenticated Campus Portal */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/feed" replace />} />
                <Route path="feed" element={<FeedPage />} />
                <Route path="discover" element={<DiscoverPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="lost-found" element={<LostFoundPage />} />
                <Route path="communities" element={<CommunitiesPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="saved" element={<SavedPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="moderation" element={<ModerationPage />} />
              </Route>

              {/* Convenience Direct Aliases */}
              <Route path="/dashboard" element={<Navigate to="/app/feed" replace />} />
              <Route path="/feed" element={<Navigate to="/app/feed" replace />} />
              <Route path="/discover" element={<Navigate to="/app/discover" replace />} />
              <Route path="/resources" element={<Navigate to="/app/resources" replace />} />
              <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
              <Route path="/communities" element={<Navigate to="/app/communities" replace />} />
              <Route path="/lost-found" element={<Navigate to="/app/lost-found" replace />} />
              <Route path="/messages" element={<Navigate to="/app/messages" replace />} />
              <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
              <Route path="/saved" element={<Navigate to="/app/saved" replace />} />
              <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
              <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
              <Route path="/moderation" element={<Navigate to="/app/moderation" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
