import { Link } from "react-router-dom";

export default function AuthForm({
  isSignup,
  form,
  onChange,
  onSubmit,
  loading,
  error
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isSignup ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
          autoComplete="email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
      </button>

      <p className="text-sm text-slate-600">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <Link to={isSignup ? "/login" : "/signup"} className="font-semibold text-brand-600 hover:underline">
          {isSignup ? "Login" : "Create one"}
        </Link>
      </p>
    </form>
  );
}
