import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PollCard from '../components/PollCard';
import { pollsApi } from '../core/api';
import { useAuth } from '../core/authContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    pollsApi
      .list({ limit: 5 })
      .then((res) => setPolls(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const openCount = polls.filter((p) => p.status === 'open').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hello, {user?.name}!</h1>
        <p className="text-slate-500 mt-1">Quick team polls, fast decisions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Recent polls" value={polls.length} />
        <StatCard label="Open polls" value={openCount} accent="green" />
        <StatCard label="Your role" value="Member" accent="violet" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent polls</h2>
        <Link to="/app/polls/new" className="text-sm text-primary hover:text-primary-dark font-medium">
          + New poll
        </Link>
      </div>

      {loading && <p className="text-slate-500">Loading polls...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && polls.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-500 mb-4">No polls yet. Create the first one!</p>
          <Link
            to="/app/polls/new"
            className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg transition"
          >
            Create Poll
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const accentClass =
    accent === 'green'
      ? 'text-green-600'
      : accent === 'violet'
        ? 'text-secondary'
        : 'text-primary';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accentClass}`}>{value}</p>
    </div>
  );
}
