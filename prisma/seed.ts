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
  const municipalityPassword = await bcrypt.hash('municipality123', 10)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@healthcare-provider.se',
      passwordHash: adminPassword,
      name: 'Anna Administratör',
      role: 'ADMIN',
    },
  })

  const municipalityUser = await prisma.user.create({
    data: {
      email: 'municipality@healthcare-provider.se',
      passwordHash: municipalityPassword,
      name: 'Maria Kommun',
      role: 'CAREGIVER',
    },
  })

  console.log(`   ✓ Created admin: ${adminUser.email}`)
  console.log(`   ✓ Created municipality: ${municipalityUser.email}`)

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
  // CREATE SURVEY TEMPLATES (HVB and LSS)
  // ==========================================
  console.log('📝 Creating survey templates with questions...')

  // HVB Survey Template (default)
  const hvbTemplate = await prisma.surveyTemplate.create({
    data: {
      name: 'HVB Kvalitetsundersökning',
      description: 'Standardiserad enkät för HVB-verksamhet (Hem för vård eller boende). 21 fördefinierade frågor.',
      isDefault: true,
      surveyType: 'HVB',
      version: 1,
    },
  })

  // HVB Questions
  const hvbQuestions = [
    { code: 'Q1', text: 'Är aktuell placering pågående i verksamheten just nu?', type: 'TEXT', category: 'Kommentar om intervjun', order: 0 },
    { code: 'Q2', text: 'Vilken typ av placering gäller det (familj, vuxen, barn, par, förälder och barn, akutplacering, behandling, utredning, vård etc.)?', type: 'TEXT', category: 'Kommentar om intervjun', order: 1 },
    { code: 'Q3a', text: 'Om Du fick betygsätta den information som ni fick om verksamheten, innan ert beslut om placering, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Information och mottagande', order: 2 },
    { code: 'Q3b', text: 'Hur fick du kännedom om verksamheten (placeringsservice, kollega, broschyr, utskick etc.)?', type: 'TEXT', category: 'Information och mottagande', order: 3 },
    { code: 'Q4', text: 'Om Du fick betygsätta mottagande och introduktion av er klient, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Information och mottagande', order: 4 },
    { code: 'Q5', text: 'Om Du fick betygsätta verksamhetens arbete kring klientens genomförandeplan (upprättande, revideringar, arbetet enligt denna plan etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Vårdkvalitet', order: 5 },
    { code: 'Q6', text: 'Om Du fick betygsätta verksamhetens omvårdnadsinsatser gentemot klienten (kost, logi, dagliga rutiner etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Vårdkvalitet', order: 6 },
    { code: 'Q7', text: 'Om Du fick betygsätta verksamhetens arbete med att motivera klienten till samverkan enligt den individuellt upprättade behandlingsplanen, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Vårdkvalitet', order: 7 },
    { code: 'Q8', text: 'Om Du fick betygsätta verksamhetens sociala kontroll av klienten (kontroll av destruktivt beteende, kriminalitet, missbruk och begränsning av rörelsefrihet), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Vårdkvalitet', order: 8 },
    { code: 'Q9', text: 'Om Du fick betygsätta möjligheten till arbete och studier för klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Aktiviteter', order: 9 },
    { code: 'Q10', text: 'Om Du fick betygsätta möjligheten till fritidsaktiviteter för klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Aktiviteter', order: 10 },
    { code: 'Q11', text: 'Om Du fick betygsätta verksamhetens arbete med klientens föräldrar/anhöriga (anhörigboende, umgängesmöjligheter och övrig kontakt), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Anhörigkontakt', order: 11 },
    { code: 'Q12', text: 'Om Du fick betygsätta uppföljning och rapportering kring klienten från verksamhetens sida (regelbundna möten, muntlig information, skriftliga rapporter etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Uppföljning', order: 12 },
    { code: 'Q13', text: 'Om Du fick betygsätta verksamhetens planering och genomförande av utslussning av klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Uppföljning', order: 13 },
    { code: 'Q14', text: 'Om Du fick betygsätta denna placering ifråga om hur väl den passade/matchade klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Helhetsbedömning', order: 14 },
    { code: 'Q15', text: 'Skulle Du i ett liknande ärende rekommendera en placering inom samma verksamhet?', type: 'YESNO', category: 'Helhetsbedömning', order: 15 },
    { code: 'Q16', text: 'Vilka anser Du är verksamhetens starkaste sidor?', type: 'TEXT', category: 'Helhetsbedömning', order: 16 },
    { code: 'Q17', text: 'Vilka anser Du är verksamhetens svagaste sidor?', type: 'TEXT', category: 'Helhetsbedömning', order: 17 },
    { code: 'Q18', text: 'Är det någon typ av tjänst eller kompetens som Du saknar hos den här verksamheten i samband med placeringar?', type: 'YESNO', category: 'Helhetsbedömning', order: 18 },
    { code: 'Q19', text: 'Med utgångspunkt från Dina erfarenheter, vilket betyg mellan 1 och 10 skulle Du då ge verksamheten som en helhetsbedömning, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Helhetsbedömning', order: 19 },
    { code: 'Q20', text: 'Övriga kommentarer och synpunkter.', type: 'LONGTEXT', category: 'Övriga kommentarer', order: 20 },
  ]

  await Promise.all(
    hvbQuestions.map((q) =>
      prisma.surveyQuestion.create({
        data: {
          templateId: hvbTemplate.id,
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

  console.log(`   ✓ Created HVB template with ${hvbQuestions.length} questions`)

  // LSS Survey Template
  const lssTemplate = await prisma.surveyTemplate.create({
    data: {
      name: 'LSS Kvalitetsundersökning',
      description: 'Standardiserad enkät för LSS-verksamhet (Lagen om stöd och service). 21 fördefinierade frågor.',
      isDefault: false,
      surveyType: 'LSS',
      version: 1,
    },
  })

  // LSS Questions - Same standardized questions as HVB with L prefix
  const lssQuestions = [
    { code: 'L1', text: 'Är aktuell placering pågående i verksamheten just nu?', type: 'TEXT', category: 'Kommentar om intervjun', order: 0 },
    { code: 'L2', text: 'Vilken typ av placering gäller det (familj, vuxen, barn, par, förälder och barn, akutplacering, behandling, utredning, vård etc.)?', type: 'TEXT', category: 'Kommentar om intervjun', order: 1 },
    { code: 'L3a', text: 'Om Du fick betygsätta den information som ni fick om verksamheten, innan ert beslut om placering, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Information och mottagande', order: 2 },
    { code: 'L3b', text: 'Hur fick du kännedom om verksamheten (placeringsservice, kollega, broschyr, utskick etc.)?', type: 'TEXT', category: 'Information och mottagande', order: 3 },
    { code: 'L4', text: 'Om Du fick betygsätta mottagande och introduktion av er klient, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Information och mottagande', order: 4 },
    { code: 'L5', text: 'Om Du fick betygsätta verksamhetens arbete kring klientens genomförandeplan (upprättande, revideringar, arbetet enligt denna plan etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Vårdkvalitet', order: 5 },
    { code: 'L6', text: 'Om Du fick betygsätta verksamhetens omvårdnadsinsatser gentemot klienten (kost, logi, dagliga rutiner etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Vårdkvalitet', order: 6 },
    { code: 'L7', text: 'Om Du fick betygsätta verksamhetens arbete med att motivera klienten till samverkan enligt den individuellt upprättade behandlingsplanen, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Vårdkvalitet', order: 7 },
    { code: 'L8', text: 'Om Du fick betygsätta verksamhetens sociala kontroll av klienten (kontroll av destruktivt beteende, kriminalitet, missbruk och begränsning av rörelsefrihet), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Vårdkvalitet', order: 8 },
    { code: 'L9', text: 'Om Du fick betygsätta möjligheten till arbete och studier för klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Aktiviteter', order: 9 },
    { code: 'L10', text: 'Om Du fick betygsätta möjligheten till fritidsaktiviteter för klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Aktiviteter', order: 10 },
    { code: 'L11', text: 'Om Du fick betygsätta verksamhetens arbete med klientens föräldrar/anhöriga (anhörigboende, umgängesmöjligheter och övrig kontakt), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Anhörigkontakt', order: 11 },
    { code: 'L12', text: 'Om Du fick betygsätta uppföljning och rapportering kring klienten från verksamhetens sida (regelbundna möten, muntlig information, skriftliga rapporter etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Uppföljning', order: 12 },
    { code: 'L13', text: 'Om Du fick betygsätta verksamhetens planering och genomförande av utslussning av klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Uppföljning', order: 13 },
    { code: 'L14', text: 'Om Du fick betygsätta denna placering ifråga om hur väl den passade/matchade klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Helhetsbedömning', order: 14 },
    { code: 'L15', text: 'Skulle Du i ett liknande ärende rekommendera en placering inom samma verksamhet?', type: 'YESNO', category: 'Helhetsbedömning', order: 15 },
    { code: 'L16', text: 'Vilka anser Du är verksamhetens starkaste sidor?', type: 'TEXT', category: 'Helhetsbedömning', order: 16 },
    { code: 'L17', text: 'Vilka anser Du är verksamhetens svagaste sidor?', type: 'TEXT', category: 'Helhetsbedömning', order: 17 },
    { code: 'L18', text: 'Är det någon typ av tjänst eller kompetens som Du saknar hos den här verksamheten i samband med placeringar?', type: 'YESNO', category: 'Helhetsbedömning', order: 18 },
    { code: 'L19', text: 'Med utgångspunkt från Dina erfarenheter, vilket betyg mellan 1 och 10 skulle Du då ge verksamheten som en helhetsbedömning, där 1 = mycket dåligt och 10 = bästa tänkbara?', type: 'RATING', category: 'Helhetsbedömning', order: 19 },
    { code: 'L20', text: 'Övriga kommentarer och synpunkter.', type: 'LONGTEXT', category: 'Övriga kommentarer', order: 20 },
  ]

  await Promise.all(
    lssQuestions.map((q) =>
      prisma.surveyQuestion.create({
        data: {
          templateId: lssTemplate.id,
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

  console.log(`   ✓ Created LSS template with ${lssQuestions.length} questions`)

  // ==========================================
  // CREATE SURVEYS WITH RESPONSES
  // ==========================================
  console.log('📊 Creating surveys and sample responses...')

  // Helper function to generate realistic ratings
  const generateRating = (baseScore: number, variance: number = 2): number => {
    const value = baseScore + Math.floor(Math.random() * variance * 2) - variance
    return Math.max(1, Math.min(10, value))
  }

  // Get all questions for responses (using HVB template)
  const allQuestions = await prisma.surveyQuestion.findMany({
    where: { templateId: hvbTemplate.id },
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
          templateId: hvbTemplate.id,
          municipalityId: data.municipality.id,
          createdById: i % 2 === 0 ? adminUser.id : municipalityUser.id,
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
      { key: 'default_survey_template', value: hvbTemplate.id, category: 'SURVEY' },
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
  console.log('   Admin:        admin@healthcare-provider.se / admin123')
  console.log('   Municipality: municipality@healthcare-provider.se / municipality123')
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



