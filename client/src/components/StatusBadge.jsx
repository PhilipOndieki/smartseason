export default function StatusBadge({ status }) {
  const map = {
    active: 'bg-green-500',
    'at risk': 'bg-amber-400',
    completed: 'bg-gray-400',
  }
  const dot = map[status?.toLowerCase()] ?? 'bg-gray-400'

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="text-sm text-gray-700 capitalize">{status}</span>
    </span>
  )
}
