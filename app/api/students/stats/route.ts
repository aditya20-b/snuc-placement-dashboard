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

      // Placed students with details
      prisma.student.findMany({
        where: {
          placementStatus: {
            in: ['PLACED', 'PLACED_FINAL'],
          },
        },
        select: {
          department: true,
          finalPlacedCompany: true,
          finalPlacedCTC: true,
        },
      }),
    ])

    // Calculate placement percentage
    const placedCount = placedStudents.length
    const placementPercentage = totalStudents > 0
      ? ((placedCount / totalStudents) * 100).toFixed(2)
      : '0'

    // Group placed students by company
    const companyCounts: Record<string, number> = {}
    placedStudents.forEach(s => {
      if (s.finalPlacedCompany) {
        companyCounts[s.finalPlacedCompany] = (companyCounts[s.finalPlacedCompany] || 0) + 1
      }
    })

    const topRecruiters = Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

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
