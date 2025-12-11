import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET emails for a municipality
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const emails = await prisma.municipalityEmail.findMany({
      where: { municipalityId: id },
      orderBy: { email: 'asc' }
    })

    return NextResponse.json(emails)
  } catch (error) {
    console.error('Error fetching emails:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add emails to municipality (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check if municipality exists
    const municipality = await prisma.municipality.findUnique({
      where: { id }
    })

    if (!municipality) {
      return NextResponse.json({ error: 'Municipality not found' }, { status: 404 })
    }

    const body = await request.json()
    const { emails, replaceExisting = false } = body

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'No emails provided' }, { status: 400 })
    }

    // If replaceExisting is true, delete all existing emails first
    if (replaceExisting) {
      await prisma.municipalityEmail.deleteMany({
        where: { municipalityId: id }
      })
    }

    // Create email records, skip duplicates
    const results = await Promise.all(
      emails.map(async (email: string) => {
        try {
          return await prisma.municipalityEmail.upsert({
            where: {
              municipalityId_email: {
                municipalityId: id,
                email: email.toLowerCase().trim()
              }
            },
            update: {},
            create: {
              municipalityId: id,
              email: email.toLowerCase().trim()
            }
          })
        } catch (error) {
          console.error(`Error adding email ${email}:`, error)
          return null
        }
      })
    )

    const added = results.filter(r => r !== null).length

    // Get updated count
    const count = await prisma.municipalityEmail.count({
      where: { municipalityId: id }
    })

    return NextResponse.json({
      success: true,
      added,
      total: count
    })
  } catch (error) {
    console.error('Error adding emails:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove all emails from municipality (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await prisma.municipalityEmail.deleteMany({
      where: { municipalityId: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting emails:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
