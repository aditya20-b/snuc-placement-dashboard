import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/students/[id] - Get single student with all placements
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        placements: {
          include: {
            job: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    )
  }
}

// PUT /api/students/[id] - Update student details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const {
      email,
      mobile,
      cgpa,
      currentArrears,
      historyOfArrears,
      placementStatus,
      canSitForMore,
      finalPlacedCompany,
      finalPlacedJobTitle,
      finalPlacedCTC,
      finalPlacedJobType,
      finalPlacedDate,
    } = body

    const student = await prisma.student.update({
      where: { id },
      data: {
        email: email || null,
        mobile: mobile || null,
        cgpa: cgpa ? parseFloat(cgpa) : null,
        currentArrears: currentArrears !== undefined ? parseInt(currentArrears) : undefined,
        historyOfArrears: historyOfArrears || null,
        placementStatus: placementStatus || undefined,
        canSitForMore: canSitForMore !== undefined ? canSitForMore : undefined,
        finalPlacedCompany: finalPlacedCompany || null,
        finalPlacedJobTitle: finalPlacedJobTitle || null,
        finalPlacedCTC: finalPlacedCTC || null,
        finalPlacedJobType: finalPlacedJobType || null,
        finalPlacedDate: finalPlacedDate ? new Date(finalPlacedDate) : null,
      },
      include: {
        placements: {
          include: {
            job: true,
          },
        },
      },
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}
