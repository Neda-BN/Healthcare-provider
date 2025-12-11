import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FileText, Download, Calendar, Building2, BarChart3 } from 'lucide-react'

async function getReportData() {
  const surveys = await prisma.survey.findMany({
    where: { status: 'COMPLETED' },
    include: {
      municipality: true,
      responses: {
        where: { ratingValue: { not: null } },
      },
    },
    orderBy: { completedAt: 'desc' },
    take: 20,
  })

  return surveys.map((s) => {
    const ratings = s.responses.map((r) => r.ratingValue!)
    const avgScore = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : 0

    return {
      id: s.id,
      title: s.title,
      municipality: s.municipality.name,
      municipalityId: s.municipality.id,
      completedAt: s.completedAt?.toISOString(),
      responseCount: s.responses.length,
      avgScore,
    }
  })
}

export default async function ReportPage() {
  const reports = await getReportData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">Reports</h1>
          <p className="text-surface-500 dark:text-dark-text-muted mt-1">View and export survey reports</p>
        </div>
        <Link href="/api/export/csv" className="btn-primary">
          <Download className="w-4 h-4" />
          Export All (CSV)
        </Link>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <div key={report.id} className="card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 dark:bg-dark-primary/20 rounded-xl">
                  <FileText className="w-6 h-6 text-primary-600 dark:text-dark-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-dark-text">{report.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-surface-500 dark:text-dark-text-muted">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {report.municipality}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {report.completedAt
                        ? new Date(report.completedAt).toLocaleDateString('sv-SE')
                        : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {report.responseCount} responses
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600 dark:text-dark-primary">{report.avgScore}</div>
                  <div className="text-xs text-surface-500 dark:text-dark-text-muted">Avg Score</div>
                </div>
                <Link
                  href={`/surveys/${report.id}`}
                  className="btn-secondary btn-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-surface-300 dark:text-dark-text-muted mb-4" />
          <p className="text-surface-500 dark:text-dark-text-muted">No completed surveys yet.</p>
        </div>
      )}
    </div>
  )
}
