/**
 * Demo Reply Simulator
 * 
 * This script simulates a municipality replying to a survey email.
 * It posts a mock email reply to the /api/inbound-email endpoint.
 * 
 * Usage:
 *   npm run demo:reply
 * 
 * Or with a specific survey ID:
 *   npm run demo:reply -- --survey-id=<uuid>
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface SimulatedReply {
  surveyId: string
  fromEmail: string
  responses: Record<string, number | string>
  comment?: string
}

async function getLatestSurvey(): Promise<string | null> {
  try {
    // In a real scenario, we'd query the database
    // For demo purposes, we'll try to get from an environment variable or use a placeholder
    const args = process.argv.slice(2)
    const surveyIdArg = args.find(arg => arg.startsWith('--survey-id='))
    if (surveyIdArg) {
      return surveyIdArg.split('=')[1]
    }
    
    console.log('No survey ID provided. Using demo survey ID.')
    console.log('To test with a real survey, run: npm run demo:reply -- --survey-id=YOUR_SURVEY_ID')
    return 'demo-survey-id'
  } catch (error) {
    return null
  }
}

async function simulateReply(reply: SimulatedReply): Promise<void> {
  console.log('\n📧 Simulating email reply...')
  console.log(`   Survey ID: ${reply.surveyId}`)
  console.log(`   From: ${reply.fromEmail}`)
  
  // Build email body
  const bodyLines: string[] = []
  
  for (const [questionCode, value] of Object.entries(reply.responses)) {
    bodyLines.push(`${questionCode}: ${value}`)
  }
  
  if (reply.comment) {
    bodyLines.push('')
    bodyLines.push(`Kommentar: ${reply.comment}`)
  }
  
  const emailBody = bodyLines.join('\n')
  
  console.log('\n   📝 Email content:')
  console.log('   ─────────────────────')
  console.log(emailBody.split('\n').map(l => `   ${l}`).join('\n'))
  console.log('   ─────────────────────\n')
  
  // Send to inbound email endpoint
  const payload = {
    from: reply.fromEmail,
    to: `reply+${reply.surveyId}@healthcare-provider.demo`,
    subject: `Re: Enkätundersökning - Survey`,
    body: emailBody,
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/inbound-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': 'demo-webhook-secret-change-in-production',
      },
      body: JSON.stringify(payload),
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Reply processed successfully!')
      console.log(`   Responses saved: ${result.responsesProcessed || 0}`)
      if (result.freeTextSaved) {
        console.log('   Free text comment saved: Yes')
      }
    } else {
      console.log('❌ Failed to process reply:')
      console.log(`   Error: ${result.error}`)
    }
  } catch (error) {
    console.error('❌ Network error:', error)
    console.log('\n⚠️  Make sure the app is running at:', BASE_URL)
    console.log('   Run: npm run dev')
  }
}

async function main() {
  console.log('═══════════════════════════════════════════')
  console.log('  Healthcare Survey - Email Reply Simulator')
  console.log('═══════════════════════════════════════════')
  
  const surveyId = await getLatestSurvey()
  
  if (!surveyId) {
    console.error('❌ No survey found. Please send a survey first.')
    process.exit(1)
  }
  
  // Simulate a high-quality response
  const reply: SimulatedReply = {
    surveyId,
    fromEmail: 'kommun@nordiccare.se',
    responses: {
      'Q3a': 8,
      'Q3b': 9,
      'Q4a': 8,
      'Q4b': 7,
      'Q4c': 9,
      'Q5a': 8,
      'Q5b': 8,
      'Q5c': 7,
      'Q6a': 9,
      'Q6b': 8,
      'Q6c': 9,
      'Q6d': 9,
      'Q7a': 8,
      'Q7b': 7,
      'Q8a': 8,
      'Q8b': 9,
      'Q9a': 7,
      'Q9b': 6,
      'Q10a': 8,
      'Q10b': 7,
      'Q11a': 8,
      'Q11b': 8,
      'Q12a': 9,
      'Q12b': 8,
      'Q13a': 7,
      'Q13b': 7,
      'Q14a': 9,
      'Q14b': 8,
      'Q19': 8,
    },
    comment: 'Överlag mycket nöjda med placeringen. Personalen är professionell och engagerad. Förbättringsområde: kommunikation kring vårdplan kunde vara tydligare.',
  }
  
  await simulateReply(reply)
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 View results at: http://localhost:3000/dashboard')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch(console.error)

