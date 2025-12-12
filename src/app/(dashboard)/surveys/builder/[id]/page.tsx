import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import TemplateEditor from './TemplateEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getTemplateData(id: string) {
  const template = await prisma.surveyTemplate.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  })

  if (!template || !template.active) {
    return null
  }

  return {
    id: template.id,
    name: template.name,
    description: template.description || '',
    version: template.version,
    isDefault: template.isDefault,
    questions: template.questions.map((q) => ({
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
  }
}

export default async function TemplateEditorPage({ params }: PageProps) {
  const { id } = await params
  const template = await getTemplateData(id)

  if (!template) {
    notFound()
  }

  return <TemplateEditor initialTemplate={template} />
}



