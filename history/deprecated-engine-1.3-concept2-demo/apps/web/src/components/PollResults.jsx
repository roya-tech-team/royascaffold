export default function PollResults({ options, totalVotes, showBars = true }) {
  if (!options?.length) return null;

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <div key={option.id}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-slate-700">{option.label}</span>
            <span className="text-slate-500">
              {option.voteCount} ({option.percentage}%)
            </span>
          </div>
          {showBars && (
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${totalVotes > 0 ? option.percentage : 0}%` }}
              />
            </div>
          )}
        </div>
      ))}
      <p className="text-xs text-slate-400 pt-2">{totalVotes} total vote{totalVotes !== 1 ? 's' : ''}</p>
    </div>
  );
}
