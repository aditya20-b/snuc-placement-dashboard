'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus, Bell, Paperclip } from 'lucide-react'
import { EnhancedJobForm } from './enhanced-job-form'
import { NoticesManager } from './notices-manager'
import { AttachmentsManager } from './attachments-manager'
import toast from 'react-hot-toast'
import { JobType, JobCategory, JobStatus } from '@prisma/client'
import { getJobStatusColor, getJobStatusLabel } from '@/lib/utils'

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
  description?: string
  eligibility?: string
  location?: string
  link?: string
}

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [managingNoticesFor, setManagingNoticesFor] = useState<Job | null>(null)
  const [managingAttachmentsFor, setManagingAttachmentsFor] = useState<Job | null>(null)
  const [jobNotices, setJobNotices] = useState<any[]>([])
  const [jobAttachments, setJobAttachments] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error('Failed to fetch jobs')
      const data = await res.json()
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete job')

      toast.success('Job deleted successfully')
      fetchJobs()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingJob(null)
    fetchJobs()
  }

  const handleManageNotices = async (job: Job) => {
    setLoadingDetails(true)
    try {
      const res = await fetch(`/api/jobs/${job.id}/notices`)
      if (!res.ok) throw new Error('Failed to fetch notices')
      const notices = await res.json()
      setJobNotices(notices)
      setManagingNoticesFor(job)
    } catch (error) {
      console.error('Error fetching notices:', error)
      toast.error('Failed to load notices')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleManageAttachments = async (job: Job) => {
    setLoadingDetails(true)
    try {
      const res = await fetch(`/api/jobs/${job.id}/attachments`)
      if (!res.ok) throw new Error('Failed to fetch attachments')
      const attachments = await res.json()
      setJobAttachments(attachments)
      setManagingAttachmentsFor(job)
    } catch (error) {
      console.error('Error fetching attachments:', error)
      toast.error('Failed to load attachments')
    } finally {
      setLoadingDetails(false)
    }
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading jobs...</div>
  }

  if (showForm) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {editingJob ? 'Edit Job' : 'Create New Job'}
        </h2>
        <EnhancedJobForm
          job={editingJob}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false)
            setEditingJob(null)
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Manage Jobs
        </h2>
        <button
          onClick={() => {
            setEditingJob(null)
            setShowForm(true)
          }}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Job</span>
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400">No jobs yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Apply By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {job.company}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-white">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {job.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getJobStatusColor(job.status)}`}>
                        {getJobStatusLabel(job.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(job.applyBy)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingJob(job)
                            setShowForm(true)
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          title="Edit Job"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleManageNotices(job)}
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
                          title="Manage Notices"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleManageAttachments(job)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                          title="Manage Attachments"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notices Manager Modal */}
      {managingNoticesFor && (
        <NoticesManager
          jobId={managingNoticesFor.id}
          jobTitle={`${managingNoticesFor.company} - ${managingNoticesFor.title}`}
          existingNotices={jobNotices}
          onClose={() => {
            setManagingNoticesFor(null)
            setJobNotices([])
          }}
          onSuccess={() => {
            setManagingNoticesFor(null)
            setJobNotices([])
            fetchJobs()
          }}
        />
      )}

      {/* Attachments Manager Modal */}
      {managingAttachmentsFor && (
        <AttachmentsManager
          jobId={managingAttachmentsFor.id}
          jobTitle={`${managingAttachmentsFor.company} - ${managingAttachmentsFor.title}`}
          existingAttachments={jobAttachments}
          onClose={() => {
            setManagingAttachmentsFor(null)
            setJobAttachments([])
          }}
          onSuccess={() => {
            setManagingAttachmentsFor(null)
            setJobAttachments([])
            fetchJobs()
          }}
        />
      )}
    </div>
  )
}
