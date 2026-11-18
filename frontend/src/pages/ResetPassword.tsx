import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Notice from "../components/Notice";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

    const errorDescription =
      url.searchParams.get("error_description") ||
      hashParams.get("error_description");
    if (errorDescription) {
      setError(errorDescription.replace(/\+/g, " "));
      return;
    }

    const code = url.searchParams.get("code");
    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error: exchangeError }) => {
          if (exchangeError) {
            setError(exchangeError.message);
          } else {
            setReady(true);
          }
        });
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      setTimeout(() => navigate("/dashboard"), 1800);
    }
    setLoading(false);
  };

  return (
    <div className="card w-full max-w-sm p-6 shadow-sm sm:p-8">
      {done ? (
        <div>
          <h1 className="text-xl font-semibold">Password updated</h1>
          <p className="mt-1 text-sm text-muted">
            You can now sign in with the new password. Redirecting to the app.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-xl font-semibold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted">
            Use at least 6 characters.
            {!ready && !error && " Checking your reset link."}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="new-password" className="field-label">
                New password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 text-sm font-medium text-muted hover:text-ink"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <Notice>{error}</Notice>}

            <button type="submit" disabled={loading} className="btn w-full">
              {loading ? "Updating" : "Update password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
