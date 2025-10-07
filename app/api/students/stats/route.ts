import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalStudents,
      placementStatusBreakdown,
      departmentBreakdown,
      avgCGPAByDepartment,
      placedStudents,
    ] = await Promise.all([
      // Total students
      prisma.student.count(),

      // Students by placement status
      prisma.student.groupBy({
        by: ['placementStatus'],
        _count: true,
      }),

      // Students by department
      prisma.student.groupBy({
        by: ['department'],
        _count: true,
      }),

      // Average CGPA by department
      prisma.student.groupBy({
        by: ['department'],
        _avg: {
          cgpa: true,
        },
      }),

      // Top recruiters using groupBy (much faster than fetching all)
      prisma.student.groupBy({
        by: ['finalPlacedCompany'],
        where: {
          placementStatus: {
            in: ['PLACED', 'PLACED_FINAL'],
          },
          finalPlacedCompany: { not: null }
        },
        _count: true,
        orderBy: {
          _count: {
            finalPlacedCompany: 'desc'
          }
        },
        take: 10
      }),
    ])

    // Calculate placement percentage
    const placedCount = placementStatusBreakdown
      .filter(item => item.placementStatus === 'PLACED' || item.placementStatus === 'PLACED_FINAL')
      .reduce((sum, item) => sum + item._count, 0)

    const placementPercentage = totalStudents > 0
      ? ((placedCount / totalStudents) * 100).toFixed(2)
      : '0'

    // Format top recruiters from groupBy
    const topRecruiters = placedStudents.map(item => ({
      company: item.finalPlacedCompany!,
      count: item._count
    }))

    return NextResponse.json({
      totalStudents,
      placedCount,
      placementPercentage,
      placementStatusBreakdown: placementStatusBreakdown.map(item => ({
        status: item.placementStatus,
        count: item._count,
      })),
      departmentBreakdown: departmentBreakdown.map(item => ({
        department: item.department,
        count: item._count,
      })),
      avgCGPAByDepartment: avgCGPAByDepartment.map(item => ({
        department: item.department,
        avgCGPA: item._avg.cgpa ? item._avg.cgpa.toFixed(3) : 'N/A',
      })),
      topRecruiters,
    })
  } catch (error) {
    console.error('Error fetching student stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
