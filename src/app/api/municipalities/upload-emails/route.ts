import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Extract valid emails from text content
function extractEmails(content: string): string[] {
  const emails: Set<string> = new Set()
  
  // Split by common delimiters (newlines, commas, semicolons, tabs, spaces)
  const parts = content.split(/[\n\r,;\t\s]+/)
  
  for (const part of parts) {
    const trimmed = part.trim().toLowerCase()
    if (trimmed && EMAIL_REGEX.test(trimmed)) {
      emails.add(trimmed)
    }
  }
  
  return Array.from(emails).sort()
}

// Parse CSV file
function parseCSV(content: string): string[] {
  const emails: Set<string> = new Set()
  
  const result = Papa.parse(content, {
    header: false,
    skipEmptyLines: true,
  })
  
  for (const row of result.data as string[][]) {
    for (const cell of row) {
      if (cell && typeof cell === 'string') {
        const trimmed = cell.trim().toLowerCase()
        if (EMAIL_REGEX.test(trimmed)) {
          emails.add(trimmed)
        }
      }
    }
  }
  
  return Array.from(emails).sort()
}

// Parse XLSX file
function parseXLSX(buffer: ArrayBuffer): string[] {
  const emails: Set<string> = new Set()
  
  const workbook = XLSX.read(buffer, { type: 'array' })
  
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]
    
    for (const row of data) {
      for (const cell of row) {
        if (cell && typeof cell === 'string') {
          const trimmed = cell.trim().toLowerCase()
          if (EMAIL_REGEX.test(trimmed)) {
            emails.add(trimmed)
          }
        }
      }
    }
  }
  
  return Array.from(emails).sort()
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    const fileSize = file.size
    
    // Check file size (max 5MB)
    if (fileSize > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 })
    }

    let emails: string[] = []

    if (fileName.endsWith('.csv')) {
      const content = await file.text()
      emails = parseCSV(content)
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const buffer = await file.arrayBuffer()
      emails = parseXLSX(buffer)
    } else if (fileName.endsWith('.txt')) {
      const content = await file.text()
      emails = extractEmails(content)
    } else {
      return NextResponse.json({ 
        error: 'Unsupported file format. Please use CSV, XLSX, or TXT files.' 
      }, { status: 400 })
    }

    if (emails.length === 0) {
      return NextResponse.json({ 
        error: 'No valid email addresses found in the file',
        emails: [],
        count: 0
      }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      emails,
      count: emails.length,
      fileName: file.name,
      fileSize
    })
  } catch (error) {
    console.error('Error parsing file:', error)
    return NextResponse.json({ error: 'Error parsing file' }, { status: 500 })
  }
}
