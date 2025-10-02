'use client'

import { TrendingUp, DollarSign } from 'lucide-react'

interface HighestPaidProps {
  jobs: Array<{
    company: string
    ctc: string
  }>
}

export function HighestPaid({ jobs }: HighestPaidProps) {
  // Sort jobs by CTC (extract numeric value)
  const sortedJobs = jobs
    .filter(job => job.ctc)
    .map(job => {
      // Extract numeric value from CTC string (e.g., "19.17 LPA" -> 19.17)
      const ctcMatch = job.ctc!.match(/(\d+\.?\d*)/)
      const ctcValue = ctcMatch ? parseFloat(ctcMatch[1]) : 0
      return { ...job, ctcValue }
    })
    .sort((a, b) => b.ctcValue - a.ctcValue)
    .slice(0, 5) // Top 5

  if (sortedJobs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Highest Paid Ever
          </h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No salary data available yet
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Highest Paid Ever
        </h2>
      </div>

      <div className="space-y-3">
        {sortedJobs.map((job, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === 0
                ? 'bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/20 border border-amber-200 dark:border-amber-800'
                : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {index === 0 && (
                <div className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  👑
                </div>
              )}
              {index > 0 && (
                <div className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              )}
              <div>
                <p className={`font-semibold ${
                  index === 0
                    ? 'text-amber-900 dark:text-amber-100'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {job.company}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Placement Offer
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1">
                <DollarSign className={`w-4 h-4 ${
                  index === 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-green-600 dark:text-green-400'
                }`} />
                <span className={`text-lg font-bold ${
                  index === 0
                    ? 'text-amber-900 dark:text-amber-100'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {job.ctc}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedJobs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Highest: </span>
            <span className="text-green-600 dark:text-green-400 font-bold">
              {sortedJobs[0].ctc}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
