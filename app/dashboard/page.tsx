import { prisma } from '@/lib/db'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    // Single Promise.all for ALL queries - maximum parallelization
    const [
      totalJobs,
      openJobs,
      closedJobs,
      jobsForCategoryAndTopPaid,
      studentStats,
      topCompanies,
      placedStudents,
      recentJobsCount
    ] = await Promise.all([
      // Job counts
      prisma.job.count(),
      prisma.job.count({ where: { status: 'OPEN' } }),
      prisma.job.count({ where: { status: 'CLOSED' } }),

      // Jobs for category breakdown and top paid (single query with select)
      prisma.job.findMany({
        select: {
          category: true,
          ctc: true,
          company: true,
          title: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Student placement count
      prisma.student.aggregate({
        where: {
          placementStatus: { in: ['PLACED', 'PLACED_FINAL'] },
          finalPlacedCTC: { not: null }
        },
        _count: true,
      }),

      // Top hiring companies using groupBy (much faster than fetching all and counting)
      prisma.student.groupBy({
        by: ['finalPlacedCompany'],
        where: {
          placementStatus: { in: ['PLACED', 'PLACED_FINAL'] },
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

      // Placed students for CTC calculations (only fetch needed fields)
      prisma.student.findMany({
        where: {
          placementStatus: { in: ['PLACED', 'PLACED_FINAL'] },
          finalPlacedCTC: { not: null }
        },
        select: {
          finalPlacedCTC: true,
          finalPlacedCompany: true
        },
        orderBy: { finalPlacedDate: 'desc' }
      }),

      // Recent jobs count (last 30 days)
      prisma.job.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Use the jobs data for multiple purposes
    const allJobs = jobsForCategoryAndTopPaid

    // Calculate average CTC for different segments
    const calculateAvgCTC = (students: typeof placedStudents) => {
      if (students.length === 0) return 0
      const ctcs = students.map(s => {
        const match = s.finalPlacedCTC?.match(/(\d+(?:\.\d+)?)/)
        return match ? parseFloat(match[1]) : 0
      }).filter(c => c > 0)
      return ctcs.length > 0 ? ctcs.reduce((a, b) => a + b, 0) / ctcs.length : 0
    }

    const avgCTCTop50 = calculateAvgCTC(placedStudents.slice(0, 50))
    const avgCTCTop100 = calculateAvgCTC(placedStudents.slice(0, 100))
    const avgCTCTop150 = calculateAvgCTC(placedStudents.slice(0, 150))
    const avgCTCAll = calculateAvgCTC(placedStudents)

    // Category breakdown with counts and percentages
    const categoryMap = new Map<string, number>()
    allJobs.forEach(job => {
      categoryMap.set(job.category, (categoryMap.get(job.category) || 0) + 1)
    })
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalJobs > 0 ? (count / totalJobs) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)

    // Top paid jobs/companies
    const topPaidJobs = allJobs
      .filter(job => job.ctc)
      .sort((a, b) => {
        const ctcA = parseFloat(a.ctc?.match(/(\d+(?:\.\d+)?)/)?.[1] || '0')
        const ctcB = parseFloat(b.ctc?.match(/(\d+(?:\.\d+)?)/)?.[1] || '0')
        return ctcB - ctcA
      })
      .slice(0, 10)
      .map(job => ({ company: job.company, ctc: job.ctc!, title: job.title }))

    // Format top companies with student placement counts (from groupBy)
    const topHiringCompanies = topCompanies.map(c => ({
      company: c.finalPlacedCompany!,
      count: c._count
    }))

    return {
      totalJobs,
      openJobs,
      closedJobs,
      recentJobs: recentJobsCount,
      categoryBreakdown,
      topPaidJobs,
      topHiringCompanies,
      studentStats: {
        totalPlaced: studentStats._count,
        avgCTCTop50,
        avgCTCTop100,
        avgCTCTop150,
        avgCTCAll,
      },
      highestCTC: topPaidJobs[0]?.ctc || 'N/A',
      highestCTCCompany: topPaidJobs[0]?.company || 'N/A',
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalJobs: 0,
      openJobs: 0,
      closedJobs: 0,
      recentJobs: 0,
      categoryBreakdown: [],
      topPaidJobs: [],
      topHiringCompanies: [],
      studentStats: {
        totalPlaced: 0,
        avgCTCTop50: 0,
        avgCTCTop100: 0,
        avgCTCTop150: 0,
        avgCTCAll: 0,
      },
      highestCTC: 'N/A',
      highestCTCCompany: 'N/A',
    }
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      SUPER_DREAM: 'Super Dream (10L-20L)',
      DREAM: 'Dream (6L-10L)',
      CORE: 'Core',
      OTHER: 'Other'
    }
    return labels[category] || category
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Welcome to your placement portal
        </p>
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Total Jobs</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalJobs}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Open Positions</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.openJobs}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Students Placed</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.studentStats.totalPlaced}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Closed Positions</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.closedJobs}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Top Hiring Companies */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Top Hiring Companies
          </h2>
          <div className="space-y-1 mb-3">
            {stats.topHiringCompanies.slice(0, 8).map((company, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {company.company}
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {company.count} {company.count === 1 ? 'student' : 'students'}
                </span>
              </div>
            ))}
          </div>
          {stats.topHiringCompanies.length > 0 && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Total Companies</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.topHiringCompanies.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Placements</span>
                <span className="text-sm font-bold text-blue-900 dark:text-blue-200">
                  {stats.topHiringCompanies.reduce((sum, c) => sum + c.count, 0)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Student Average CTC */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Students Avg CTC
          </h2>
          <div className="space-y-2">
            {stats.studentStats.avgCTCTop50 > 0 && (
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Top 50</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.studentStats.avgCTCTop50.toFixed(2)} L
                </span>
              </div>
            )}
            {stats.studentStats.avgCTCTop100 > 0 && (
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Top 100</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.studentStats.avgCTCTop100.toFixed(2)} L
                </span>
              </div>
            )}
            {stats.studentStats.avgCTCTop150 > 0 && (
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Top 150</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.studentStats.avgCTCTop150.toFixed(2)} L
                </span>
              </div>
            )}
            {stats.studentStats.avgCTCAll > 0 && (
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Overall Average</span>
                <span className="text-sm font-bold text-blue-900 dark:text-blue-200">
                  {stats.studentStats.avgCTCAll.toFixed(2)} L
                </span>
              </div>
            )}
            {stats.studentStats.totalPlaced === 0 && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p className="text-xs">No placement data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Categories
          </h2>
          <div className="space-y-2">
            {stats.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {getCategoryLabel(cat.category)}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-0.5">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-1 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-3 text-right">
                  <p className="text-base font-bold text-gray-900 dark:text-white">{cat.count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{cat.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Total Jobs</span>
                <span className="text-base font-bold text-gray-900 dark:text-white">{stats.totalJobs}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Highest Paid Ever */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="text-green-600 dark:text-green-400 mr-1.5">↗</span>
            Highest Paid Ever
          </h2>
          <div className="space-y-1">
            {stats.topPaidJobs.slice(0, 8).map((job, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-5">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {job.company}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {job.title}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-600 dark:text-green-400 whitespace-nowrap ml-2">
                  {job.ctc}
                </span>
              </div>
            ))}
            {stats.topPaidJobs.length > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  Highest: <span className="font-bold text-green-600 dark:text-green-400">{stats.highestCTC}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
