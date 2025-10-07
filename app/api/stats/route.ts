import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Use parallel queries for better performance
    const [
      totalJobs,
      openJobs,
      closedJobs,
      categoryBreakdown,
      typeBreakdown,
      topRecruiters,
      topPaidJobs,
      recentJobsCount
    ] = await Promise.all([
      // Total jobs count
      prisma.job.count(),

      // Open jobs count
      prisma.job.count({ where: { status: 'OPEN' } }),

      // Closed jobs count
      prisma.job.count({ where: { status: 'CLOSED' } }),

      // Jobs by category
      prisma.job.groupBy({
        by: ['category'],
        _count: true,
      }),

      // Jobs by type
      prisma.job.groupBy({
        by: ['type'],
        _count: true,
      }),

      // Top recruiters (companies with most jobs)
      prisma.job.groupBy({
        by: ['company'],
        _count: true,
        orderBy: {
          _count: {
            company: 'desc'
          }
        },
        take: 10
      }),

      // Top paid jobs (limit to top 10 to avoid large response)
      prisma.job.findMany({
        where: {
          ctc: { not: null }
        },
        select: {
          company: true,
          ctc: true,
          title: true
        },
        orderBy: {
          ctc: 'desc'
        },
        take: 10
      }),

      // Recent jobs (last 30 days)
      prisma.job.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Transform groupBy results to the expected format
    const categoryBreakdownFormatted = categoryBreakdown.reduce((acc, item) => {
      acc[item.category] = item._count
      return acc
    }, {} as Record<string, number>)

    const typeBreakdownFormatted = typeBreakdown.reduce((acc, item) => {
      acc[item.type] = item._count
      return acc
    }, {} as Record<string, number>)

    const topRecruitersFormatted = topRecruiters.map(item => ({
      company: item.company,
      count: item._count
    }))

    const highestCTCJob = topPaidJobs.length > 0 ? topPaidJobs[0] : null

    return NextResponse.json({
      totalJobs,
      openJobs,
      closedJobs,
      recentJobs: recentJobsCount,
      topRecruiters: topRecruitersFormatted,
      categoryBreakdown: categoryBreakdownFormatted,
      typeBreakdown: typeBreakdownFormatted,
      highestCTC: highestCTCJob?.ctc || 'N/A',
      highestCTCCompany: highestCTCJob?.company || 'N/A',
      topPaidJobs: topPaidJobs.map(j => ({ company: j.company, ctc: j.ctc! }))
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
