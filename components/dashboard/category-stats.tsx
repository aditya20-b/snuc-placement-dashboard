'use client'

import { Award, Star, Trophy, Briefcase } from 'lucide-react'

interface CategoryStatsProps {
  categoryBreakdown: Record<string, number>
}

const categoryConfig = {
  MARQUE: {
    label: 'Marque Offer',
    description: '20L CTC and above',
    icon: Trophy,
    color: 'bg-amber-500',
    textColor: 'text-amber-700 dark:text-amber-400'
  },
  SUPER_DREAM: {
    label: 'Super Dream Offer',
    description: '10L-20L CTC',
    icon: Star,
    color: 'bg-purple-500',
    textColor: 'text-purple-700 dark:text-purple-400'
  },
  DREAM: {
    label: 'Dream Offer',
    description: '6L-10L CTC',
    icon: Award,
    color: 'bg-blue-500',
    textColor: 'text-blue-700 dark:text-blue-400'
  },
  CORE: {
    label: 'Core Offer',
    description: '4L-6L CTC',
    icon: Briefcase,
    color: 'bg-green-500',
    textColor: 'text-green-700 dark:text-green-400'
  },
  REGULAR: {
    label: 'Regular Offer',
    description: '0-3.9L CTC',
    icon: Briefcase,
    color: 'bg-gray-500',
    textColor: 'text-gray-700 dark:text-gray-400'
  },
  OTHER: {
    label: 'Other',
    description: 'Unclassified',
    icon: Briefcase,
    color: 'bg-gray-400',
    textColor: 'text-gray-600 dark:text-gray-400'
  }
}

export function CategoryStats({ categoryBreakdown }: CategoryStatsProps) {
  const totalJobs = Object.values(categoryBreakdown).reduce((sum, count) => sum + count, 0)

  // Sort categories by predefined order
  const sortedCategories = ['MARQUE', 'SUPER_DREAM', 'DREAM', 'CORE', 'REGULAR', 'OTHER'].filter(
    (cat) => categoryBreakdown[cat]
  )

  if (totalJobs === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Categories
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No jobs available yet
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Categories
      </h2>

      <div className="space-y-3">
        {sortedCategories.map((category) => {
          const config = categoryConfig[category as keyof typeof categoryConfig]
          const count = categoryBreakdown[category]
          const Icon = config.icon
          const percentage = ((count / totalJobs) * 100).toFixed(1)

          return (
            <div
              key={category}
              className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600"
            >
              {/* Background progress bar */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700 dark:to-transparent"
                style={{ width: `${percentage}%` }}
              />

              {/* Content */}
              <div className="relative flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`${config.color} p-2 rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`font-medium ${config.textColor}`}>
                      {config.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {config.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {percentage}%
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Total Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Total Jobs
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {totalJobs}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
