// Survey Template Types for Sweden: HVB and LSS
// These are predefined survey templates based on Swedish care business models

export type SurveyType = 'HVB' | 'LSS' | 'CUSTOM'

export interface PredefinedQuestion {
  questionCode: string
  questionText: string
  questionType: 'RATING' | 'YESNO' | 'TEXT' | 'LONGTEXT'
  category: string
  required: boolean
  minValue?: number
  maxValue?: number
}

// HVB (Hem för vård eller boende) - Homes for care or living
// Used for residential care homes for children, youth, and adults
export const HVB_QUESTIONS: PredefinedQuestion[] = [
  // Category: Interview Information
  {
    questionCode: 'Q1',
    questionText: 'Är aktuell placering pågående i verksamheten just nu?',
    questionType: 'TEXT',
    category: 'Kommentar om intervjun',
    required: true,
  },
  {
    questionCode: 'Q2',
    questionText: 'Vilken typ av placering gäller det (familj, vuxen, barn, par, förälder och barn, akutplacering, behandling, utredning, vård etc.)?',
    questionType: 'TEXT',
    category: 'Kommentar om intervjun',
    required: true,
  },
  // Category: Information and Reception
  {
    questionCode: 'Q3a',
    questionText: 'Om Du fick betygsätta den information som ni fick om verksamheten, innan ert beslut om placering, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Information och mottagande',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'Q3b',
    questionText: 'Hur fick du kännedom om verksamheten (placeringsservice, kollega, broschyr, utskick etc.)?',
    questionType: 'TEXT',
    category: 'Information och mottagande',
    required: true,
  },
  {
    questionCode: 'Q4',
    questionText: 'Om Du fick betygsätta mottagande och introduktion av er klient, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Information och mottagande',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  // Category: Care Quality
  {
    questionCode: 'Q5',
    questionText: 'Om Du fick betygsätta verksamhetens arbete kring klientens genomförandeplan (upprättande, revideringar, arbetet enligt denna plan etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Vårdkvalitet',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'Q6',
    questionText: 'Om Du fick betygsätta verksamhetens omvårdnadsinsatser gentemot klienten (kost, logi, dagliga rutiner etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Vårdkvalitet',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'Q7',
    questionText: 'Om Du fick betygsätta verksamhetens arbete med att motivera klienten till samverkan enligt den individuellt upprättade behandlingsplanen, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Vårdkvalitet',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'Q8',
    questionText: 'Om Du fick betygsätta verksamhetens sociala kontroll av klienten (kontroll av destruktivt beteende, kriminalitet, missbruk och begränsning av rörelsefrihet), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Vårdkvalitet',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  // Category: Activities
  {
    questionCode: 'Q9',
    questionText: 'Om Du fick betygsätta möjligheten till arbete och studier för klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Aktiviteter',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'Q10',
    questionText: 'Om Du fick betygsätta möjligheten till fritidsaktiviteter för klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Aktiviteter',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  // Category: Family Relations
  {
    questionCode: 'Q11',
    questionText: 'Om Du fick betygsätta verksamhetens arbete med klientens föräldrar/anhöriga (anhörigboende, umgängesmöjligheter och övrig kontakt), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Anhörigkontakt',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  // Category: Follow-up
  {
    questionCode: 'Q12',
    questionText: 'Om Du fick betygsätta uppföljning och rapportering kring klienten från verksamhetens sida (regelbundna möten, muntlig information, skriftliga rapporter etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Uppföljning',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'Q13',
    questionText: 'Om Du fick betygsätta verksamhetens planering och genomförande av utslussning av klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Uppföljning',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  // Category: Overall Assessment
  {
    questionCode: 'Q14',
    questionText: 'Om Du fick betygsätta denna placering ifråga om hur väl den passade/matchade klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Helhetsbedömning',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'Q15',
    questionText: 'Skulle Du i ett liknande ärende rekommendera en placering inom samma verksamhet?',
    questionType: 'YESNO',
    category: 'Helhetsbedömning',
    required: true,
  },
  {
    questionCode: 'Q16',
    questionText: 'Vilka anser Du är verksamhetens starkaste sidor?',
    questionType: 'TEXT',
    category: 'Helhetsbedömning',
    required: true,
  },
  {
    questionCode: 'Q17',
    questionText: 'Vilka anser Du är verksamhetens svagaste sidor?',
    questionType: 'TEXT',
    category: 'Helhetsbedömning',
    required: true,
  },
  {
    questionCode: 'Q18',
    questionText: 'Är det någon typ av tjänst eller kompetens som Du saknar hos den här verksamheten i samband med placeringar?',
    questionType: 'YESNO',
    category: 'Helhetsbedömning',
    required: true,
  },
  {
    questionCode: 'Q19',
    questionText: 'Med utgångspunkt från Dina erfarenheter, vilket betyg mellan 1 och 10 skulle Du då ge verksamheten som en helhetsbedömning, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Helhetsbedömning',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'Q20',
    questionText: 'Övriga kommentarer och synpunkter.',
    questionType: 'LONGTEXT',
    category: 'Övriga kommentarer',
    required: false,
  },
]

// LSS (Lagen om stöd och service till vissa funktionshindrade)
// Law on support and service for certain people with disabilities
// Note: LSS surveys use the same standardized questions as HVB surveys
export const LSS_QUESTIONS: PredefinedQuestion[] = [
  // Category: Interview Information
  {
    questionCode: 'L1',
    questionText: 'Är aktuell placering pågående i verksamheten just nu?',
    questionType: 'TEXT',
    category: 'Kommentar om intervjun',
    required: true,
  },
  {
    questionCode: 'L2',
    questionText: 'Vilken typ av placering gäller det (familj, vuxen, barn, par, förälder och barn, akutplacering, behandling, utredning, vård etc.)?',
    questionType: 'TEXT',
    category: 'Kommentar om intervjun',
    required: true,
  },
  // Category: Information and Reception
  {
    questionCode: 'L3a',
    questionText: 'Om Du fick betygsätta den information som ni fick om verksamheten, innan ert beslut om placering, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Information och mottagande',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'L3b',
    questionText: 'Hur fick du kännedom om verksamheten (placeringsservice, kollega, broschyr, utskick etc.)?',
    questionType: 'TEXT',
    category: 'Information och mottagande',
    required: true,
  },
  {
    questionCode: 'L4',
    questionText: 'Om Du fick betygsätta mottagande och introduktion av er klient, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Information och mottagande',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  // Category: Care Quality
  {
    questionCode: 'L5',
    questionText: 'Om Du fick betygsätta verksamhetens arbete kring klientens genomförandeplan (upprättande, revideringar, arbetet enligt denna plan etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Vårdkvalitet',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'L6',
    questionText: 'Om Du fick betygsätta verksamhetens omvårdnadsinsatser gentemot klienten (kost, logi, dagliga rutiner etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Vårdkvalitet',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'L7',
    questionText: 'Om Du fick betygsätta verksamhetens arbete med att motivera klienten till samverkan enligt den individuellt upprättade behandlingsplanen, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Vårdkvalitet',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'L8',
    questionText: 'Om Du fick betygsätta verksamhetens sociala kontroll av klienten (kontroll av destruktivt beteende, kriminalitet, missbruk och begränsning av rörelsefrihet), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Vårdkvalitet',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  // Category: Activities
  {
    questionCode: 'L9',
    questionText: 'Om Du fick betygsätta möjligheten till arbete och studier för klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Aktiviteter',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'L10',
    questionText: 'Om Du fick betygsätta möjligheten till fritidsaktiviteter för klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Aktiviteter',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  // Category: Family Relations
  {
    questionCode: 'L11',
    questionText: 'Om Du fick betygsätta verksamhetens arbete med klientens föräldrar/anhöriga (anhörigboende, umgängesmöjligheter och övrig kontakt), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Anhörigkontakt',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  // Category: Follow-up
  {
    questionCode: 'L12',
    questionText: 'Om Du fick betygsätta uppföljning och rapportering kring klienten från verksamhetens sida (regelbundna möten, muntlig information, skriftliga rapporter etc.), vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Uppföljning',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'L13',
    questionText: 'Om Du fick betygsätta verksamhetens planering och genomförande av utslussning av klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Uppföljning',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  // Category: Overall Assessment
  {
    questionCode: 'L14',
    questionText: 'Om Du fick betygsätta denna placering ifråga om hur väl den passade/matchade klienten, vilket betyg mellan 1 och 10 skulle Du då sätta, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Helhetsbedömning',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'L15',
    questionText: 'Skulle Du i ett liknande ärende rekommendera en placering inom samma verksamhet?',
    questionType: 'YESNO',
    category: 'Helhetsbedömning',
    required: true,
  },
  {
    questionCode: 'L16',
    questionText: 'Vilka anser Du är verksamhetens starkaste sidor?',
    questionType: 'TEXT',
    category: 'Helhetsbedömning',
    required: true,
  },
  {
    questionCode: 'L17',
    questionText: 'Vilka anser Du är verksamhetens svagaste sidor?',
    questionType: 'TEXT',
    category: 'Helhetsbedömning',
    required: true,
  },
  {
    questionCode: 'L18',
    questionText: 'Är det någon typ av tjänst eller kompetens som Du saknar hos den här verksamheten i samband med placeringar?',
    questionType: 'YESNO',
    category: 'Helhetsbedömning',
    required: true,
  },
  {
    questionCode: 'L19',
    questionText: 'Med utgångspunkt från Dina erfarenheter, vilket betyg mellan 1 och 10 skulle Du då ge verksamheten som en helhetsbedömning, där 1 = mycket dåligt och 10 = bästa tänkbara?',
    questionType: 'RATING',
    category: 'Helhetsbedömning',
    required: true,
    minValue: 1,
    maxValue: 10,
  },
  {
    questionCode: 'L20',
    questionText: 'Övriga kommentarer och synpunkter.',
    questionType: 'LONGTEXT',
    category: 'Övriga kommentarer',
    required: false,
  },
]

// Get questions by survey type
export function getQuestionsForType(type: SurveyType): PredefinedQuestion[] {
  switch (type) {
    case 'HVB':
      return HVB_QUESTIONS
    case 'LSS':
      return LSS_QUESTIONS
    case 'CUSTOM':
    default:
      return []
  }
}

// Survey type labels and descriptions
export const SURVEY_TYPE_INFO = {
  CUSTOM: {
    label: 'Skapa manuellt',
    labelEn: 'Create Manually',
    description: 'Börja från början och lägg till egna frågor',
    descriptionEn: 'Start from scratch and add your own questions',
    icon: 'edit',
    color: 'gray',
  },
  HVB: {
    label: 'HVB-enkät',
    labelEn: 'HVB Survey',
    description: 'Hem för vård eller boende - 20 fördefinierade frågor',
    descriptionEn: 'Homes for care or living - 20 predefined questions',
    icon: 'home',
    color: 'blue',
    questionCount: HVB_QUESTIONS.length,
  },
  LSS: {
    label: 'LSS-enkät',
    labelEn: 'LSS Survey',
    description: 'Lagen om stöd och service - 21 fördefinierade frågor',
    descriptionEn: 'Support and service law - 21 predefined questions',
    icon: 'users',
    color: 'green',
    questionCount: LSS_QUESTIONS.length,
  },
}

