'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { JobType, JobCategory, JobStatus } from '@prisma/client'
import { getJobStatusColor, getJobStatusLabel } from '@/lib/utils'

interface WorkflowStage {
  id: string
  stageName: string
  stageType: string
  orderIndex: number
  description?: string | null
}

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
  eligibilityBranches?: string | null
  location?: string | null
  link?: string | null
  description?: string | null
  aboutCompany?: string | null
  workflowStages?: WorkflowStage[]
}

interface JobsTableProps {
  jobs: Job[]
  onJobClick?: (job: Job) => void
}

export function JobsTable({ jobs, onJobClick }: JobsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'ALL'>('ALL')
  const [typeFilter, setTypeFilter] = useState<JobType | 'ALL'>('ALL')

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter
    const matchesType = typeFilter === 'ALL' || job.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search company or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'ALL')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="APPLICATIONS_CLOSED">Applications Closed</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as JobType | 'ALL')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">All Types</option>
          <option value="SUMMER_INTERN">Summer Intern</option>
          <option value="REGULAR_INTERN">Regular Intern</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="FTE">Full Time</option>
          <option value="INTERN_PLUS_FTE">Intern + Full Time</option>
          <option value="INTERN_LEADS_TO_FTE">Intern Leads to FTE</option>
          <option value="BOTH">Both</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  CTC/Stipend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Apply By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => onJobClick?.(job)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {job.company}
                      </div>
                      {job.location && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {job.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-gray-900 dark:text-white">{job.title}</div>
                        {job.workflowStages && job.workflowStages.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" title="Hiring process details available">
                            {job.workflowStages.length} rounds
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {job.type === 'SUMMER_INTERN' ? 'Summer Intern' :
                         job.type === 'REGULAR_INTERN' ? 'Regular Intern' :
                         job.type === 'FTE' ? 'Full Time' :
                         job.type === 'INTERN_PLUS_FTE' ? 'Intern + FTE' :
                         job.type === 'INTERN_LEADS_TO_FTE' ? 'Intern → FTE' :
                         job.type === 'BOTH' ? 'Both' :
                         job.type === 'INTERNSHIP' ? 'Internship' : job.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {job.ctc || job.stipend || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(job.applyBy)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getJobStatusColor(job.status)}`}>
                        {getJobStatusLabel(job.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.link && (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </div>
    </div>
  )
}
