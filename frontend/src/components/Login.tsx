import { useState } from "react";
import { supabase } from "../lib/supabase";
import Notice from "./Notice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const redirectTo = `${window.location.origin}/dashboard`;
  const resetRedirectTo = `${window.location.origin}/reset-password`;
  const oauth = (provider: "google" | "github") =>
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  };

  const forgot = async () => {
    if (!email) {
      setError('Enter your email first, then select "Forgot password".');
      return;
    }
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetRedirectTo,
    });
    if (err) {
      setError(err.message);
      return;
    }
    setResetSent(true);
  };

  return (
    <div className="card w-full max-w-sm p-6 shadow-sm sm:p-8">
      <h2 id="login-title" className="text-xl font-semibold">
        {isSignUp ? "Create an account" : "Sign in"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        An account is optional. The app works without one.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => oauth("google")}
        >
          Google
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => oauth("github")}
        >
          GitHub
        </button>
      </div>

      <p className="my-4 text-center text-sm text-muted">or use email</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="field-label">
            Email
          </label>
          <input
            id="login-email"
            className="field mt-1.5"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="field-label">
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="login-password"
              className="field pr-16"
              type={show ? "text" : "password"}
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-3 text-sm font-medium text-muted hover:text-ink"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && <Notice>{error}</Notice>}
        {resetSent && <Notice tone="info">Reset link sent. Check your inbox.</Notice>}

        <button className="btn w-full" disabled={loading}>
          {loading ? "Please wait" : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="mt-4 flex justify-between gap-3 text-sm">
        <button
          type="button"
          className="font-medium underline-offset-4 hover:underline"
          onClick={() => {
            setIsSignUp((v) => !v);
            setError(null);
          }}
        >
          {isSignUp ? "Have an account? Sign in" : "New here? Create an account"}
        </button>
        {!isSignUp && (
          <button
            type="button"
            className="text-muted underline-offset-4 hover:underline"
            onClick={forgot}
          >
            Forgot password
          </button>
        )}
      </div>
    </div>
  );
}
