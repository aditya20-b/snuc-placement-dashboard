import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const jobs = await prisma.job.findMany()

    // Calculate total jobs by status
    const totalJobs = jobs.length
    const openJobs = jobs.filter(j => j.status === 'OPEN').length
    const closedJobs = jobs.filter(j => j.status === 'CLOSED').length

    // Calculate top recruiters (companies with most jobs)
    const recruiterCounts = jobs.reduce((acc, job) => {
      acc[job.company] = (acc[job.company] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topRecruiters = Object.entries(recruiterCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate jobs by category
    const categoryBreakdown = jobs.reduce((acc, job) => {
      acc[job.category] = (acc[job.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate jobs by type
    const typeBreakdown = jobs.reduce((acc, job) => {
      acc[job.type] = (acc[job.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Find highest CTC jobs
    const jobsWithCTC = jobs
      .filter(j => j.ctc)
      .map(j => ({ company: j.company, ctc: j.ctc! }))

    const highestCTCJob = jobsWithCTC.length > 0 ? jobsWithCTC[0] : null

    // Calculate recent jobs (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentJobs = jobs.filter(j => j.createdAt >= thirtyDaysAgo).length

    return NextResponse.json({
      totalJobs,
      openJobs,
      closedJobs,
      recentJobs,
      topRecruiters,
      categoryBreakdown,
      typeBreakdown,
      highestCTC: highestCTCJob?.ctc || 'N/A',
      highestCTCCompany: highestCTCJob?.company || 'N/A',
      topPaidJobs: jobsWithCTC
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
