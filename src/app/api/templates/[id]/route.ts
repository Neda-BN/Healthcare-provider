import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET single template by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const template = await prisma.surveyTemplate.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!template || !template.active) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Get template error:', error)
    return NextResponse.json({ error: 'Failed to get template' }, { status: 500 })
  }
}

// DELETE template (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if template exists
    const template = await prisma.surveyTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Soft delete the template
    await prisma.surveyTemplate.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}

