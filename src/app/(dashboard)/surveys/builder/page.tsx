import { prisma } from '@/lib/prisma'
import SurveyTemplatesList from './SurveyTemplatesList'

async function getTemplatesData() {
  const templates = await prisma.surveyTemplate.findMany({
    where: { active: true },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
      },
      _count: {
        select: { surveys: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description || '',
    version: template.version,
    isDefault: template.isDefault,
    surveyType: template.surveyType as 'HVB' | 'LSS' | 'CUSTOM',
    questionCount: template.questions.length,
    surveyCount: template._count.surveys,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  }))
}

export default async function SurveyTemplatesPage() {
  const templates = await getTemplatesData()

  return <SurveyTemplatesList initialTemplates={templates} />
}
