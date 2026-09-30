import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-primary items-center justify-center text-white font-bold text-xl mb-4">
            P
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-500 mt-2">{subtitle}</p>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {children}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          PollPulse — RoyaScaff engine example
        </p>
      </div>
    </div>
  );
}

export function AuthLink({ to, children }) {
  return (
    <Link to={to} className="text-primary hover:text-primary-dark font-medium transition">
      {children}
    </Link>
  );
}
