import { StatsCards } from '@/components/dashboard/stats-cards'
import { TopRecruiters } from '@/components/dashboard/top-recruiters'
import { CategoryStats } from '@/components/dashboard/category-stats'
import { HighestPaid } from '@/components/dashboard/highest-paid'
import { prisma } from '@/lib/db'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    // Directly query database instead of fetching API
    const [totalJobs, openJobs, allJobs] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'OPEN' } }),
      prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    ])

    // Calculate recent jobs (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentJobs = allJobs.filter(job => new Date(job.createdAt) >= sevenDaysAgo).length

    // Top recruiters
    const companyMap = new Map()
    allJobs.forEach(job => {
      const count = companyMap.get(job.company) || 0
      companyMap.set(job.company, count + 1)
    })
    const topRecruiters = Array.from(companyMap.entries())
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {}
    allJobs.forEach(job => {
      categoryBreakdown[job.category] = (categoryBreakdown[job.category] || 0) + 1
    })

    // Type breakdown
    const typeBreakdown: Record<string, number> = {}
    allJobs.forEach(job => {
      typeBreakdown[job.type] = (typeBreakdown[job.type] || 0) + 1
    })

    // Top paid jobs
    const topPaidJobs = allJobs
      .filter(job => job.ctc)
      .sort((a, b) => {
        const ctcA = parseFloat(a.ctc?.match(/(\d+(?:\.\d+)?)/)?.[1] || '0')
        const ctcB = parseFloat(b.ctc?.match(/(\d+(?:\.\d+)?)/)?.[1] || '0')
        return ctcB - ctcA
      })
      .slice(0, 5)
      .map(job => ({ company: job.company, ctc: job.ctc! }))

    // Count closed jobs
    const closedJobs = await prisma.job.count({ where: { status: 'CLOSED' } })

    return {
      totalJobs,
      openJobs,
      recentJobs,
      topRecruiters,
      categoryBreakdown,
      typeBreakdown,
      topPaidJobs,
      highestCTC: topPaidJobs[0]?.ctc || 'N/A',
      highestCTCCompany: topPaidJobs[0]?.company || 'N/A',
      closedJobs
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalJobs: 0,
      openJobs: 0,
      recentJobs: 0,
      topRecruiters: [],
      categoryBreakdown: {},
      typeBreakdown: {},
      topPaidJobs: [],
      highestCTC: 'N/A',
      highestCTCCompany: 'N/A',
      closedJobs: 0
    }
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome to your placement portal
        </p>
      </div>

      <div className="space-y-6">
        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryStats categoryBreakdown={stats.categoryBreakdown} />
          <HighestPaid jobs={stats.topPaidJobs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopRecruiters recruiters={stats.topRecruiters} />

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Highest CTC</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.highestCTC}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.highestCTCCompany}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Closed Positions</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.closedJobs}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
