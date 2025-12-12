import { parseEmailReply, parseSurveyIdFromReplyAddress, generateReplyAddress } from '../email'

describe('Email Parsing Functions', () => {
  describe('generateReplyAddress', () => {
    it('should generate a valid reply address with survey ID', () => {
      const surveyId = '12345-abcde-67890'
      const address = generateReplyAddress(surveyId)
      expect(address).toContain('reply+12345-abcde-67890@')
    })
  })

  describe('parseSurveyIdFromReplyAddress', () => {
    it('should extract survey ID from reply address', () => {
      const address = 'reply+abc123-def456@healthcare-provider.demo'
      const surveyId = parseSurveyIdFromReplyAddress(address)
      expect(surveyId).toBe('abc123-def456')
    })

    it('should return null for invalid address', () => {
      const address = 'invalid@example.com'
      const surveyId = parseSurveyIdFromReplyAddress(address)
      expect(surveyId).toBeNull()
    })

    it('should handle UUID-formatted survey IDs', () => {
      const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      const address = `reply+${uuid}@domain.com`
      const surveyId = parseSurveyIdFromReplyAddress(address)
      expect(surveyId).toBe(uuid)
    })
  })

  describe('parseEmailReply', () => {
    it('should parse basic rating responses', () => {
      const body = `
Q3a: 8
Q4a: 9
Q4b: 7
Q5a: 10
      `
      const result = parseEmailReply(
        'sender@example.com',
        'reply+survey123@healthcare-provider.demo',
        'Re: Survey',
        body
      )

      expect(result.surveyId).toBe('survey123')
      expect(result.responses).toHaveLength(4)
      expect(result.responses[0]).toEqual({ questionCode: 'Q3A', value: 8, isNA: false })
      expect(result.responses[1]).toEqual({ questionCode: 'Q4A', value: 9, isNA: false })
      expect(result.responses[2]).toEqual({ questionCode: 'Q4B', value: 7, isNA: false })
      expect(result.responses[3]).toEqual({ questionCode: 'Q5A', value: 10, isNA: false })
    })

    it('should handle N/A responses', () => {
      const body = `
Q3a: N/A
Q4a: NA
Q5a: 8
      `
      const result = parseEmailReply(
        'sender@example.com',
        'reply+survey123@domain.com',
        'Re: Survey',
        body
      )

      expect(result.responses[0]).toEqual({ questionCode: 'Q3A', value: null, isNA: true })
      expect(result.responses[1]).toEqual({ questionCode: 'Q4A', value: null, isNA: true })
      expect(result.responses[2]).toEqual({ questionCode: 'Q5A', value: 8, isNA: false })
    })

    it('should handle different separators (: and =)', () => {
      const body = `
Q3a: 8
Q4a = 9
Q5a:7
      `
      const result = parseEmailReply(
        'sender@example.com',
        'reply+survey123@domain.com',
        'Re: Survey',
        body
      )

      expect(result.responses).toHaveLength(3)
      expect(result.responses[0].value).toBe(8)
      expect(result.responses[1].value).toBe(9)
      expect(result.responses[2].value).toBe(7)
    })

    it('should parse comment patterns', () => {
      const body = `
Q3a: 8
Kommentar: This is a test comment about the service.
      `
      const result = parseEmailReply(
        'sender@example.com',
        'reply+survey123@domain.com',
        'Re: Survey',
        body
      )

      expect(result.responses).toHaveLength(2)
      expect(result.responses[1]).toEqual({
        questionCode: 'GENERAL_COMMENT',
        value: 'This is a test comment about the service.',
        isNA: false,
      })
    })

    it('should capture free text that does not match patterns', () => {
      const body = `
Q3a: 8

Overall I'm very satisfied with the service.
The staff is professional and helpful.
      `
      const result = parseEmailReply(
        'sender@example.com',
        'reply+survey123@domain.com',
        'Re: Survey',
        body
      )

      expect(result.freeText).toContain('Overall I\'m very satisfied')
      expect(result.freeText).toContain('professional and helpful')
    })

    it('should ignore email artifacts', () => {
      const body = `
Q3a: 8

> On Dec 10, 2024, at 14:00, surveys@example.com wrote:
> Please complete this survey...

From: Someone
To: Someone else

This part should be captured as free text.
      `
      const result = parseEmailReply(
        'sender@example.com',
        'reply+survey123@domain.com',
        'Re: Survey',
        body
      )

      expect(result.freeText).not.toContain('wrote:')
      expect(result.freeText).not.toContain('From:')
      expect(result.freeText).toContain('This part should be captured')
    })

    it('should reject invalid ratings (out of range)', () => {
      const body = `
Q3a: 15
Q4a: 0
Q5a: 8
      `
      const result = parseEmailReply(
        'sender@example.com',
        'reply+survey123@domain.com',
        'Re: Survey',
        body
      )

      // Only Q5a should be parsed as a valid rating
      expect(result.responses).toHaveLength(1)
      expect(result.responses[0].value).toBe(8)
    })

    it('should store raw content', () => {
      const body = 'Q3a: 8\nSome other text'
      const result = parseEmailReply(
        'sender@example.com',
        'reply+survey123@domain.com',
        'Re: Survey',
        body
      )

      expect(result.rawContent).toBe(body)
    })

    it('should handle mixed case question codes', () => {
      const body = `
q3a: 8
Q4A: 9
q5A: 7
      `
      const result = parseEmailReply(
        'sender@example.com',
        'reply+survey123@domain.com',
        'Re: Survey',
        body
      )

      expect(result.responses).toHaveLength(3)
      expect(result.responses.map(r => r.questionCode)).toEqual(['Q3A', 'Q4A', 'Q5A'])
    })

    it('should extract survey ID from subject if not in To address', () => {
      const body = 'Q3a: 8'
      const result = parseEmailReply(
        'sender@example.com',
        'other@example.com',
        'Re: Survey - Enkät-ID: abc123-456',
        body
      )

      expect(result.surveyId).toBe('abc123-456')
    })
  })
})



