import nodemailer from 'nodemailer'
import { v4 as uuid } from 'uuid'

// Email configuration
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: false,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  })
}

export interface SurveyEmailData {
  surveyId: string
  surveyTitle: string
  municipalityName: string
  recipientEmail: string
  recipientName?: string
  surveyLink?: string
  questions: Array<{
    code: string
    text: string
    type: string
    category: string
  }>
}

// Generate unique reply-to address for tracking
export function generateReplyAddress(surveyId: string): string {
  const domain = process.env.REPLY_EMAIL_DOMAIN || 'healthcare-provider.demo'
  return `reply+${surveyId}@${domain}`
}

// Parse survey ID from reply-to address
export function parseSurveyIdFromReplyAddress(email: string): string | null {
  const match = email.match(/reply\+([a-f0-9-]+)@/i)
  return match ? match[1] : null
}

// Generate survey email content
export function generateSurveyEmail(data: SurveyEmailData): { subject: string; html: string; text: string } {
  const subject = `Enkätundersökning: ${data.surveyTitle} - ${data.municipalityName}`
  
  // Build question list for email
  const questionsByCategory = data.questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = []
    acc[q.category].push(q)
    return acc
  }, {} as Record<string, typeof data.questions>)

  const questionListHtml = Object.entries(questionsByCategory)
    .map(([category, questions]) => `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #0d9488; font-size: 16px; margin-bottom: 10px;">${category}</h3>
        ${questions
          .filter(q => q.type === 'RATING')
          .map(q => `
            <div style="margin-bottom: 15px; padding: 12px; background: #f5f5f4; border-radius: 8px;">
              <p style="margin: 0 0 8px 0; font-weight: 500;">${q.code}: ${q.text}</p>
              <p style="margin: 0; color: #78716c; font-size: 14px;">
                Svara med ett tal 1-10 (1 = mycket dåligt, 10 = utmärkt) eller N/A
              </p>
            </div>
          `)
          .join('')}
      </div>
    `)
    .join('')

  const questionListText = Object.entries(questionsByCategory)
    .map(([category, questions]) => 
      `\n${category}\n${'─'.repeat(40)}\n` +
      questions
        .filter(q => q.type === 'RATING')
        .map(q => `${q.code}: ${q.text}\n(Svara 1-10 eller N/A)`)
        .join('\n\n')
    )
    .join('\n')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fafaf9; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 2px 15px rgba(0,0,0,0.07);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0d9488, #09615c); padding: 30px; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Health Care Provider</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Enkätundersökning</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #1c1917;">Hej${data.recipientName ? ` ${data.recipientName}` : ''},</p>
      
      <p style="color: #44403c; line-height: 1.6;">
        Vi genomför en kvalitetsundersökning för <strong>${data.municipalityName}</strong> och skulle 
        uppskatta dina synpunkter på vår tjänst.
      </p>
      
      <div style="background: #e6f7f7; border-left: 4px solid #0d9488; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #052f2f;">
          <strong>📧 Svara enkelt via e-post!</strong><br>
          Du kan svara direkt på detta mejl med dina svar. Skriv varje svar på en ny rad i formatet:<br>
          <code style="background: white; padding: 2px 6px; border-radius: 4px;">Frågenummer: Ditt svar</code>
        </p>
      </div>
      
      <p style="color: #44403c; font-weight: 500;">Exempel på svar:</p>
      <pre style="background: #1c1917; color: #fafaf9; padding: 15px; border-radius: 8px; font-size: 14px; overflow-x: auto;">Q3a: 8
Q4a: 9
Q4b: 7
Kommentar: Personalen är mycket hjälpsam och professionell.</pre>
      
      <h2 style="color: #1c1917; font-size: 18px; margin-top: 30px;">Frågor att besvara</h2>
      
      ${questionListHtml}
      
      <div style="background: #f5f5f4; padding: 20px; border-radius: 8px; margin-top: 30px;">
        <p style="margin: 0 0 10px 0; color: #57534e;">
          <strong>Tips:</strong>
        </p>
        <ul style="margin: 0; padding-left: 20px; color: #57534e;">
          <li>Svara med siffror 1-10 för varje fråga</li>
          <li>Skriv N/A om frågan inte är tillämpbar</li>
          <li>Lägg gärna till kommentarer för förbättringsförslag</li>
        </ul>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f5f5f4; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="margin: 0; color: #78716c; font-size: 14px;">
        © ${new Date().getFullYear()} Health Care Provider. Alla rättigheter förbehållna.
      </p>
      <p style="margin: 8px 0 0 0; color: #a8a29e; font-size: 12px;">
        Enkät-ID: ${data.surveyId}
      </p>
    </div>
  </div>
</body>
</html>
`

  const text = `
HEALTH CARE PROVIDER - ENKÄTUNDERSÖKNING
${'═'.repeat(50)}

Hej${data.recipientName ? ` ${data.recipientName}` : ''},

Vi genomför en kvalitetsundersökning för ${data.municipalityName} och skulle 
uppskatta dina synpunkter på vår tjänst.

📧 SVARA ENKELT VIA E-POST!
Du kan svara direkt på detta mejl med dina svar.
Skriv varje svar på en ny rad i formatet: Frågenummer: Ditt svar

EXEMPEL PÅ SVAR:
Q3a: 8
Q4a: 9
Q4b: 7
Kommentar: Personalen är mycket hjälpsam och professionell.

${'─'.repeat(50)}
FRÅGOR ATT BESVARA
${questionListText}

${'─'.repeat(50)}
TIPS:
• Svara med siffror 1-10 för varje fråga
• Skriv N/A om frågan inte är tillämpbar
• Lägg gärna till kommentarer för förbättringsförslag

${'─'.repeat(50)}
Enkät-ID: ${data.surveyId}
© ${new Date().getFullYear()} Health Care Provider
`

  return { subject, html, text }
}

// Send survey email
export async function sendSurveyEmail(data: SurveyEmailData): Promise<{
  success: boolean
  messageId?: string
  replyToAddress: string
  error?: string
}> {
  const transporter = getTransporter()
  const replyToAddress = generateReplyAddress(data.surveyId)
  const { subject, html, text } = generateSurveyEmail(data)

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Health Care Provider'}" <${process.env.SMTP_FROM || 'surveys@healthcare-provider.demo'}>`,
      to: data.recipientEmail,
      replyTo: replyToAddress,
      subject,
      html,
      text,
    })

    return {
      success: true,
      messageId: info.messageId,
      replyToAddress,
    }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      replyToAddress,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Parse email reply for survey responses
export interface ParsedResponse {
  questionCode: string
  value: string | number | null
  isNA: boolean
}

export interface ParsedEmailReply {
  surveyId: string | null
  responses: ParsedResponse[]
  freeText: string
  rawContent: string
}

export function parseEmailReply(
  fromAddress: string,
  toAddress: string,
  subject: string,
  body: string
): ParsedEmailReply {
  // Extract survey ID from reply-to address or subject
  let surveyId = parseSurveyIdFromReplyAddress(toAddress)
  
  // Fallback: try to extract from subject
  if (!surveyId) {
    const subjectMatch = subject.match(/Enkät-ID:\s*([a-f0-9-]+)/i) ||
                         subject.match(/Survey-ID:\s*([a-f0-9-]+)/i)
    if (subjectMatch) surveyId = subjectMatch[1]
  }

  const responses: ParsedResponse[] = []
  const lines = body.split('\n')
  const freeTextLines: string[] = []

  // Regular expressions for parsing
  const ratingPattern = /^(Q\d+[a-z]?)\s*[:=]\s*(\d{1,2}|N\/?A)/i
  const commentPattern = /^(Q\d+_comment|Kommentar|Comment)\s*[:=]\s*(.+)/i
  const yesNoPattern = /^(Q_\w+)\s*[:=]\s*(ja|nej|yes|no)/i

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    // Try rating pattern
    const ratingMatch = trimmedLine.match(ratingPattern)
    if (ratingMatch) {
      const code = ratingMatch[1].toUpperCase()
      const valueStr = ratingMatch[2].toUpperCase()
      const isNA = valueStr === 'N/A' || valueStr === 'NA'
      const value = isNA ? null : parseInt(valueStr)
      
      if (isNA || (value && value >= 1 && value <= 10)) {
        responses.push({ questionCode: code, value, isNA })
        continue
      }
    }

    // Try comment pattern
    const commentMatch = trimmedLine.match(commentPattern)
    if (commentMatch) {
      const code = commentMatch[1].includes('_') ? commentMatch[1].toUpperCase() : 'GENERAL_COMMENT'
      responses.push({ questionCode: code, value: commentMatch[2].trim(), isNA: false })
      continue
    }

    // Try yes/no pattern
    const yesNoMatch = trimmedLine.match(yesNoPattern)
    if (yesNoMatch) {
      const code = yesNoMatch[1].toUpperCase()
      const value = yesNoMatch[2].toLowerCase()
      const boolValue = value === 'ja' || value === 'yes'
      responses.push({ questionCode: code, value: boolValue ? 1 : 0, isNA: false })
      continue
    }

    // If line doesn't match any pattern, add to free text
    // But skip common email artifacts
    if (!trimmedLine.startsWith('>') && 
        !trimmedLine.startsWith('On ') &&
        !trimmedLine.startsWith('From:') &&
        !trimmedLine.startsWith('Sent:') &&
        !trimmedLine.startsWith('To:') &&
        !trimmedLine.includes('wrote:') &&
        !trimmedLine.match(/^-{3,}/) &&
        !trimmedLine.match(/^_{3,}/)) {
      freeTextLines.push(trimmedLine)
    }
  }

  return {
    surveyId,
    responses,
    freeText: freeTextLines.join('\n').trim(),
    rawContent: body,
  }
}

