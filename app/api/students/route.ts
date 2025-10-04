import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/students - List all students with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const department = searchParams.get('department')
    const section = searchParams.get('section')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    if (department) {
      where.department = department
    }

    if (section) {
      where.section = section
    }

    if (status) {
      where.placementStatus = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        placements: {
          include: {
            job: {
              select: {
                company: true,
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            placements: true,
          },
        },
      },
      orderBy: [
        { department: 'asc' },
        { section: 'asc' },
        { rollNumber: 'asc' },
      ],
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// PUT /api/students - Bulk update (for future use)
export async function PUT(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const { studentIds, updates } = body

    if (!studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: 'studentIds array is required' },
        { status: 400 }
      )
    }

    // Bulk update
    await prisma.student.updateMany({
      where: {
        id: {
          in: studentIds,
        },
      },
      data: updates,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error bulk updating students:', error)
    return NextResponse.json(
      { error: 'Failed to update students' },
      { status: 500 }
    )
  }
}
