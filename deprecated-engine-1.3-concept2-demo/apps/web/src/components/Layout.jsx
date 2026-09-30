import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/authContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/auth/login');
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/app/dashboard" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
              P
            </span>
            <span className="font-semibold text-lg text-slate-900">PollPulse</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/app/dashboard" className="text-sm text-slate-600 hover:text-primary transition">
              Dashboard
            </Link>
            <Link to="/app/polls" className="text-sm text-slate-600 hover:text-primary transition">
              Polls
            </Link>
            <Link
              to="/app/polls/new"
              className="text-sm bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition"
            >
              Create Poll
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <span className="text-sm text-slate-500">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-500 hover:text-red-500 transition"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
