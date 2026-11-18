import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LandingPage from "./LandingPage.tsx";
import DashboardPage from "./DashboardPage.tsx";
import Login from "../components/Login.tsx";
import ResetPassword from "./ResetPassword.tsx";
import { supabase } from "../lib/supabase.ts";

export default function App() {
  const location = useLocation();
  const isResetPassword = location.pathname.startsWith("/reset-password");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        // Never bounce the user away mid password-reset (ResetPassword navigates itself).
        if (isResetPassword) return;
        if (newSession) {
          setIsLoginOpen(false);
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      },
    );
    return () => listener.subscription.unsubscribe();
  }, [navigate, isResetPassword]);

  return (
    <div className="min-h-screen">
      {isLoginOpen && !session && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-paper/95">
          <div className="flex min-h-full items-center justify-center px-4 py-16">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="label absolute right-5 top-5 hover:text-ink sm:right-8"
            >
              Close ✕
            </button>
            <Login />
          </div>
        </div>
      )}
      <main>
        <Routes>
          <Route
            path="/"
            element={<LandingPage onGetStarted={() => setIsLoginOpen(true)} />}
          />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/reset-password"
            element={
              <div className="flex min-h-screen items-center justify-center px-4">
                <ResetPassword />
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
