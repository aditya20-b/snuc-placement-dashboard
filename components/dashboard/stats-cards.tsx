'use client'

import { Briefcase, TrendingUp, Building2, Calendar } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalJobs: number
    openJobs: number
    recentJobs: number
    topRecruiters: { company: string; count: number }[]
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'bg-blue-500'
    },
    {
      title: 'Open Positions',
      value: stats.openJobs,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Recent Postings',
      value: stats.recentJobs,
      description: 'Last 30 days',
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      title: 'Active Recruiters',
      value: stats.topRecruiters.length,
      icon: Building2,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {card.value}
                </p>
                {card.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {card.description}
                  </p>
                )}
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
