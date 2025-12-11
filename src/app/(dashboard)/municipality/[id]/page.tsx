import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import MunicipalityDashboard from './MunicipalityDashboard'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getMunicipalityData(id: string) {
  const municipality = await prisma.municipality.findUnique({
    where: { id },
    include: {
      surveys: {
        include: {
          responses: {
            include: { question: true },
          },
          template: true,
          createdBy: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      placements: {
        orderBy: { startDate: 'desc' },
      },
    },
  })

  if (!municipality) return null

  // Calculate stats
  const completedSurveys = municipality.surveys.filter((s) => s.status === 'COMPLETED')
  const allRatings = completedSurveys.flatMap((s) =>
    s.responses.filter((r) => r.ratingValue !== null).map((r) => r.ratingValue!)
  )
  const avgScore = allRatings.length > 0
    ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
    : 0

  // Category breakdown
  const categoryStats: Record<string, { total: number; count: number }> = {}
  completedSurveys.forEach((survey) => {
    survey.responses.forEach((r) => {
      if (r.ratingValue !== null && r.question.category) {
        if (!categoryStats[r.question.category]) {
          categoryStats[r.question.category] = { total: 0, count: 0 }
        }
        categoryStats[r.question.category].total += r.ratingValue
        categoryStats[r.question.category].count++
      }
    })
  })

  const categoryAverages = Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      average: stats.count > 0 ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.average - a.average)

  // Strengths and weaknesses
  const strengths = categoryAverages.slice(0, 3)
  const weaknesses = [...categoryAverages].sort((a, b) => a.average - b.average).slice(0, 3)

  // Recent comments
  const recentComments = completedSurveys
    .flatMap((s) =>
      s.responses
        .filter((r) => r.textValue)
        .map((r) => ({
          id: r.id,
          text: r.textValue!,
          category: r.question.category || 'General',
          date: r.respondedAt.toISOString(),
        }))
    )
    .slice(0, 5)

  return {
    municipality: {
      id: municipality.id,
      name: municipality.name,
      contactEmail: municipality.contactEmail,
      contactPhone: municipality.contactPhone,
      address: municipality.address,
      city: municipality.city,
      frameworkAgreementStart: municipality.frameworkAgreementStart?.toISOString(),
      frameworkAgreementEnd: municipality.frameworkAgreementEnd?.toISOString(),
    },
    stats: {
      totalSurveys: municipality.surveys.length,
      completedSurveys: completedSurveys.length,
      responseRate: municipality.surveys.length > 0
        ? Math.round((completedSurveys.length / municipality.surveys.length) * 100)
        : 0,
      avgScore,
      activePlacements: municipality.placements.filter((p) => p.status === 'ACTIVE').length,
    },
    categoryAverages,
    strengths,
    weaknesses,
    recentComments,
    surveys: municipality.surveys.map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      sentAt: s.sentAt?.toISOString(),
      completedAt: s.completedAt?.toISOString(),
      createdBy: s.createdBy.name,
      responseCount: s.responses.filter((r) => r.ratingValue !== null).length,
    })),
  }
}

export default async function MunicipalityPage({ params }: PageProps) {
  const { id } = await params
  const data = await getMunicipalityData(id)

  if (!data) {
    notFound()
  }

  return <MunicipalityDashboard data={data} />
}

