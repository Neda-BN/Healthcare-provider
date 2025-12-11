import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { 
  FileBarChart, 
  Download, 
  Calendar, 
  Building2, 
  TrendingUp,
  Filter,
  ChevronRight,
} from 'lucide-react'

async function getReportData() {
  // Get surveys grouped by month
  const surveys = await prisma.survey.findMany({
    where: { status: 'COMPLETED' },
    include: {
      municipality: true,
      responses: {
        where: { ratingValue: { not: null } },
      },
    },
    orderBy: { completedAt: 'desc' },
  })

  // Group by month
  const monthlyData: Record<string, { count: number; avgScore: number; municipalities: Set<string> }> = {}
  
  surveys.forEach(survey => {
    if (survey.completedAt) {
      const monthKey = survey.completedAt.toISOString().slice(0, 7)
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, avgScore: 0, municipalities: new Set() }
      }
      monthlyData[monthKey].count++
      monthlyData[monthKey].municipalities.add(survey.municipality.name)
      
      const ratings = survey.responses.map(r => r.ratingValue!)
      if (ratings.length > 0) {
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
        monthlyData[monthKey].avgScore = 
          (monthlyData[monthKey].avgScore * (monthlyData[monthKey].count - 1) + avg) / monthlyData[monthKey].count
      }
    }
  })

  const monthlyReports = Object.entries(monthlyData)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 12)
    .map(([month, data]) => ({
      month,
      count: data.count,
      avgScore: Math.round(data.avgScore * 10) / 10,
      municipalityCount: data.municipalities.size,
    }))

  // Get recent individual surveys
  const recentSurveys = surveys.slice(0, 10).map(s => {
    const ratings = s.responses.map(r => r.ratingValue!)
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

  // Summary stats
  const totalSurveys = surveys.length
  const totalResponses = surveys.reduce((sum, s) => sum + s.responses.length, 0)
  const allRatings = surveys.flatMap(s => s.responses.map(r => r.ratingValue!))
  const overallAvg = allRatings.length > 0
    ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
    : 0

  return {
    monthlyReports,
    recentSurveys,
    summary: {
      totalSurveys,
      totalResponses,
      overallAvg,
      municipalityCount: new Set(surveys.map(s => s.municipality.id)).size,
    },
  }
}

export default async function ReportsPage() {
  const { monthlyReports, recentSurveys, summary } = await getReportData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">Reports</h1>
          <p className="text-surface-500 dark:text-dark-text-muted mt-1">Survey results and performance reports</p>
        </div>
        <div className="flex gap-2">
          <Link href="/api/export/csv" className="btn-secondary btn-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <FileBarChart className="w-5 h-5 mx-auto text-primary-600 dark:text-dark-primary mb-2" />
          <div className="text-2xl font-bold text-surface-900 dark:text-dark-text">{summary.totalSurveys}</div>
          <div className="text-xs text-surface-500 dark:text-dark-text-muted">Total Surveys</div>
        </div>
        <div className="card text-center">
          <TrendingUp className="w-5 h-5 mx-auto text-primary-600 dark:text-dark-primary mb-2" />
          <div className="text-2xl font-bold text-surface-900 dark:text-dark-text">{summary.totalResponses}</div>
          <div className="text-xs text-surface-500 dark:text-dark-text-muted">Total Responses</div>
        </div>
        <div className="card text-center">
          <div className="w-5 h-5 mx-auto text-primary-600 dark:text-dark-primary mb-2 font-bold">Ø</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-dark-primary">{summary.overallAvg}/10</div>
          <div className="text-xs text-surface-500 dark:text-dark-text-muted">Overall Average</div>
        </div>
        <div className="card text-center">
          <Building2 className="w-5 h-5 mx-auto text-primary-600 dark:text-dark-primary mb-2" />
          <div className="text-2xl font-bold text-surface-900 dark:text-dark-text">{summary.municipalityCount}</div>
          <div className="text-xs text-surface-500 dark:text-dark-text-muted">Municipalities</div>
        </div>
      </div>

      {/* Monthly Reports */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Monthly Overview</h2>
          <Calendar className="w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
        </div>
        
        {monthlyReports.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="text-center">Surveys</th>
                  <th className="text-center">Municipalities</th>
                  <th className="text-center">Avg. Score</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReports.map((report) => {
                  const [year, month] = report.month.split('-')
                  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                  return (
                    <tr key={report.month}>
                      <td className="font-medium text-surface-900 dark:text-dark-text">{monthName}</td>
                      <td className="text-center text-surface-700 dark:text-dark-text">{report.count}</td>
                      <td className="text-center text-surface-700 dark:text-dark-text">{report.municipalityCount}</td>
                      <td className="text-center">
                        <span className={`font-medium ${
                          report.avgScore >= 8 ? 'text-green-600 dark:text-green-400' :
                          report.avgScore >= 6 ? 'text-amber-600 dark:text-amber-400' :
                          'text-accent-600 dark:text-accent-400'
                        }`}>
                          {report.avgScore}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-surface-500 dark:text-dark-text-muted py-8">No completed surveys yet</p>
        )}
      </div>

      {/* Recent Surveys */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Recent Surveys</h2>
          <Link href="/municipalities/report" className="text-sm text-primary-600 dark:text-dark-primary hover:underline">
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {recentSurveys.map((survey) => (
            <Link
              key={survey.id}
              href={`/municipality/${survey.municipalityId}`}
              className="flex items-center justify-between p-3 bg-surface-50 dark:bg-dark-surface-light rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 dark:text-dark-text truncate group-hover:text-primary-600 dark:group-hover:text-dark-primary">
                  {survey.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-surface-500 dark:text-dark-text-muted">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {survey.municipality}
                  </span>
                  {survey.completedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(survey.completedAt).toLocaleDateString('sv-SE')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    survey.avgScore >= 8 ? 'text-green-600 dark:text-green-400' :
                    survey.avgScore >= 6 ? 'text-amber-600 dark:text-amber-400' :
                    'text-accent-600 dark:text-accent-400'
                  }`}>
                    {survey.avgScore}
                  </div>
                  <div className="text-xs text-surface-500 dark:text-dark-text-muted">{survey.responseCount} responses</div>
                </div>
                <ChevronRight className="w-4 h-4 text-surface-400 dark:text-dark-text-muted group-hover:text-primary-600 dark:group-hover:text-dark-primary" />
              </div>
            </Link>
          ))}

          {recentSurveys.length === 0 && (
            <p className="text-center text-surface-500 dark:text-dark-text-muted py-8">No completed surveys yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
