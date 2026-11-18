import { useState } from "react";
import { supabase } from "../lib/supabase";

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
      setError('Enter your email above first, then click "Forgot password?"');
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
    <div className="panel w-full max-w-sm p-6 sm:p-8">
      <p className="label">codereview/pro</p>
      <h2 className="mt-2 font-serif text-4xl leading-tight">
        {isSignUp ? "Create an account" : "Sign in"}
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => oauth("google")}
        >
          Google
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => oauth("github")}
        >
          GitHub
        </button>
      </div>
      <p className="label my-5 text-center">or with email</p>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="label">Email</span>
          <input
            className="field mt-2"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="label">Password</span>
          <div className="relative mt-2">
            <input
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
              className="absolute inset-y-0 right-3 font-mono text-[11px] uppercase text-mute hover:text-ink"
            >
              {show ? "hide" : "show"}
            </button>
          </div>
        </label>
        {error && (
          <p
            role="alert"
            className="border border-brand bg-brand/5 px-3 py-2 text-sm text-brand"
          >
            {error}
          </p>
        )}
        {resetSent && (
          <p className="border border-ok px-3 py-2 text-sm text-ok">
            Reset link sent. Check your inbox.
          </p>
        )}
        <button className="btn w-full" disabled={loading}>
          {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>
      <div className="mt-5 flex justify-between font-mono text-xs">
        <button
          type="button"
          className="underline-offset-4 hover:underline"
          onClick={() => {
            setIsSignUp((v) => !v);
            setError(null);
          }}
        >
          {isSignUp ? "Have an account? Sign in" : "New here? Sign up"}
        </button>
        {!isSignUp && (
          <button
            type="button"
            className="text-mute underline-offset-4 hover:underline"
            onClick={forgot}
          >
            Forgot password?
          </button>
        )}
      </div>
    </div>
  );
}
