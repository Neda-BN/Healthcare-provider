import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET all municipalities with email counts
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const municipalities = await prisma.municipality.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { emails: true, surveys: true, placements: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(municipalities)
  } catch (error) {
    console.error('Error fetching municipalities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new municipality (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, organizationNumber, businessType, contactEmail, contactPhone, address, city, postalCode, notes, frameworkAgreementStart, frameworkAgreementEnd } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Municipality name is required' }, { status: 400 })
    }

    const municipality = await prisma.municipality.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        organizationNumber: organizationNumber?.trim() || null,
        businessType: businessType?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        postalCode: postalCode?.trim() || null,
        notes: notes?.trim() || null,
        frameworkAgreementStart: frameworkAgreementStart ? new Date(frameworkAgreementStart) : null,
        frameworkAgreementEnd: frameworkAgreementEnd ? new Date(frameworkAgreementEnd) : null,
      },
      include: {
        _count: {
          select: { emails: true }
        }
      }
    })

    return NextResponse.json(municipality, { status: 201 })
  } catch (error) {
    console.error('Error creating municipality:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

