import { prisma } from '@/lib/prisma'
import { Users, Calendar, Building2, CheckCircle, XCircle, Clock } from 'lucide-react'

async function getPlacements() {
  return prisma.placement.findMany({
    include: {
      municipality: {
        select: { name: true },
      },
    },
    orderBy: { startDate: 'desc' },
  })
}

export default async function PlacementPage() {
  const placements = await getPlacements()

  const statusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'COMPLETED':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'badge-success'
      case 'COMPLETED':
        return 'badge-primary'
      case 'CANCELLED':
        return 'badge-error'
      default:
        return 'badge-neutral'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">Placements</h1>
          <p className="text-surface-500 dark:text-dark-text-muted mt-1">View all care placements across municipalities</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-surface-700 dark:text-dark-text">Active: {placements.filter((p) => p.status === 'ACTIVE').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-surface-700 dark:text-dark-text">Completed: {placements.filter((p) => p.status === 'COMPLETED').length}</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Placement #</th>
              <th>Municipality</th>
              <th>Client</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {placements.map((placement) => (
              <tr key={placement.id}>
                <td className="font-mono text-sm">{placement.placementNumber || '-'}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary-600 dark:text-dark-primary" />
                    {placement.municipality.name}
                  </div>
                </td>
                <td>{placement.clientInitials || '-'}</td>
                <td>
                  {placement.startDate
                    ? new Date(placement.startDate).toLocaleDateString('sv-SE')
                    : '-'}
                </td>
                <td>
                  {placement.endDate
                    ? new Date(placement.endDate).toLocaleDateString('sv-SE')
                    : '-'}
                </td>
                <td>
                  <span className={statusBadge(placement.status)}>{placement.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {placements.length === 0 && (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 mx-auto text-surface-300 dark:text-dark-text-muted mb-4" />
          <p className="text-surface-500 dark:text-dark-text-muted">No placements found.</p>
        </div>
      )}
    </div>
  )
}

