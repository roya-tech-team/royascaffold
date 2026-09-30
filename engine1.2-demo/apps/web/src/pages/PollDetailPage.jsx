import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PollResults from '../components/PollResults';
import { StatusBadge } from '../components/PollCard';
import { pollsApi } from '../core/api';

export default function PollDetailPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const [closing, setClosing] = useState(false);

  async function loadPoll() {
    setLoading(true);
    try {
      const data = await pollsApi.get(id);
      setPoll(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPoll();
  }, [id]);

  async function handleVote(optionId) {
    setVoting(true);
    try {
      const updated = await pollsApi.vote(id, optionId);
      setPoll(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setVoting(false);
    }
  }

  async function handleClose() {
    if (!confirm('Close this poll? No more votes will be accepted.')) return;
    setClosing(true);
    try {
      const updated = await pollsApi.close(id);
      setPoll(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setClosing(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading poll...</p>;
  if (error && !poll) return <p className="text-red-500">{error}</p>;
  if (!poll) return null;

  const canVote = poll.status === 'open' && !poll.userVote;
  const showResults = poll.userVote || poll.status === 'closed';

  return (
    <div className="max-w-2xl">
      <Link to="/app/polls" className="text-sm text-primary hover:text-primary-dark mb-4 inline-block">
        ← Back to polls
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{poll.title}</h1>
            {poll.description && (
              <p className="text-slate-500 mt-2">{poll.description}</p>
            )}
          </div>
          <StatusBadge status={poll.status} />
        </div>

        <p className="text-xs text-slate-400 mb-6">
          Created by {poll.creatorName} · {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {canVote && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-slate-700 mb-3">Cast your vote</h2>
            <div className="space-y-2">
              {poll.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={voting}
                  className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition disabled:opacity-50"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {showResults && (
          <div>
            <h2 className="text-sm font-medium text-slate-700 mb-4">Results</h2>
            <PollResults options={poll.options} totalVotes={poll.totalVotes} />
          </div>
        )}

        {poll.isOwner && poll.status === 'open' && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={handleClose}
              disabled={closing}
              className="text-sm text-red-500 hover:text-red-600 font-medium transition disabled:opacity-50"
            >
              {closing ? 'Closing...' : 'Close poll'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
