import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/students - List all students with optional filters
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication to access student PII
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const department = searchParams.get('department')
    const section = searchParams.get('section')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

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

    // Get total count for pagination metadata
    const totalCount = await prisma.student.count({ where })

    const students = await prisma.student.findMany({
      where,
      skip,
      take: limit,
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

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + students.length < totalCount,
      },
    })
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

    // SECURITY: Whitelist allowed fields to prevent mass assignment
    const allowedFields = ['email', 'mobile', 'cgpa', 'currentArrears', 'historyOfArrears']
    const sanitizedUpdates: any = {}

    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.includes(key)) {
        return NextResponse.json(
          { error: `Field '${key}' cannot be bulk updated. Allowed fields: ${allowedFields.join(', ')}` },
          { status: 400 }
        )
      }
      sanitizedUpdates[key] = value
    }

    // SECURITY: Limit number of students to prevent resource exhaustion
    if (studentIds.length > 100) {
      return NextResponse.json(
        { error: 'Cannot update more than 100 students at once' },
        { status: 400 }
      )
    }

    // Bulk update with sanitized data
    await prisma.student.updateMany({
      where: {
        id: {
          in: studentIds,
        },
      },
      data: sanitizedUpdates,
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
