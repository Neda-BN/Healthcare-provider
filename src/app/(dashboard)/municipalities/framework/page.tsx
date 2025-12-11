import { prisma } from '@/lib/prisma'
import { FileText, Calendar, Building2 } from 'lucide-react'

async function getFrameworkAgreements() {
  return prisma.municipality.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      frameworkAgreementStart: true,
      frameworkAgreementEnd: true,
      frameworkAgreementNotes: true,
    },
    orderBy: { name: 'asc' },
  })
}

export default async function FrameworkAgreementPage() {
  const agreements = await getFrameworkAgreements()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">Framework Agreements</h1>
        <p className="text-surface-500 dark:text-dark-text-muted mt-1">Overview of municipality framework agreements</p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Municipality</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {agreements.map((agreement) => {
              const now = new Date()
              const endDate = agreement.frameworkAgreementEnd
              const isExpiring = endDate && new Date(endDate).getTime() - now.getTime() < 90 * 24 * 60 * 60 * 1000
              const isExpired = endDate && new Date(endDate) < now

              return (
                <tr key={agreement.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary-600 dark:text-dark-primary" />
                      <span className="font-medium text-surface-900 dark:text-dark-text">{agreement.name}</span>
                    </div>
                  </td>
                  <td>
                    {agreement.frameworkAgreementStart
                      ? new Date(agreement.frameworkAgreementStart).toLocaleDateString('sv-SE')
                      : '-'}
                  </td>
                  <td>
                    {agreement.frameworkAgreementEnd
                      ? new Date(agreement.frameworkAgreementEnd).toLocaleDateString('sv-SE')
                      : '-'}
                  </td>
                  <td>
                    {isExpired ? (
                      <span className="badge-error">Expired</span>
                    ) : isExpiring ? (
                      <span className="badge-warning">Expiring Soon</span>
                    ) : (
                      <span className="badge-success">Active</span>
                    )}
                  </td>
                  <td className="text-surface-500 dark:text-dark-text-muted max-w-xs truncate">
                    {agreement.frameworkAgreementNotes || '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {agreements.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-surface-300 dark:text-dark-text-muted mb-4" />
          <p className="text-surface-500 dark:text-dark-text-muted">No framework agreements found.</p>
        </div>
      )}
    </div>
  )
}

