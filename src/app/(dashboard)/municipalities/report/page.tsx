import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FileText, Download, Calendar, Building2, BarChart3, Send, Clock, CheckCircle } from 'lucide-react'

async function getSentSurveys() {
  const surveys = await prisma.survey.findMany({
    include: {
      municipality: true,
      responses: {
        where: { ratingValue: { not: null } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return surveys.map((s) => {
    const ratings = s.responses.map((r) => r.ratingValue!)
    const avgScore = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : 0

    return {
      id: s.id,
      title: s.title,
      status: s.status,
      municipality: s.municipality.name,
      municipalityId: s.municipality.id,
      sentAt: s.sentAt?.toISOString(),
      completedAt: s.completedAt?.toISOString(),
      responseCount: s.responses.length,
      avgScore,
    }
  })
}

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  DRAFT: { label: 'Draft', class: 'badge-neutral', icon: FileText },
  SENT: { label: 'Sent', class: 'badge-primary', icon: Send },
  PARTIAL: { label: 'In Progress', class: 'badge-warning', icon: Clock },
  COMPLETED: { label: 'Completed', class: 'badge-success', icon: CheckCircle },
  CLOSED: { label: 'Closed', class: 'badge-neutral', icon: FileText },
}

export default async function SentSurveysPage() {
  const surveys = await getSentSurveys()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">Sent Surveys</h1>
          <p className="text-surface-500 dark:text-dark-text-muted mt-1">View all surveys sent to municipalities</p>
        </div>
        <Link href="/api/export/csv" className="btn-secondary">
          <Download className="w-4 h-4" />
          Export All (CSV)
        </Link>
      </div>

      <div className="grid gap-4">
        {surveys.map((survey) => {
          const status = statusConfig[survey.status] || statusConfig.DRAFT
          const StatusIcon = status.icon
          
          return (
            <div key={survey.id} className="card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-50 dark:bg-dark-primary/20 rounded-xl">
                    <FileText className="w-6 h-6 text-primary-600 dark:text-dark-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-surface-900 dark:text-dark-text">{survey.title}</h3>
                      <span className={status.class}>
                        <StatusIcon className="w-3 h-3 mr-1 inline" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-surface-500 dark:text-dark-text-muted">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {survey.municipality}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {survey.sentAt
                          ? `Sent ${new Date(survey.sentAt).toLocaleDateString('sv-SE')}`
                          : survey.completedAt
                          ? `Completed ${new Date(survey.completedAt).toLocaleDateString('sv-SE')}`
                          : 'Not sent yet'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {survey.responseCount} responses
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {survey.avgScore > 0 && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600 dark:text-dark-primary">{survey.avgScore}</div>
                      <div className="text-xs text-surface-500 dark:text-dark-text-muted">Avg Score</div>
                    </div>
                  )}
                  <Link
                    href={`/surveys/${survey.id}/details`}
                    className="btn-secondary btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {surveys.length === 0 && (
        <div className="card text-center py-12">
          <Send className="w-12 h-12 mx-auto text-surface-300 dark:text-dark-text-muted mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-2">No surveys sent yet</h3>
          <p className="text-surface-500 dark:text-dark-text-muted mb-4">Send your first survey to see it here.</p>
          <Link href="/surveys/send" className="btn-primary">
            <Send className="w-4 h-4" />
            Send Survey
          </Link>
        </div>
      )}
    </div>
  )
}
