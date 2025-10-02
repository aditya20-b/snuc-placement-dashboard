'use client'

import { Building2 } from 'lucide-react'

interface TopRecruitersProps {
  recruiters: { company: string; count: number }[]
}

export function TopRecruiters({ recruiters }: TopRecruitersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Building2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top Recruiters
        </h2>
      </div>

      {recruiters.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No recruiters yet
        </p>
      ) : (
        <div className="space-y-3">
          {recruiters.map((recruiter, index) => (
            <div
              key={recruiter.company}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {recruiter.company}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {recruiter.count} {recruiter.count === 1 ? 'job' : 'jobs'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
