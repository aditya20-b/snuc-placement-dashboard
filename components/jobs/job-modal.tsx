'use client'

import { X, ExternalLink, MapPin, Calendar, DollarSign, Briefcase } from 'lucide-react'
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

interface JobModalProps {
  job: Job
  onClose: () => void
}

export function JobModal({ job, onClose }: JobModalProps) {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {job.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getJobStatusColor(job.status)}`}>
              {getJobStatusLabel(job.status)}
            </span>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {job.category.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Briefcase className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {job.type === 'FTE' ? 'Full Time' : job.type === 'BOTH' ? 'Both' : 'Internship'}
                </p>
              </div>
            </div>

            {job.location && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">{job.location}</p>
                </div>
              </div>
            )}

            {(job.ctc || job.stipend) && (
              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {job.type === 'INTERNSHIP' ? 'Stipend' : 'CTC'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {job.ctc || job.stipend}
                  </p>
                </div>
              </div>
            )}

            {job.applyBy && (
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Apply By</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(job.applyBy)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {job.eligibilityBranches && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Eligible Branches
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{job.eligibilityBranches}</p>
            </div>
          )}

          {job.eligibility && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Eligibility Criteria
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{job.eligibility}</p>
            </div>
          )}

          {job.workflowStages && job.workflowStages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Hiring Process
              </h3>
              <div className="space-y-3">
                {job.workflowStages.map((stage, index) => (
                  <div key={stage.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {stage.stageName}
                      </h4>
                      {stage.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {stage.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {job.aboutCompany && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                About the Company
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {job.aboutCompany}
              </p>
            </div>
          )}

          {job.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Job Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {job.description}
              </p>
            </div>
          )}

          {job.link && (
            <div>
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>View Job Posting</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
