import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const templates = await prisma.surveyTemplate.findMany({
      where: { active: true },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json({ error: 'Failed to get templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, questions } = body

    if (!name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }

    const template = await prisma.surveyTemplate.create({
      data: {
        name,
        description,
        questions: {
          create: questions.map((q: any, index: number) => ({
            questionCode: q.questionCode,
            questionText: q.questionText,
            questionType: q.questionType,
            category: q.category,
            orderIndex: index,
            required: q.required ?? true,
            minValue: q.minValue,
            maxValue: q.maxValue,
          })),
        },
      },
      include: {
        questions: true,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, questions } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Delete existing questions and recreate
    await prisma.surveyQuestion.deleteMany({
      where: { templateId: id },
    })

    const template = await prisma.surveyTemplate.update({
      where: { id },
      data: {
        name,
        description,
        version: { increment: 1 },
        questions: {
          create: questions.map((q: any, index: number) => ({
            questionCode: q.questionCode,
            questionText: q.questionText,
            questionType: q.questionType,
            category: q.category,
            orderIndex: index,
            required: q.required ?? true,
            minValue: q.minValue,
            maxValue: q.maxValue,
          })),
        },
      },
      include: {
        questions: true,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Update template error:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

