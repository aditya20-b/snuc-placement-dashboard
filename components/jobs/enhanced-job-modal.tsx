'use client'

import { useState } from 'react'
import { X, ExternalLink, MapPin, Calendar, DollarSign, Briefcase, User, Bell, History, Paperclip } from 'lucide-react'
import { JobType, JobCategory, JobStatus, GenderRequirement, ModeOfVisit } from '@prisma/client'
import { JobAttachments } from './job-attachments'

interface WorkflowStage {
  stageName: string
  stageType: string
  description?: string
  orderIndex: number
}

interface JobNotice {
  title: string
  content: string
  isImportant: boolean
  createdAt: Date
}

interface JobLog {
  action: string
  description: string
  performedBy?: string
  createdAt: Date
}

interface JobAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedBy?: string | null
  createdAt: Date
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
  dateOfVisit?: Date | null
  hiringStartsOn?: Date | null
  modeOfVisit?: ModeOfVisit | null
  eligibility?: string | null
  location?: string | null
  link?: string | null
  description?: string | null
  aboutCompany?: string | null
  // Eligibility
  minCGPA?: number | null
  min10thPercentage?: number | null
  min12thPercentage?: number | null
  minDiplomaPercentage?: number | null
  minSemPercentage?: number | null
  maxCurrentArrears?: number | null
  maxHistoryArrears?: number | null
  genderRequirement?: GenderRequirement | null
  eligibilityBranches?: string | null
  otherEligibility?: string | null
  // POC
  pocName?: string | null
  pocEmail?: string | null
  pocPhone?: string | null
  // Relations
  workflowStages?: WorkflowStage[]
  attachments?: JobAttachment[]
  notices?: JobNotice[]
  logs?: JobLog[]
}

interface EnhancedJobModalProps {
  job: Job
  onClose: () => void
}

type TabKey = 'details' | 'poc' | 'attachments' | 'notices' | 'logs'

export function EnhancedJobModal({ job, onClose }: EnhancedJobModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('details')

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const tabs = [
    { key: 'details' as TabKey, label: 'Details', icon: Briefcase },
    { key: 'poc' as TabKey, label: 'POC', icon: User },
    { key: 'attachments' as TabKey, label: 'Attachments', icon: Paperclip, count: job.attachments?.length || 0 },
    { key: 'notices' as TabKey, label: 'Notices', icon: Bell, count: job.notices?.length || 0 },
    { key: 'logs' as TabKey, label: 'Logs', icon: History, count: job.logs?.length || 0 }
  ]

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
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

          {/* Tabs */}
          <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      inline-flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(job.status)}`}>
                  {job.status.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {job.category.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {job.type.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {job.type.replace(/_/g, ' ')}
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
                        {job.type === 'INTERNSHIP' || job.type === 'SUMMER_INTERN' || job.type === 'REGULAR_INTERN' ? 'Stipend' : 'CTC'}
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

                {job.dateOfVisit && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date of Visit</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(job.dateOfVisit)}
                      </p>
                    </div>
                  </div>
                )}

                {job.modeOfVisit && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Mode of Visit</p>
                      <p className="font-medium text-gray-900 dark:text-white">{job.modeOfVisit}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Eligibility Criteria */}
              {(job.minCGPA || job.min10thPercentage || job.min12thPercentage || job.genderRequirement) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Eligibility Criteria
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="text-left py-2 px-2 text-gray-700 dark:text-gray-300">10th</th>
                          <th className="text-left py-2 px-2 text-gray-700 dark:text-gray-300">12th</th>
                          <th className="text-left py-2 px-2 text-gray-700 dark:text-gray-300">Diploma</th>
                          <th className="text-left py-2 px-2 text-gray-700 dark:text-gray-300">Sem</th>
                          <th className="text-left py-2 px-2 text-gray-700 dark:text-gray-300">Max Current Arrears</th>
                          <th className="text-left py-2 px-2 text-gray-700 dark:text-gray-300">Max History Arrears</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 px-2 text-gray-900 dark:text-white">
                            {job.min10thPercentage ? `${job.min10thPercentage}%` : '-'}
                          </td>
                          <td className="py-2 px-2 text-gray-900 dark:text-white">
                            {job.min12thPercentage ? `${job.min12thPercentage}%` : '-'}
                          </td>
                          <td className="py-2 px-2 text-gray-900 dark:text-white">
                            {job.minDiplomaPercentage ? `${job.minDiplomaPercentage}%` : '-'}
                          </td>
                          <td className="py-2 px-2 text-gray-900 dark:text-white">
                            {job.minSemPercentage ? `${job.minSemPercentage}%` : '-'}
                          </td>
                          <td className="py-2 px-2 text-gray-900 dark:text-white">
                            {job.maxCurrentArrears ?? '-'}
                          </td>
                          <td className="py-2 px-2 text-gray-900 dark:text-white">
                            {job.maxHistoryArrears ?? '-'}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-4 space-y-2">
                      {job.genderRequirement && job.genderRequirement !== 'ANY' && (
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Gender:</span> {job.genderRequirement}
                        </p>
                      )}
                      {job.minCGPA && (
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Min Current CGPA:</span> {job.minCGPA}
                        </p>
                      )}
                      {job.eligibilityBranches && (
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Eligible Branches:</span> {job.eligibilityBranches}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* About Company */}
              {job.aboutCompany && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    About {job.company}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {job.aboutCompany}
                  </p>
                </div>
              )}

              {/* Job Description */}
              {job.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Job Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              )}

              {/* Hiring Workflow */}
              {job.workflowStages && job.workflowStages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Hiring Workflow
                  </h3>
                  <div className="space-y-3">
                    {job.workflowStages.map((stage, index) => (
                      <div key={index} className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          {index < job.workflowStages!.length - 1 && (
                            <div className="w-px h-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {stage.stageName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Round Type: {stage.stageType}
                          </p>
                          {stage.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              {stage.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                        ✓
                      </div>
                      <span className="ml-4 font-medium text-gray-900 dark:text-white">Offer Rollout</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Apply Link */}
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
          )}

          {/* POC Tab */}
          {activeTab === 'poc' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Point of Contact
              </h3>

              {job.pocName || job.pocEmail || job.pocPhone ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                  {job.pocName && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{job.pocName}</p>
                    </div>
                  )}
                  {job.pocEmail && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <a
                        href={`mailto:${job.pocEmail}`}
                        className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {job.pocEmail}
                      </a>
                    </div>
                  )}
                  {job.pocPhone && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <a
                        href={`tel:${job.pocPhone}`}
                        className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {job.pocPhone}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No point of contact information available
                </p>
              )}
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Job Attachments
              </h3>
              <JobAttachments jobId={job.id} attachments={job.attachments || []} />
            </div>
          )}

          {/* Notices Tab */}
          {activeTab === 'notices' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Announcements & Notices
              </h3>

              {job.notices && job.notices.length > 0 ? (
                <div className="space-y-3">
                  {job.notices.map((notice, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        notice.isImportant
                          ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {notice.title}
                          {notice.isImportant && (
                            <span className="ml-2 text-xs px-2 py-1 bg-yellow-200 dark:bg-yellow-800 rounded-full">
                              Important
                            </span>
                          )}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(notice.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">
                        {notice.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No notices or announcements yet
                </p>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Activity History
              </h3>

              {job.logs && job.logs.length > 0 ? (
                <div className="space-y-3">
                  {job.logs.map((log, index) => (
                    <div key={index} className="flex space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className="text-gray-900 dark:text-white">
                            {log.description}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                        {log.performedBy && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            by {log.performedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No activity logs yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
