import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  BarChart3,
  CheckCircle,
  Clock,
  Send,
  FileText,
  Users,
  MessageSquare,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getSurveyDetails(id: string) {
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      municipality: true,
      template: {
        include: {
          questions: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
      responses: {
        include: {
          question: true,
        },
      },
      createdBy: {
        select: { name: true, email: true },
      },
    },
  })

  return survey
}

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  DRAFT: { label: 'Draft', class: 'badge-neutral', icon: FileText },
  SENT: { label: 'Sent', class: 'badge-primary', icon: Send },
  PARTIAL: { label: 'In Progress', class: 'badge-warning', icon: Clock },
  COMPLETED: { label: 'Completed', class: 'badge-success', icon: CheckCircle },
  CLOSED: { label: 'Closed', class: 'badge-neutral', icon: FileText },
}

export default async function SurveyDetailsPage({ params }: PageProps) {
  const { id } = await params
  const survey = await getSurveyDetails(id)

  if (!survey) {
    notFound()
  }

  const status = statusConfig[survey.status] || statusConfig.DRAFT
  const StatusIcon = status.icon

  // Calculate statistics
  const ratingResponses = survey.responses.filter((r) => r.ratingValue !== null)
  const avgScore = ratingResponses.length > 0
    ? Math.round((ratingResponses.reduce((sum, r) => sum + (r.ratingValue || 0), 0) / ratingResponses.length) * 10) / 10
    : 0

  // Group responses by question
  const responsesByQuestion = survey.template.questions.map((question) => {
    const questionResponses = survey.responses.filter((r) => r.questionId === question.id)
    const ratings = questionResponses.filter((r) => r.ratingValue !== null).map((r) => r.ratingValue!)
    const avgRating = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null

    return {
      question,
      responses: questionResponses,
      avgRating,
      responseCount: questionResponses.length,
    }
  })

  // Get text responses (comments)
  const textResponses = survey.responses.filter(
    (r) => r.textValue && r.question.questionType === 'LONGTEXT'
  )

  // Parse recipient emails
  let recipientEmails: string[] = []
  try {
    recipientEmails = JSON.parse(survey.recipientEmails || '[]')
  } catch {
    recipientEmails = []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/municipalities/report"
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-surface-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-surface-500 dark:text-dark-text-muted" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-dark-text">
                {survey.title}
              </h1>
              <span className={status.class}>
                <StatusIcon className="w-3 h-3 mr-1 inline" />
                {status.label}
              </span>
            </div>
            <p className="text-surface-500 dark:text-dark-text-muted mt-1">
              Survey Details and Responses
            </p>
          </div>
        </div>
      </div>

      {/* Survey Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">Survey Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
            <div>
              <p className="text-xs text-surface-500 dark:text-dark-text-muted">Municipality</p>
              <Link 
                href={`/municipality/${survey.municipality.id}`}
                className="text-primary-600 dark:text-dark-primary hover:underline font-medium"
              >
                {survey.municipality.name}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
            <div>
              <p className="text-xs text-surface-500 dark:text-dark-text-muted">Sent Date</p>
              <span className="text-surface-900 dark:text-dark-text">
                {survey.sentAt
                  ? new Date(survey.sentAt).toLocaleDateString('sv-SE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Not sent yet'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
            <div>
              <p className="text-xs text-surface-500 dark:text-dark-text-muted">Recipients</p>
              <span className="text-surface-900 dark:text-dark-text">{recipientEmails.length} email(s)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-surface-400 dark:text-dark-text-muted" />
            <div>
              <p className="text-xs text-surface-500 dark:text-dark-text-muted">Created By</p>
              <span className="text-surface-900 dark:text-dark-text">{survey.createdBy.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <BarChart3 className="w-6 h-6 mx-auto text-primary-600 dark:text-dark-primary mb-2" />
          <p className="text-3xl font-bold text-surface-900 dark:text-dark-text">{avgScore || '-'}</p>
          <p className="text-sm text-surface-500 dark:text-dark-text-muted">Average Score</p>
        </div>
        <div className="card text-center">
          <FileText className="w-6 h-6 mx-auto text-primary-600 dark:text-dark-primary mb-2" />
          <p className="text-3xl font-bold text-surface-900 dark:text-dark-text">{survey.template.questions.length}</p>
          <p className="text-sm text-surface-500 dark:text-dark-text-muted">Questions</p>
        </div>
        <div className="card text-center">
          <CheckCircle className="w-6 h-6 mx-auto text-primary-600 dark:text-dark-primary mb-2" />
          <p className="text-3xl font-bold text-surface-900 dark:text-dark-text">{ratingResponses.length}</p>
          <p className="text-sm text-surface-500 dark:text-dark-text-muted">Responses</p>
        </div>
        <div className="card text-center">
          <MessageSquare className="w-6 h-6 mx-auto text-primary-600 dark:text-dark-primary mb-2" />
          <p className="text-3xl font-bold text-surface-900 dark:text-dark-text">{textResponses.length}</p>
          <p className="text-sm text-surface-500 dark:text-dark-text-muted">Comments</p>
        </div>
      </div>

      {/* Question Responses */}
      <div className="card">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">Question Responses</h2>
        
        {responsesByQuestion.length > 0 ? (
          <div className="space-y-4">
            {responsesByQuestion.map(({ question, avgRating, responseCount }) => (
              <div
                key={question.id}
                className="p-4 bg-surface-50 dark:bg-dark-surface-light rounded-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-primary-600 dark:text-dark-primary bg-primary-50 dark:bg-dark-primary/20 px-2 py-0.5 rounded">
                        {question.questionCode}
                      </span>
                      {question.category && (
                        <span className="badge-neutral text-xs">{question.category}</span>
                      )}
                    </div>
                    <p className="text-surface-900 dark:text-dark-text">{question.questionText}</p>
                    <p className="text-xs text-surface-500 dark:text-dark-text-muted mt-1">
                      {responseCount} response(s)
                    </p>
                  </div>
                  {avgRating !== null && (
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        avgRating >= 7 ? 'text-green-600 dark:text-green-400' :
                        avgRating >= 5 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {avgRating}
                      </div>
                      <div className="text-xs text-surface-500 dark:text-dark-text-muted">avg rating</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-surface-500 dark:text-dark-text-muted">
            No responses yet
          </div>
        )}
      </div>

      {/* Comments Section */}
      {textResponses.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">
            Comments ({textResponses.length})
          </h2>
          <div className="space-y-4">
            {textResponses.map((response) => (
              <div
                key={response.id}
                className="p-4 bg-surface-50 dark:bg-dark-surface-light rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm text-primary-600 dark:text-dark-primary bg-primary-50 dark:bg-dark-primary/20 px-2 py-0.5 rounded">
                    {response.question.questionCode}
                  </span>
                  <span className="text-xs text-surface-500 dark:text-dark-text-muted">
                    {response.question.category}
                  </span>
                </div>
                <p className="text-surface-700 dark:text-dark-text italic">"{response.textValue}"</p>
                <p className="text-xs text-surface-400 dark:text-dark-text-muted mt-2">
                  {new Date(response.respondedAt).toLocaleDateString('sv-SE')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipients List */}
      {recipientEmails.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text mb-4">
            Recipients ({recipientEmails.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {recipientEmails.map((email, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-surface-100 dark:bg-dark-surface-light text-surface-700 dark:text-dark-text rounded-full text-sm"
              >
                {email}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

