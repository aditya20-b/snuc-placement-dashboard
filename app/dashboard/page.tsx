import { StatsCards } from '@/components/dashboard/stats-cards'
import { TopRecruiters } from '@/components/dashboard/top-recruiters'
import { CategoryStats } from '@/components/dashboard/category-stats'
import { HighestPaid } from '@/components/dashboard/highest-paid'

async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stats`, {
      cache: 'no-store'
    })
    if (!res.ok) throw new Error('Failed to fetch stats')
    return await res.json()
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalJobs: 0,
      openJobs: 0,
      recentJobs: 0,
      topRecruiters: [],
      categoryBreakdown: {},
      typeBreakdown: {},
      topPaidJobs: []
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
