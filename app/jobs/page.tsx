'use client'

import { useState, useEffect } from 'react'
import { JobsTable } from '@/components/jobs/jobs-table'
import { EnhancedJobModal } from '@/components/jobs/enhanced-job-modal'
import { JobsExportDropdown } from '@/components/jobs/jobs-export-dropdown'
import { JobType, JobCategory, JobStatus } from '@prisma/client'

interface Job {
  id: string
  company: string
  title: string
  type: JobType
  category: JobCategory
  status: JobStatus
  ctc?: string | null
  stipend?: string | null
  applyBy?: Date | null
  eligibility?: string | null
  location?: string | null
  link?: string | null
  description?: string | null
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs')
        if (!res.ok) throw new Error('Failed to fetch jobs')
        const data = await res.json()
        setJobs(data)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-500 dark:text-gray-400">Loading jobs...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Job Listings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse all available placement opportunities
          </p>
        </div>
        <JobsExportDropdown />
      </div>

      <JobsTable jobs={jobs} onJobClick={setSelectedJob} />

      {selectedJob && (
        <EnhancedJobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  )
}
