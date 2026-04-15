export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
