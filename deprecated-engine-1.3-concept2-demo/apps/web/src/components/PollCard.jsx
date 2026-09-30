import { Link } from 'react-router-dom';

export default function PollCard({ poll }) {
  return (
    <Link
      to={`/app/polls/${poll.id}`}
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-primary hover:shadow-md transition group"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900 group-hover:text-primary transition">
          {poll.title}
        </h3>
        <StatusBadge status={poll.status} />
      </div>
      {poll.description && (
        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{poll.description}</p>
      )}
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
        <span>by {poll.creatorName}</span>
        <span>{poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}</span>
      </div>
    </Link>
  );
}

export function StatusBadge({ status }) {
  const styles =
    status === 'open'
      ? 'bg-green-100 text-green-700'
      : 'bg-slate-100 text-slate-600';

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles}`}>
      {status}
    </span>
  );
}
