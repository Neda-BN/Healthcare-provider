import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('📦 Clearing existing data...')
  await prisma.surveyResponse.deleteMany()
  await prisma.surveyEmail.deleteMany()
  await prisma.survey.deleteMany()
  await prisma.surveyQuestion.deleteMany()
  await prisma.surveyTemplate.deleteMany()
  await prisma.placement.deleteMany()
  await prisma.municipality.deleteMany()
  await prisma.user.deleteMany()
  await prisma.systemSetting.deleteMany()

  // ==========================================
  // CREATE USERS
  // ==========================================
  console.log('👤 Creating users...')
  
  const adminPassword = await bcrypt.hash('admin123', 10)
  const caregiverPassword = await bcrypt.hash('caregiver123', 10)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@healthcare-provider.se',
      passwordHash: adminPassword,
      name: 'Anna Administratör',
      role: 'ADMIN',
    },
  })

  const caregiverUser = await prisma.user.create({
    data: {
      email: 'caregiver@healthcare-provider.se',
      passwordHash: caregiverPassword,
      name: 'Karl Karlsson',
      role: 'CAREGIVER',
    },
  })

  console.log(`   ✓ Created admin: ${adminUser.email}`)
  console.log(`   ✓ Created caregiver: ${caregiverUser.email}`)

  // ==========================================
  // CREATE MUNICIPALITIES
  // ==========================================
  console.log('🏛️  Creating municipalities...')

  const municipalities = await Promise.all([
    prisma.municipality.create({
      data: {
        name: 'Nordic Care AB',
        organizationNumber: '556123-4567',
        businessType: 'HVB',
        contactEmail: 'kommun@nordiccare.se',
        contactPhone: '+46 8 123 45 67',
        address: 'Storgatan 1',
        city: 'Stockholm',
        postalCode: '111 22',
        frameworkAgreementStart: new Date('2024-01-01'),
        frameworkAgreementEnd: new Date('2025-12-31'),
        notes: 'Primary municipality partner with excellent collaboration history.',
      },
    }),
    prisma.municipality.create({
      data: {
        name: 'Problem Care AB',
        organizationNumber: '556234-5678',
        businessType: 'LSS',
        contactEmail: 'kontakt@problemcare.se',
        contactPhone: '+46 31 234 56 78',
        address: 'Problemgatan 42',
        city: 'Göteborg',
        postalCode: '411 01',
        frameworkAgreementStart: new Date('2024-03-01'),
        frameworkAgreementEnd: new Date('2025-02-28'),
        notes: 'Challenging cases, requires extra attention to documentation.',
      },
    }),
    prisma.municipality.create({
      data: {
        name: 'Average Joe Omsorg',
        organizationNumber: '556345-6789',
        businessType: 'ELDERLY_CARE',
        contactEmail: 'info@averagejoe.se',
        contactPhone: '+46 40 345 67 89',
        address: 'Medelvagen 10',
        city: 'Malmö',
        postalCode: '211 20',
        frameworkAgreementStart: new Date('2024-06-01'),
        frameworkAgreementEnd: new Date('2026-05-31'),
        notes: 'Standard contract, reliable partnership.',
      },
    }),
  ])

  console.log(`   ✓ Created ${municipalities.length} municipalities`)

  // ==========================================
  // CREATE PLACEMENTS
  // ==========================================
  console.log('📋 Creating placements...')

  const placements = await Promise.all([
    // Nordic Care placements
    prisma.placement.create({
      data: {
        municipalityId: municipalities[0].id,
        placementNumber: 'NC-2024-001',
        clientInitials: 'A.B.',
        startDate: new Date('2024-01-15'),
        status: 'ACTIVE',
      },
    }),
    prisma.placement.create({
      data: {
        municipalityId: municipalities[0].id,
        placementNumber: 'NC-2024-002',
        clientInitials: 'C.D.',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        status: 'COMPLETED',
      },
    }),
    // Problem Care placements
    prisma.placement.create({
      data: {
        municipalityId: municipalities[1].id,
        placementNumber: 'PC-2024-001',
        clientInitials: 'E.F.',
        startDate: new Date('2024-04-01'),
        status: 'ACTIVE',
      },
    }),
    // Average Joe placements
    prisma.placement.create({
      data: {
        municipalityId: municipalities[2].id,
        placementNumber: 'AJ-2024-001',
        clientInitials: 'G.H.',
        startDate: new Date('2024-06-15'),
        status: 'ACTIVE',
      },
    }),
    prisma.placement.create({
      data: {
        municipalityId: municipalities[2].id,
        placementNumber: 'AJ-2024-002',
        clientInitials: 'I.J.',
        startDate: new Date('2024-07-01'),
        status: 'ACTIVE',
      },
    }),
  ])

  console.log(`   ✓ Created ${placements.length} placements`)

  // ==========================================
  // CREATE SURVEY TEMPLATE
  // ==========================================
  console.log('📝 Creating survey template with questions...')

  const template = await prisma.surveyTemplate.create({
    data: {
      name: 'Nordic Care Quality Index',
      description: 'Comprehensive quality assessment survey based on the Nordic Care Index methodology.',
      isDefault: true,
      version: 1,
    },
  })

  // Survey questions based on the Nordic Care Index structure
  const questions = [
    // Information about service
    { code: 'Q3a', text: 'Hur väl har du fått information om tjänsten och dess innehåll?', type: 'RATING', category: 'Information om tjänsten', order: 1 },
    { code: 'Q3b', text: 'Hur väl har du fått information om boendets regler och rutiner?', type: 'RATING', category: 'Information om tjänsten', order: 2 },
    { code: 'Q3_comment', text: 'Kommentar till information om tjänsten', type: 'LONGTEXT', category: 'Information om tjänsten', order: 3 },
    
    // Reception & Introduction
    { code: 'Q4a', text: 'Hur väl blev du mottagen vid ankomst?', type: 'RATING', category: 'Mottagning & introduktion', order: 4 },
    { code: 'Q4b', text: 'Hur väl introducerades du till personal och andra boende?', type: 'RATING', category: 'Mottagning & introduktion', order: 5 },
    { code: 'Q4c', text: 'Hur väl fick du en rundvisning av boendet?', type: 'RATING', category: 'Mottagning & introduktion', order: 6 },
    { code: 'Q4_comment', text: 'Kommentar till mottagning och introduktion', type: 'LONGTEXT', category: 'Mottagning & introduktion', order: 7 },
    
    // Implementation plan
    { code: 'Q5a', text: 'Hur väl har genomförandeplanen upprättats tillsammans med dig?', type: 'RATING', category: 'Genomförandeplan', order: 8 },
    { code: 'Q5b', text: 'Hur väl är genomförandeplanen anpassad efter dina behov?', type: 'RATING', category: 'Genomförandeplan', order: 9 },
    { code: 'Q5c', text: 'Hur väl följs genomförandeplanen upp?', type: 'RATING', category: 'Genomförandeplan', order: 10 },
    { code: 'Q5_comment', text: 'Kommentar till genomförandeplan', type: 'LONGTEXT', category: 'Genomförandeplan', order: 11 },
    
    // Care efforts
    { code: 'Q6a', text: 'Hur väl bemöts du av personalen?', type: 'RATING', category: 'Omsorgsinsatser', order: 12 },
    { code: 'Q6b', text: 'Hur väl tillgodoses dina dagliga behov?', type: 'RATING', category: 'Omsorgsinsatser', order: 13 },
    { code: 'Q6c', text: 'Hur trygg känner du dig på boendet?', type: 'RATING', category: 'Omsorgsinsatser', order: 14 },
    { code: 'Q6d', text: 'Hur väl respekteras din integritet?', type: 'RATING', category: 'Omsorgsinsatser', order: 15 },
    { code: 'Q6_comment', text: 'Kommentar till omsorgsinsatser', type: 'LONGTEXT', category: 'Omsorgsinsatser', order: 16 },
    
    // Motivation
    { code: 'Q7a', text: 'Hur väl motiveras du till positiv förändring?', type: 'RATING', category: 'Motivation', order: 17 },
    { code: 'Q7b', text: 'Hur väl stöttas du i att nå dina mål?', type: 'RATING', category: 'Motivation', order: 18 },
    { code: 'Q7_comment', text: 'Kommentar till motivation', type: 'LONGTEXT', category: 'Motivation', order: 19 },
    
    // Social control
    { code: 'Q8a', text: 'Hur väl hanteras konflikter på boendet?', type: 'RATING', category: 'Social kontroll', order: 20 },
    { code: 'Q8b', text: 'Hur säker känner du dig från våld och hot?', type: 'RATING', category: 'Social kontroll', order: 21 },
    { code: 'Q8_comment', text: 'Kommentar till social kontroll', type: 'LONGTEXT', category: 'Social kontroll', order: 22 },
    
    // Work & studies
    { code: 'Q9a', text: 'Hur väl får du stöd med arbete eller praktik?', type: 'RATING', category: 'Arbete & studier', order: 23 },
    { code: 'Q9b', text: 'Hur väl får du stöd med studier?', type: 'RATING', category: 'Arbete & studier', order: 24 },
    { code: 'Q9_comment', text: 'Kommentar till arbete och studier', type: 'LONGTEXT', category: 'Arbete & studier', order: 25 },
    
    // Leisure activities
    { code: 'Q10a', text: 'Hur väl erbjuds du meningsfulla fritidsaktiviteter?', type: 'RATING', category: 'Fritidsaktiviteter', order: 26 },
    { code: 'Q10b', text: 'Hur väl kan du delta i aktiviteter utanför boendet?', type: 'RATING', category: 'Fritidsaktiviteter', order: 27 },
    { code: 'Q10_comment', text: 'Kommentar till fritidsaktiviteter', type: 'LONGTEXT', category: 'Fritidsaktiviteter', order: 28 },
    
    // Network work
    { code: 'Q11a', text: 'Hur väl stöttas du i kontakt med familj och närstående?', type: 'RATING', category: 'Nätverksarbete', order: 29 },
    { code: 'Q11b', text: 'Hur väl involveras ditt nätverk i din vård?', type: 'RATING', category: 'Nätverksarbete', order: 30 },
    { code: 'Q11_comment', text: 'Kommentar till nätverksarbete', type: 'LONGTEXT', category: 'Nätverksarbete', order: 31 },
    
    // Follow-up/reporting
    { code: 'Q12a', text: 'Hur väl hålls uppdragsgivaren informerad om din utveckling?', type: 'RATING', category: 'Uppföljning/rapportering', order: 32 },
    { code: 'Q12b', text: 'Hur väl deltar du i uppföljningsmöten?', type: 'RATING', category: 'Uppföljning/rapportering', order: 33 },
    { code: 'Q12_comment', text: 'Kommentar till uppföljning', type: 'LONGTEXT', category: 'Uppföljning/rapportering', order: 34 },
    
    // Discharge
    { code: 'Q13a', text: 'Hur väl förbereds du för utskrivning?', type: 'RATING', category: 'Utskrivning', order: 35 },
    { code: 'Q13b', text: 'Hur väl planeras din eftervård?', type: 'RATING', category: 'Utskrivning', order: 36 },
    { code: 'Q13_comment', text: 'Kommentar till utskrivning', type: 'LONGTEXT', category: 'Utskrivning', order: 37 },
    
    // Placement suitability
    { code: 'Q14a', text: 'Hur lämplig är placeringen för dina behov?', type: 'RATING', category: 'Placerings lämplighet', order: 38 },
    { code: 'Q14b', text: 'Hur väl matchades du till rätt boende?', type: 'RATING', category: 'Placerings lämplighet', order: 39 },
    { code: 'Q14_comment', text: 'Kommentar till placerings lämplighet', type: 'LONGTEXT', category: 'Placerings lämplighet', order: 40 },
    
    // Overall assessment
    { code: 'Q19', text: 'Hur nöjd är du övergripande med placeringen?', type: 'RATING', category: 'Övergripande bedömning', order: 41 },
    { code: 'Q19_comment', text: 'Övergripande kommentarer och förbättringsförslag', type: 'LONGTEXT', category: 'Övergripande bedömning', order: 42 },
    
    // Additional questions
    { code: 'Q_recommend', text: 'Skulle du rekommendera denna placering till andra?', type: 'YESNO', category: 'Övergripande bedömning', order: 43 },
  ]

  await Promise.all(
    questions.map((q) =>
      prisma.surveyQuestion.create({
        data: {
          templateId: template.id,
          questionCode: q.code,
          questionText: q.text,
          questionType: q.type,
          category: q.category,
          orderIndex: q.order,
          required: q.type !== 'LONGTEXT',
          minValue: q.type === 'RATING' ? 1 : null,
          maxValue: q.type === 'RATING' ? 10 : null,
        },
      })
    )
  )

  console.log(`   ✓ Created template with ${questions.length} questions`)

  // ==========================================
  // CREATE SURVEYS WITH RESPONSES
  // ==========================================
  console.log('📊 Creating surveys and sample responses...')

  // Helper function to generate realistic ratings
  const generateRating = (baseScore: number, variance: number = 2): number => {
    const value = baseScore + Math.floor(Math.random() * variance * 2) - variance
    return Math.max(1, Math.min(10, value))
  }

  // Get all questions for responses
  const allQuestions = await prisma.surveyQuestion.findMany({
    where: { templateId: template.id },
    orderBy: { orderIndex: 'asc' },
  })

  // Create surveys for each municipality with varying quality scores
  const surveyData = [
    // Nordic Care - High performer (avg ~8.5)
    { municipality: municipalities[0], baseScore: 8, count: 5, title: 'Nordic Care Quarterly Assessment' },
    { municipality: municipalities[0], baseScore: 9, count: 3, title: 'Nordic Care Follow-up Survey' },
    // Problem Care - Low performer (avg ~5.5)
    { municipality: municipalities[1], baseScore: 5, count: 4, title: 'Problem Care Quality Review' },
    { municipality: municipalities[1], baseScore: 6, count: 2, title: 'Problem Care Improvement Survey' },
    // Average Joe - Medium performer (avg ~7.0)
    { municipality: municipalities[2], baseScore: 7, count: 4, title: 'Average Joe Standard Assessment' },
    { municipality: municipalities[2], baseScore: 7, count: 3, title: 'Average Joe Monthly Check' },
  ]

  const comments = [
    'Personalen är mycket professionell och hjälpsam.',
    'Det finns utrymme för förbättring i kommunikationen.',
    'Bra bemötande överlag, men lite trångt i lokalerna.',
    'Mycket nöjd med stödet jag har fått.',
    'Aktiviteterna kunde vara mer varierade.',
    'Utmärkt samarbete med socialsekreteraren.',
    'Personalens tillgänglighet varierar.',
    'Känner mig trygg och väl omhändertagen.',
    'Dokumentationen kunde vara bättre.',
    'Positivt att det finns struktur i vardagen.',
  ]

  let totalSurveys = 0
  let totalResponses = 0

  for (const data of surveyData) {
    for (let i = 0; i < data.count; i++) {
      const survey = await prisma.survey.create({
        data: {
          templateId: template.id,
          municipalityId: data.municipality.id,
          createdById: i % 2 === 0 ? adminUser.id : caregiverUser.id,
          title: `${data.title} - ${i + 1}`,
          status: 'COMPLETED',
          sentAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Random date in last 6 months
          completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last month
          recipientEmails: JSON.stringify([data.municipality.contactEmail]),
          parseReplies: true,
        },
      })
      totalSurveys++

      // Create responses for each question
      for (const question of allQuestions) {
        let responseData: {
          surveyId: string
          questionId: string
          ratingValue?: number
          textValue?: string
          boolValue?: boolean
          naValue: boolean
          respondentEmail: string
          source: string
        } = {
          surveyId: survey.id,
          questionId: question.id,
          naValue: Math.random() < 0.05, // 5% chance of N/A
          respondentEmail: data.municipality.contactEmail || 'unknown@example.com',
          source: 'EMAIL',
        }

        if (!responseData.naValue) {
          if (question.questionType === 'RATING') {
            responseData.ratingValue = generateRating(data.baseScore)
          } else if (question.questionType === 'LONGTEXT') {
            // 70% chance of having a comment
            if (Math.random() < 0.7) {
              responseData.textValue = comments[Math.floor(Math.random() * comments.length)]
            }
          } else if (question.questionType === 'YESNO') {
            responseData.boolValue = data.baseScore >= 7 ? Math.random() > 0.2 : Math.random() > 0.5
          }
        }

        await prisma.surveyResponse.create({ data: responseData })
        totalResponses++
      }
    }
  }

  console.log(`   ✓ Created ${totalSurveys} surveys with ${totalResponses} responses`)

  // ==========================================
  // CREATE SYSTEM SETTINGS
  // ==========================================
  console.log('⚙️  Creating system settings...')

  await prisma.systemSetting.createMany({
    data: [
      { key: 'company_name', value: 'Health Care Provider', category: 'BRANDING' },
      { key: 'default_survey_template', value: template.id, category: 'SURVEY' },
      { key: 'email_reminder_days', value: '7', category: 'EMAIL' },
      { key: 'require_all_questions', value: 'false', category: 'SURVEY' },
    ],
  })

  console.log('   ✓ Created system settings')

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n✅ Seed completed successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Database Summary:')
  console.log(`   • ${await prisma.user.count()} users`)
  console.log(`   • ${await prisma.municipality.count()} municipalities`)
  console.log(`   • ${await prisma.placement.count()} placements`)
  console.log(`   • ${await prisma.surveyTemplate.count()} survey templates`)
  console.log(`   • ${await prisma.surveyQuestion.count()} questions`)
  console.log(`   • ${await prisma.survey.count()} surveys`)
  console.log(`   • ${await prisma.surveyResponse.count()} responses`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🔑 Demo Login Credentials:')
  console.log('   Admin:     admin@healthcare-provider.se / admin123')
  console.log('   Caregiver: caregiver@healthcare-provider.se / caregiver123')
  console.log('\n🚀 Run "npm run dev" to start the application!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



