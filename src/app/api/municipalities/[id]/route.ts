import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET single municipality with emails
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

    const municipality = await prisma.municipality.findUnique({
      where: { id },
      include: {
        emails: {
          orderBy: { email: 'asc' }
        },
        _count: {
          select: { emails: true, surveys: true, placements: true }
        }
      }
    })

    if (!municipality) {
      return NextResponse.json({ error: 'Municipality not found' }, { status: 404 })
    }

    return NextResponse.json(municipality)
  } catch (error) {
    console.error('Error fetching municipality:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update municipality (Admin only)
export async function PUT(
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

    const body = await request.json()
    const { name, description, organizationNumber, contactEmail, contactPhone, address, city, postalCode, notes, active } = body

    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: 'Municipality name cannot be empty' }, { status: 400 })
    }

    const municipality = await prisma.municipality.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(organizationNumber !== undefined && { organizationNumber: organizationNumber?.trim() || null }),
        ...(contactEmail !== undefined && { contactEmail: contactEmail?.trim() || null }),
        ...(contactPhone !== undefined && { contactPhone: contactPhone?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(city !== undefined && { city: city?.trim() || null }),
        ...(postalCode !== undefined && { postalCode: postalCode?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(active !== undefined && { active }),
      },
      include: {
        _count: {
          select: { emails: true }
        }
      }
    })

    return NextResponse.json(municipality)
  } catch (error) {
    console.error('Error updating municipality:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Soft delete municipality (Admin only)
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

    // Soft delete
    await prisma.municipality.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting municipality:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
