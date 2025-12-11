import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSurveyEmail, generateReplyAddress } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { municipalityIds, templateId, title, additionalEmails = [], parseReplies = true } = body

    if (!municipalityIds?.length || !templateId) {
      return NextResponse.json(
        { error: 'Municipality IDs and template ID are required' },
        { status: 400 }
      )
    }

    // Get template with questions
    const template = await prisma.surveyTemplate.findUnique({
      where: { id: templateId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Get municipalities
    const municipalities = await prisma.municipality.findMany({
      where: { id: { in: municipalityIds } },
    })

    const surveys = []
    const emailResults = []

    for (const municipality of municipalities) {
      // Collect all recipient emails
      const recipientEmails = [
        ...(municipality.contactEmail ? [municipality.contactEmail] : []),
        ...additionalEmails,
      ]

      if (recipientEmails.length === 0) {
        console.log(`No recipients for municipality ${municipality.name}, skipping`)
        continue
      }

      // Create survey
      const survey = await prisma.survey.create({
        data: {
          templateId,
          municipalityId: municipality.id,
          createdById: session.id,
          title: title || `Survey - ${new Date().toLocaleDateString('sv-SE')}`,
          status: 'SENT',
          sentAt: new Date(),
          recipientEmails: JSON.stringify(recipientEmails),
          parseReplies,
        },
      })

      surveys.push(survey)

      // Send emails to each recipient
      for (const recipientEmail of recipientEmails) {
        const replyToAddress = generateReplyAddress(survey.id)

        // Prepare question data for email
        const questionsForEmail = template.questions.map((q) => ({
          code: q.questionCode,
          text: q.questionText,
          type: q.questionType,
          category: q.category || 'General',
        }))

        // Send email
        const emailResult = await sendSurveyEmail({
          surveyId: survey.id,
          surveyTitle: survey.title,
          municipalityName: municipality.name,
          recipientEmail,
          questions: questionsForEmail,
        })

        // Record email in database
        await prisma.surveyEmail.create({
          data: {
            surveyId: survey.id,
            sentById: session.id,
            recipientEmail,
            subject: `Enkätundersökning: ${survey.title} - ${municipality.name}`,
            bodyHtml: '',
            bodyText: '',
            replyToAddress,
            status: emailResult.success ? 'SENT' : 'BOUNCED',
            sentAt: emailResult.success ? new Date() : null,
            errorMessage: emailResult.error,
          },
        })

        emailResults.push({
          surveyId: survey.id,
          recipientEmail,
          success: emailResult.success,
          error: emailResult.error,
        })
      }
    }

    return NextResponse.json({
      success: true,
      surveys: surveys.map((s) => ({ id: s.id, title: s.title })),
      emailResults,
    })
  } catch (error) {
    console.error('Send survey error:', error)
    return NextResponse.json(
      { error: 'Failed to send surveys' },
      { status: 500 }
    )
  }
}

