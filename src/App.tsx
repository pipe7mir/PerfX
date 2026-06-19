import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { useRules } from './context/RulesContext';
import { api } from './services/api';
import Sidebar from './components/ui/Sidebar';
import LoginPage from './pages/LoginPage';
import EvaluationPage from './pages/EvaluationPage';
import MCCPage from './pages/MCCPage';
import RulesPage from './pages/RulesPage';
import UsersPage from './pages/UsersPage';
import AuditPage from './pages/AuditPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function ProtectedLayout() {
  const { setRules } = useRules();
  const { user } = useAuth();
  const location = useLocation();

  /* ── State Sync (Anti-F5) ───────────────────────────── */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const state = await api.getState();
        if (ac.signal.aborted) return;
        if (state.rules && state.rules.length > 0) {
          setRules(state.rules);
        }
      } catch {
        if (!ac.signal.aborted) {
          /* Gateway offline — using local state + offline cache */
        }
      }
    })();
    return () => ac.abort();
  }, [setRules]);

  if (user?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // If user doesn't need to change password, but they try to access /change-password
  if (!user?.mustChangePassword && location.pathname === '/change-password') {
    return <Navigate to="/evaluate" replace />;
  }

  return (
    <div className="min-h-screen text-navy-800">
      <Toaster position="top-center" reverseOrder={false} />
      <Sidebar />
      <main className="lg:ml-[18.5rem] p-4 sm:p-6 pt-16 lg:pt-6 pb-20 lg:pb-6 transition-all duration-300 overflow-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/evaluate" element={<PageWrapper><EvaluationPage /></PageWrapper>} />
            <Route path="/mcc" element={<PageWrapper><MCCPage /></PageWrapper>} />
            <Route path="/rules" element={<PageWrapper><RulesPage /></PageWrapper>} />
            <Route path="/users" element={<PageWrapper><UsersPage /></PageWrapper>} />
            <Route path="/audit" element={<PageWrapper><AuditPage /></PageWrapper>} />
            <Route path="/change-password" element={<PageWrapper><ChangePasswordPage /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/evaluate" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/evaluate" replace /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
