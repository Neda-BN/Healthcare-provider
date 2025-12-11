import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseEmailReply, parseSurveyIdFromReplyAddress } from '@/lib/email'

// Inbound email webhook handler
// Supports both direct POST and email provider webhooks (SendGrid, Mailgun)

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.INBOUND_EMAIL_SECRET
    const providedSecret = request.headers.get('x-webhook-secret') ||
                          request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (webhookSecret && webhookSecret !== 'demo-webhook-secret-change-in-production') {
      if (providedSecret !== webhookSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const contentType = request.headers.get('content-type') || ''
    let emailData: {
      from: string
      to: string
      subject: string
      body: string
      rawBody?: string
    }

    // Parse based on content type
    if (contentType.includes('application/json')) {
      // Direct JSON payload (for demo/testing)
      const json = await request.json()
      emailData = {
        from: json.from || json.sender || json.envelope?.from || '',
        to: json.to || json.recipient || json.envelope?.to || '',
        subject: json.subject || '',
        body: json.body || json.text || json['body-plain'] || json.stripped_text || '',
        rawBody: json.rawBody || json.body_html || json['body-html'] || '',
      }
    } else if (contentType.includes('multipart/form-data')) {
      // SendGrid/Mailgun form data format
      const formData = await request.formData()
      emailData = {
        from: formData.get('from')?.toString() || formData.get('sender')?.toString() || '',
        to: formData.get('to')?.toString() || formData.get('recipient')?.toString() || '',
        subject: formData.get('subject')?.toString() || '',
        body: formData.get('text')?.toString() || formData.get('body-plain')?.toString() || '',
        rawBody: formData.get('html')?.toString() || formData.get('body-html')?.toString() || '',
      }
    } else {
      // Try to parse as plain text
      const text = await request.text()
      try {
        const json = JSON.parse(text)
        emailData = {
          from: json.from || '',
          to: json.to || '',
          subject: json.subject || '',
          body: json.body || '',
        }
      } catch {
        return NextResponse.json(
          { error: 'Unsupported content type or malformed request' },
          { status: 400 }
        )
      }
    }

    // Parse the email reply
    const parsed = parseEmailReply(
      emailData.from,
      emailData.to,
      emailData.subject,
      emailData.body
    )

    if (!parsed.surveyId) {
      console.log('Could not extract survey ID from email')
      return NextResponse.json(
        { error: 'Could not identify survey from email' },
        { status: 400 }
      )
    }

    // Find the survey
    const survey = await prisma.survey.findUnique({
      where: { id: parsed.surveyId },
      include: {
        template: {
          include: {
            questions: true,
          },
        },
      },
    })

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Check if survey accepts replies
    if (!survey.parseReplies) {
      console.log('Survey does not accept email replies')
      return NextResponse.json(
        { message: 'Survey does not accept email replies' },
        { status: 200 }
      )
    }

    // Update email record if exists
    await prisma.surveyEmail.updateMany({
      where: {
        surveyId: survey.id,
        recipientEmail: emailData.from,
      },
      data: {
        hasReply: true,
        replyReceivedAt: new Date(),
        replyContent: emailData.body,
        status: 'REPLIED',
      },
    })

    // Process responses
    const savedResponses = []

    for (const response of parsed.responses) {
      // Find matching question
      const question = survey.template.questions.find(
        (q) => q.questionCode.toUpperCase() === response.questionCode.toUpperCase()
      )

      if (!question) {
        console.log(`Question not found: ${response.questionCode}`)
        continue
      }

      // Prepare response data based on question type
      const responseData: {
        surveyId: string
        questionId: string
        respondentEmail: string
        source: string
        rawEmailContent: string
        ratingValue?: number
        textValue?: string
        boolValue?: boolean
        naValue: boolean
      } = {
        surveyId: survey.id,
        questionId: question.id,
        respondentEmail: emailData.from,
        source: 'EMAIL',
        rawEmailContent: emailData.body,
        naValue: response.isNA,
      }

      if (!response.isNA) {
        if (question.questionType === 'RATING' && typeof response.value === 'number') {
          responseData.ratingValue = response.value
        } else if (question.questionType === 'LONGTEXT' || question.questionType === 'TEXT') {
          responseData.textValue = String(response.value)
        } else if (question.questionType === 'YESNO') {
          responseData.boolValue = response.value === 1
        }
      }

      // Upsert response (replace if exists)
      const saved = await prisma.surveyResponse.upsert({
        where: {
          surveyId_questionId: {
            surveyId: survey.id,
            questionId: question.id,
          },
        },
        create: responseData,
        update: {
          ...responseData,
          respondedAt: new Date(),
        },
      })

      savedResponses.push(saved)
    }

    // If there's free text and no specific question responses, save as general comment
    if (parsed.freeText && parsed.responses.length === 0) {
      // Find a LONGTEXT question to attach the comment to (e.g., Q19_comment)
      const commentQuestion = survey.template.questions.find(
        (q) => q.questionType === 'LONGTEXT' && q.questionCode.includes('19')
      ) || survey.template.questions.find((q) => q.questionType === 'LONGTEXT')

      if (commentQuestion) {
        await prisma.surveyResponse.upsert({
          where: {
            surveyId_questionId: {
              surveyId: survey.id,
              questionId: commentQuestion.id,
            },
          },
          create: {
            surveyId: survey.id,
            questionId: commentQuestion.id,
            textValue: parsed.freeText,
            respondentEmail: emailData.from,
            source: 'EMAIL',
            rawEmailContent: emailData.body,
            naValue: false,
          },
          update: {
            textValue: parsed.freeText,
            respondentEmail: emailData.from,
            respondedAt: new Date(),
          },
        })
      }
    }

    // Update survey status if we have responses
    if (savedResponses.length > 0) {
      const responseCount = await prisma.surveyResponse.count({
        where: { surveyId: survey.id },
      })
      const questionCount = survey.template.questions.length

      await prisma.survey.update({
        where: { id: survey.id },
        data: {
          status: responseCount >= questionCount * 0.5 ? 'COMPLETED' : 'PARTIAL',
          completedAt: responseCount >= questionCount * 0.5 ? new Date() : undefined,
        },
      })
    }

    return NextResponse.json({
      success: true,
      surveyId: survey.id,
      responsesProcessed: savedResponses.length,
      freeTextSaved: !!parsed.freeText,
    })
  } catch (error) {
    console.error('Inbound email error:', error)
    return NextResponse.json(
      { error: 'Failed to process inbound email' },
      { status: 500 }
    )
  }
}

// GET endpoint for testing/health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Inbound email webhook is ready',
    endpoint: '/api/inbound-email',
    methods: ['POST'],
    formats: ['application/json', 'multipart/form-data'],
  })
}

