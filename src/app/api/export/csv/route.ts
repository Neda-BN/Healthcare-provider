import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all completed surveys with responses
    const surveys = await prisma.survey.findMany({
      where: { status: 'COMPLETED' },
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
      },
      orderBy: { completedAt: 'desc' },
    })

    // Build CSV
    const headers = [
      'Survey ID',
      'Survey Title',
      'Municipality',
      'Completed Date',
      'Question Code',
      'Question',
      'Category',
      'Response Type',
      'Rating Value',
      'Text Value',
      'N/A',
    ]

    const rows: string[][] = []

    for (const survey of surveys) {
      for (const response of survey.responses) {
        rows.push([
          survey.id,
          survey.title,
          survey.municipality.name,
          survey.completedAt?.toISOString().split('T')[0] || '',
          response.question.questionCode,
          response.question.questionText,
          response.question.category || '',
          response.question.questionType,
          response.ratingValue?.toString() || '',
          response.textValue || '',
          response.naValue ? 'Yes' : 'No',
        ])
      }
    }

    // Convert to CSV string
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(',')),
    ].join('\n')

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="survey-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

