import { prisma } from '@/lib/prisma'
import QuestionBuilder from './QuestionBuilder'

async function getTemplateData() {
  const template = await prisma.surveyTemplate.findFirst({
    where: { isDefault: true },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  })

  return template
}

export default async function QuestionBuilderPage() {
  const template = await getTemplateData()

  return (
    <QuestionBuilder
      initialTemplate={template ? {
        id: template.id,
        name: template.name,
        description: template.description || '',
        questions: template.questions.map(q => ({
          id: q.id,
          questionCode: q.questionCode,
          questionText: q.questionText,
          questionType: q.questionType as 'RATING' | 'YESNO' | 'TEXT' | 'LONGTEXT',
          category: q.category || '',
          orderIndex: q.orderIndex,
          required: q.required,
          minValue: q.minValue,
          maxValue: q.maxValue,
        })),
      } : null}
    />
  )
}

