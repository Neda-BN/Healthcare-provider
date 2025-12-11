import { prisma } from '@/lib/prisma'
import AnalyseContent from './AnalyseContent'

async function getAnalysisData() {
  const municipalities = await prisma.municipality.findMany({
    where: { active: true },
    include: {
      surveys: {
        where: { status: 'COMPLETED' },
        include: {
          responses: {
            include: { question: true },
          },
        },
      },
    },
  })

  // Get all categories from questions
  const questions = await prisma.surveyQuestion.findMany({
    where: { questionType: 'RATING' },
    orderBy: { orderIndex: 'asc' },
  })

  const categories = Array.from(new Set(questions.map((q) => q.category).filter(Boolean))) as string[]

  // Calculate stats for each municipality
  const municipalityData = municipalities.map((m) => {
    const categoryStats: Record<string, { total: number; count: number }> = {}
    const allRatings: number[] = []

    m.surveys.forEach((survey) => {
      survey.responses.forEach((r) => {
        if (r.ratingValue !== null && r.question.category) {
          if (!categoryStats[r.question.category]) {
            categoryStats[r.question.category] = { total: 0, count: 0 }
          }
          categoryStats[r.question.category].total += r.ratingValue
          categoryStats[r.question.category].count++
          allRatings.push(r.ratingValue)
        }
      })
    })

    const categoryAverages = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      average: stats.count > 0 ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
    }))

    const avgScore = allRatings.length > 0
      ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
      : 0

    // Find strengths and weaknesses
    const sorted = [...categoryAverages].sort((a, b) => b.average - a.average)
    const strengths = sorted.slice(0, 3)
    const weaknesses = [...sorted].sort((a, b) => a.average - b.average).slice(0, 3)

    return {
      id: m.id,
      name: m.name,
      surveyCount: m.surveys.length,
      avgScore,
      categoryAverages,
      strengths,
      weaknesses,
    }
  })

  return {
    municipalities: municipalityData,
    categories: categories as string[],
  }
}

export default async function AnalysePage() {
  const data = await getAnalysisData()
  return <AnalyseContent data={data} />
}

