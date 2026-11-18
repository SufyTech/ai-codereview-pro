import { useState, useEffect, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LandingPage from "./LandingPage.tsx";
import DashboardPage from "./DashboardPage.tsx";
import Login from "../components/Login.tsx";
import ResetPassword from "./ResetPassword.tsx";
import { supabase } from "../lib/supabase.ts";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // The auth listener is registered once, so it reads the current path from a ref.
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        // Never bounce the user away mid password-reset (ResetPassword navigates itself).
        if (pathRef.current.startsWith("/reset-password")) return;
        // The dashboard is public, so visitors without an account are never redirected.
        if (event === "SIGNED_IN" && newSession && pathRef.current === "/") {
          setIsLoginOpen(false);
          navigate("/dashboard");
        }
        if (event === "SIGNED_OUT") {
          setIsLoginOpen(false);
          navigate("/");
        }
      },
    );
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!isLoginOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLoginOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoginOpen]);

  return (
    <div className="min-h-screen">
      {isLoginOpen && !session && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/40"
          onClick={() => setIsLoginOpen(false)}
        >
          <div className="flex min-h-full items-center justify-center px-4 py-16">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="login-title"
              className="relative w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsLoginOpen(false)}
                className="absolute -top-9 right-0 text-sm font-semibold text-white hover:underline"
              >
                Close
              </button>
              <Login />
            </div>
          </div>
        </div>
      )}
      <main>
        <Routes>
          <Route
            path="/"
            element={<LandingPage onSignIn={() => setIsLoginOpen(true)} />}
          />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/reset-password"
            element={
              <div className="flex min-h-screen items-center justify-center bg-band px-4">
                <ResetPassword />
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
