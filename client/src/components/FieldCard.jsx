import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import StageBadge from './StageBadge'

export default function FieldCard({ field }) {
  return (
    <div className="bg-white border border-gray-100 rounded p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{field.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{field.crop_type}</p>
        </div>
        <StageBadge stage={field.stage} />
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={field.status} />
        <Link
          to={`/fields/${field.id}`}
          className="text-sm text-green-800 hover:underline"
        >
          View
        </Link>
      </div>
    </div>
  )
}
