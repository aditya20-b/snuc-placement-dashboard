'use client'

import { useState } from 'react'
import {
  JobType,
  JobCategory,
  JobStatus,
  GenderRequirement,
  ModeOfVisit
} from '@prisma/client'
import toast from 'react-hot-toast'
import { X, Plus, Trash2 } from 'lucide-react'

interface WorkflowStage {
  stageName: string
  stageType: string
  description?: string
}

interface Job {
  id?: string
  // Basic
  company: string
  title: string
  description?: string
  aboutCompany?: string
  // Compensation
  ctc?: string
  stipend?: string
  // Details
  type: JobType
  category: JobCategory
  status: JobStatus
  location?: string
  link?: string
  // Dates
  applyBy?: string
  dateOfVisit?: string
  hiringStartsOn?: string
  // Visit
  modeOfVisit?: ModeOfVisit
  // Eligibility
  minCGPA?: number
  min10thPercentage?: number
  min12thPercentage?: number
  minDiplomaPercentage?: number
  minSemPercentage?: number
  maxCurrentArrears?: number
  maxHistoryArrears?: number
  genderRequirement?: GenderRequirement
  eligibilityBranches?: string
  otherEligibility?: string
  // POC
  pocName?: string
  pocEmail?: string
  pocPhone?: string
  // System
  notAppliedPointsDeduct?: number
  // Relations
  workflowStages?: WorkflowStage[]
}

interface EnhancedJobFormProps {
  job?: any
  onSuccess: () => void
  onCancel: () => void
}

type TabKey = 'basic' | 'eligibility' | 'dates' | 'poc' | 'workflow'

export function EnhancedJobForm({ job, onSuccess, onCancel }: EnhancedJobFormProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('basic')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<Job>({
    company: job?.company || '',
    title: job?.title || '',
    description: job?.description || '',
    aboutCompany: job?.aboutCompany || '',
    ctc: job?.ctc || '',
    stipend: job?.stipend || '',
    type: job?.type || 'FTE',
    category: job?.category || 'OTHER',
    status: job?.status || 'OPEN',
    location: job?.location || '',
    link: job?.link || '',
    applyBy: job?.applyBy ? new Date(job.applyBy).toISOString().split('T')[0] : '',
    dateOfVisit: job?.dateOfVisit ? new Date(job.dateOfVisit).toISOString().split('T')[0] : '',
    hiringStartsOn: job?.hiringStartsOn ? new Date(job.hiringStartsOn).toISOString().split('T')[0] : '',
    modeOfVisit: job?.modeOfVisit || undefined,
    minCGPA: job?.minCGPA || undefined,
    min10thPercentage: job?.min10thPercentage || undefined,
    min12thPercentage: job?.min12thPercentage || undefined,
    minDiplomaPercentage: job?.minDiplomaPercentage || undefined,
    minSemPercentage: job?.minSemPercentage || undefined,
    maxCurrentArrears: job?.maxCurrentArrears || 0,
    maxHistoryArrears: job?.maxHistoryArrears || undefined,
    genderRequirement: job?.genderRequirement || 'ANY',
    eligibilityBranches: job?.eligibilityBranches || '',
    otherEligibility: job?.otherEligibility || '',
    pocName: job?.pocName || '',
    pocEmail: job?.pocEmail || '',
    pocPhone: job?.pocPhone || '',
    notAppliedPointsDeduct: job?.notAppliedPointsDeduct || 0,
    workflowStages: job?.workflowStages || []
  })

  const tabs = [
    { key: 'basic' as TabKey, label: 'Basic Info' },
    { key: 'eligibility' as TabKey, label: 'Eligibility' },
    { key: 'dates' as TabKey, label: 'Dates & Visit' },
    { key: 'poc' as TabKey, label: 'POC' },
    { key: 'workflow' as TabKey, label: 'Workflow' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = job?.id ? `/api/jobs/${job.id}` : '/api/jobs'
      const method = job?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save job')
      }

      toast.success(job?.id ? 'Job updated successfully' : 'Job created successfully')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const addWorkflowStage = () => {
    setFormData({
      ...formData,
      workflowStages: [
        ...(formData.workflowStages || []),
        { stageName: '', stageType: '', description: '' }
      ]
    })
  }

  const removeWorkflowStage = (index: number) => {
    const stages = [...(formData.workflowStages || [])]
    stages.splice(index, 1)
    setFormData({ ...formData, workflowStages: stages })
  }

  const updateWorkflowStage = (index: number, field: keyof WorkflowStage, value: string) => {
    const stages = [...(formData.workflowStages || [])]
    stages[index] = { ...stages[index], [field]: value }
    setFormData({ ...formData, workflowStages: stages })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company *
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as JobType })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="SUMMER_INTERN">Summer Intern</option>
                <option value="REGULAR_INTERN">Regular Intern</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FTE">Full Time</option>
                <option value="INTERN_PLUS_FTE">Intern + Full Time</option>
                <option value="INTERN_LEADS_TO_FTE">Intern Leads to Full Time</option>
                <option value="BOTH">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as JobCategory })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="MARQUE">Marque (20L+ CTC)</option>
                <option value="SUPER_DREAM">Super Dream (10-20L CTC)</option>
                <option value="DREAM">Dream (6-10L CTC)</option>
                <option value="CORE">Core</option>
                <option value="REGULAR">Regular (0-3.9L CTC)</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Bangalore, Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CTC
              </label>
              <input
                type="text"
                placeholder="e.g., 12 LPA or 10-14 LPA"
                value={formData.ctc}
                onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stipend
              </label>
              <input
                type="text"
                placeholder="e.g., 50k/month"
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Application Link
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                About Company
              </label>
              <textarea
                rows={3}
                placeholder="Company description..."
                value={formData.aboutCompany}
                onChange={(e) => setFormData({ ...formData, aboutCompany: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Description
              </label>
              <textarea
                rows={4}
                placeholder="Detailed job description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Eligibility Tab */}
        {activeTab === 'eligibility' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum CGPA
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 7.0"
                value={formData.minCGPA || ''}
                onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min 10th Percentage
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 60"
                value={formData.min10thPercentage || ''}
                onChange={(e) => setFormData({ ...formData, min10thPercentage: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min 12th Percentage
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 60"
                value={formData.min12thPercentage || ''}
                onChange={(e) => setFormData({ ...formData, min12thPercentage: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Diploma Percentage
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 60"
                value={formData.minDiplomaPercentage || ''}
                onChange={(e) => setFormData({ ...formData, minDiplomaPercentage: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Semester Percentage
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 60"
                value={formData.minSemPercentage || ''}
                onChange={(e) => setFormData({ ...formData, minSemPercentage: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Current Arrears
              </label>
              <input
                type="number"
                placeholder="e.g., 0"
                value={formData.maxCurrentArrears || 0}
                onChange={(e) => setFormData({ ...formData, maxCurrentArrears: e.target.value ? parseInt(e.target.value) : 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max History Arrears
              </label>
              <input
                type="number"
                placeholder="e.g., 0"
                value={formData.maxHistoryArrears || ''}
                onChange={(e) => setFormData({ ...formData, maxHistoryArrears: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender Requirement
              </label>
              <select
                value={formData.genderRequirement}
                onChange={(e) => setFormData({ ...formData, genderRequirement: e.target.value as GenderRequirement })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="ANY">Any</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="BOTH">Both</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Eligible Branches
              </label>
              <input
                type="text"
                placeholder="e.g., CSE/IT/ECE/EEE"
                value={formData.eligibilityBranches}
                onChange={(e) => setFormData({ ...formData, eligibilityBranches: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Other Eligibility Criteria
              </label>
              <textarea
                rows={3}
                placeholder="Any additional eligibility requirements..."
                value={formData.otherEligibility}
                onChange={(e) => setFormData({ ...formData, otherEligibility: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Dates & Visit Tab */}
        {activeTab === 'dates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apply By
              </label>
              <input
                type="date"
                value={formData.applyBy}
                onChange={(e) => setFormData({ ...formData, applyBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Visit
              </label>
              <input
                type="date"
                value={formData.dateOfVisit}
                onChange={(e) => setFormData({ ...formData, dateOfVisit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hiring Starts On
              </label>
              <input
                type="date"
                value={formData.hiringStartsOn}
                onChange={(e) => setFormData({ ...formData, hiringStartsOn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mode of Visit
              </label>
              <select
                value={formData.modeOfVisit || ''}
                onChange={(e) => setFormData({ ...formData, modeOfVisit: e.target.value as ModeOfVisit || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select mode</option>
                <option value="PHYSICAL">Physical</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
        )}

        {/* POC Tab */}
        {activeTab === 'poc' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                POC Name
              </label>
              <input
                type="text"
                placeholder="Point of Contact name"
                value={formData.pocName}
                onChange={(e) => setFormData({ ...formData, pocName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                POC Email
              </label>
              <input
                type="email"
                placeholder="contact@company.com"
                value={formData.pocEmail}
                onChange={(e) => setFormData({ ...formData, pocEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                POC Phone
              </label>
              <input
                type="tel"
                placeholder="+91-1234567890"
                value={formData.pocPhone}
                onChange={(e) => setFormData({ ...formData, pocPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Hiring Workflow Stages
              </h3>
              <button
                type="button"
                onClick={addWorkflowStage}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stage</span>
              </button>
            </div>

            {formData.workflowStages && formData.workflowStages.length > 0 ? (
              <div className="space-y-3">
                {formData.workflowStages.map((stage, index) => (
                  <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 relative">
                    <button
                      type="button"
                      onClick={() => removeWorkflowStage(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Stage {index + 1} Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Pre Placement Talk"
                          value={stage.stageName}
                          onChange={(e) => updateWorkflowStage(index, 'stageName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Stage Type
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., PRE_PLACEMENT_TALK"
                          value={stage.stageType}
                          onChange={(e) => updateWorkflowStage(index, 'stageType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Stage description..."
                          value={stage.description}
                          onChange={(e) => updateWorkflowStage(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No workflow stages added yet. Click &quot;Add Stage&quot; to get started.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : job?.id ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  )
}
