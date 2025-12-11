import { prisma } from '@/lib/prisma'
import SendSurveyForm from './SendSurveyForm'

async function getData() {
  const [municipalities, templates] = await Promise.all([
    prisma.municipality.findMany({
      where: { active: true },
      select: { id: true, name: true, contactEmail: true },
      orderBy: { name: 'asc' },
    }),
    prisma.surveyTemplate.findMany({
      where: { active: true },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    }),
  ])

  return {
    municipalities,
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      isDefault: t.isDefault,
      questionCount: t.questions.length,
    })),
  }
}

export default async function SendSurveyPage() {
  const data = await getData()
  return <SendSurveyForm municipalities={data.municipalities} templates={data.templates} />
}

