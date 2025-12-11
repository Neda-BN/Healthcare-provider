import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import DashboardContent from './DashboardContent'

async function getDashboardData() {
  // Get all surveys with responses
  const surveys = await prisma.survey.findMany({
    where: { status: 'COMPLETED' },
    include: {
      municipality: true,
      responses: {
        include: {
          question: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  })

  // Calculate statistics
  const totalSurveys = await prisma.survey.count()
  const completedSurveys = await prisma.survey.count({ where: { status: 'COMPLETED' } })
  const responseRate = totalSurveys > 0 ? (completedSurveys / totalSurveys) * 100 : 0

  // Get municipalities with survey counts
  const municipalities = await prisma.municipality.findMany({
    where: { active: true },
    include: {
      surveys: {
        where: { status: 'COMPLETED' },
        include: {
          responses: {
            where: { ratingValue: { not: null } },
          },
        },
      },
    },
  })

  // Calculate average scores per municipality
  const municipalityStats = municipalities.map((m) => {
    const allRatings = m.surveys.flatMap((s) =>
      s.responses.filter((r) => r.ratingValue !== null).map((r) => r.ratingValue!)
    )
    const avgScore = allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : 0

    return {
      id: m.id,
      name: m.name,
      surveyCount: m.surveys.length,
      avgScore: Math.round(avgScore * 10) / 10,
    }
  })

  // Get question categories with averages
  const questions = await prisma.surveyQuestion.findMany({
    where: {
      questionType: 'RATING',
    },
    include: {
      responses: {
        where: { ratingValue: { not: null } },
      },
    },
  })

  const categoryStats: Record<string, { total: number; count: number }> = {}
  questions.forEach((q) => {
    const category = q.category || 'Other'
    if (!categoryStats[category]) {
      categoryStats[category] = { total: 0, count: 0 }
    }
    q.responses.forEach((r) => {
      if (r.ratingValue) {
        categoryStats[category].total += r.ratingValue
        categoryStats[category].count++
      }
    })
  })

  const categoryAverages = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    average: stats.count > 0 ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
    responseCount: stats.count,
  }))

  // Get monthly survey data for time series
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const monthlySurveys = await prisma.survey.findMany({
    where: {
      completedAt: { gte: sixMonthsAgo },
      status: 'COMPLETED',
    },
    include: {
      responses: {
        where: { ratingValue: { not: null } },
      },
    },
  })

  // Group by month
  const monthlyData: Record<string, { count: number; totalScore: number; scoreCount: number }> = {}
  monthlySurveys.forEach((survey) => {
    if (survey.completedAt) {
      const monthKey = survey.completedAt.toISOString().slice(0, 7) // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, totalScore: 0, scoreCount: 0 }
      }
      monthlyData[monthKey].count++
      survey.responses.forEach((r) => {
        if (r.ratingValue) {
          monthlyData[monthKey].totalScore += r.ratingValue
          monthlyData[monthKey].scoreCount++
        }
      })
    }
  })

  const timeSeries = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      surveyCount: data.count,
      avgScore: data.scoreCount > 0 ? Math.round((data.totalScore / data.scoreCount) * 10) / 10 : 0,
    }))

  // Get recent comments
  const recentComments = await prisma.surveyResponse.findMany({
    where: {
      textValue: { not: null },
      question: { questionType: 'LONGTEXT' },
    },
    include: {
      survey: {
        include: { municipality: true },
      },
      question: true,
    },
    orderBy: { respondedAt: 'desc' },
    take: 5,
  })

  return {
    totalSurveys,
    completedSurveys,
    responseRate: Math.round(responseRate),
    municipalityStats,
    categoryAverages,
    timeSeries,
    recentComments: recentComments.map((c) => ({
      id: c.id,
      text: c.textValue!,
      municipality: c.survey.municipality.name,
      category: c.question.category || 'General',
      date: c.respondedAt.toISOString(),
    })),
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  const data = await getDashboardData()

  return (
    <DashboardContent
      data={data}
      userName={session?.name || 'User'}
    />
  )
}

