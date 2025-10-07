'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface Student {
  id: string
  name: string
  rollNumber: string
  email?: string | null
  mobile?: string | null
  department: string
  batch: string
  section?: string | null
  cgpa?: number | null
  currentArrears?: number | null
  placementStatus: string
  canSitForMore: boolean
  finalPlacedCompany?: string | null
  finalPlacedJobTitle?: string | null
  finalPlacedCTC?: string | null
  finalPlacedJobType?: string | null
  finalPlacedDate?: string | null
}

interface Job {
  id: string
  company: string
  title: string
  ctc?: string | null
  stipend?: string | null
  type?: string | null
}

interface StudentFormProps {
  student: Student
  onSuccess: () => void
  onCancel: () => void
}

export function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState({
    email: student.email || '',
    mobile: student.mobile || '',
    cgpa: student.cgpa?.toString() || '',
    currentArrears: student.currentArrears?.toString() || '0',
    placementStatus: student.placementStatus,
    finalPlacedCompany: student.finalPlacedCompany || '',
    finalPlacedJobTitle: student.finalPlacedJobTitle || '',
    finalPlacedCTC: student.finalPlacedCTC || '',
    finalPlacedJobType: student.finalPlacedJobType || '',
    finalPlacedDate: student.finalPlacedDate ? new Date(student.finalPlacedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)

  useEffect(() => {
    if (formData.placementStatus === 'PLACED' || formData.placementStatus === 'PLACED_FINAL') {
      fetchJobs()
    }
  }, [formData.placementStatus])

  const fetchJobs = async () => {
    setLoadingJobs(true)
    try {
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoadingJobs(false)
    }
  }

  const handleJobSelect = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      setFormData({
        ...formData,
        finalPlacedCompany: job.company,
        finalPlacedJobTitle: job.title,
        finalPlacedCTC: job.ctc || '',
        finalPlacedJobType: job.type || '',
      })
    } else {
      setFormData({
        ...formData,
        finalPlacedCompany: '',
        finalPlacedJobTitle: '',
        finalPlacedCTC: '',
        finalPlacedJobType: '',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate placement data if status is PLACED or PLACED_FINAL
    if (formData.placementStatus === 'PLACED' || formData.placementStatus === 'PLACED_FINAL') {
      if (!formData.finalPlacedCompany || !formData.finalPlacedJobTitle) {
        toast.error('Company and job title are required for placed students')
        return
      }
      if (!formData.finalPlacedCTC) {
        toast.error('CTC is required for placed students')
        return
      }
    }

    setLoading(true)

    try {
      const updateData: any = {
        email: formData.email || null,
        mobile: formData.mobile || null,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        currentArrears: parseInt(formData.currentArrears) || 0,
        placementStatus: formData.placementStatus,
      }

      // Add placement details if status is PLACED or PLACED_FINAL
      if (formData.placementStatus === 'PLACED' || formData.placementStatus === 'PLACED_FINAL') {
        updateData.finalPlacedCompany = formData.finalPlacedCompany
        updateData.finalPlacedJobTitle = formData.finalPlacedJobTitle
        updateData.finalPlacedCTC = formData.finalPlacedCTC
        updateData.finalPlacedJobType = formData.finalPlacedJobType || null
        updateData.finalPlacedDate = formData.finalPlacedDate ? new Date(formData.finalPlacedDate) : new Date()

        // Calculate canSitForMore based on CTC
        const ctcValue = parseFloat(formData.finalPlacedCTC.match(/(\d+(?:\.\d+)?)/)?.[1] || '0')
        updateData.canSitForMore = ctcValue <= 6
      } else {
        // Clear placement data if status is not PLACED/PLACED_FINAL
        updateData.finalPlacedCompany = null
        updateData.finalPlacedJobTitle = null
        updateData.finalPlacedCTC = null
        updateData.finalPlacedJobType = null
        updateData.finalPlacedDate = null
        updateData.canSitForMore = true
      }

      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) throw new Error('Failed to update student')

      toast.success('Student updated successfully')
      onSuccess()
    } catch (error) {
      toast.error('Failed to update student')
      console.error('Error updating student:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Student Details
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Info (Read-only) */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Name</span>
                <p className="text-gray-900 dark:text-white font-medium">{student.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Roll Number</span>
                <p className="text-gray-900 dark:text-white font-medium">{student.rollNumber}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Department</span>
                <p className="text-gray-900 dark:text-white font-medium">
                  {student.department} {student.section && `(${student.section})`}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Batch</span>
                <p className="text-gray-900 dark:text-white font-medium">{student.batch}</p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="student@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mobile
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+91 1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CGPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="8.50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Arrears
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentArrears}
                onChange={(e) => setFormData({ ...formData, currentArrears: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Placement Status
            </label>
            <select
              value={formData.placementStatus}
              onChange={(e) => setFormData({ ...formData, placementStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OPTED_IN">Opted In</option>
              <option value="OPTED_OUT">Opted Out</option>
              <option value="HIGHER_STUDIES">Higher Studies</option>
              <option value="PLACED">Placed (Can sit for more)</option>
              <option value="PLACED_FINAL">Placed (Final)</option>
            </select>
            {formData.placementStatus === 'PLACED' && (
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                Student can sit for companies offering ≤2x their current CTC
              </p>
            )}
          </div>

          {/* Placement Details - Show when PLACED or PLACED_FINAL */}
          {(formData.placementStatus === 'PLACED' || formData.placementStatus === 'PLACED_FINAL') && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Placement Details <span className="text-red-500">*</span>
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Job (or enter manually below)
                </label>
                <select
                  onChange={(e) => handleJobSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingJobs}
                >
                  <option value="">-- Select from existing jobs or enter manually --</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.company} - {job.title} {job.ctc ? `(${job.ctc})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.finalPlacedCompany}
                    onChange={(e) => setFormData({ ...formData, finalPlacedCompany: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Company Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.finalPlacedJobTitle}
                    onChange={(e) => setFormData({ ...formData, finalPlacedJobTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Software Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CTC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.finalPlacedCTC}
                    onChange={(e) => setFormData({ ...formData, finalPlacedCTC: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12.00 LPA"
                    required
                  />
                  {formData.finalPlacedCTC && (() => {
                    const ctcValue = parseFloat(formData.finalPlacedCTC.match(/(\d+(?:\.\d+)?)/)?.[1] || '0')
                    return ctcValue <= 6 ? (
                      <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                        ✓ Student can sit for companies offering ≤{(ctcValue * 2).toFixed(2)} LPA
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        Student cannot sit for more placements (CTC &gt; 6 LPA)
                      </p>
                    )
                  })()}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Type
                  </label>
                  <select
                    value={formData.finalPlacedJobType}
                    onChange={(e) => setFormData({ ...formData, finalPlacedJobType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FTE">Full Time</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Offer/Placement Date
                  </label>
                  <input
                    type="date"
                    value={formData.finalPlacedDate}
                    onChange={(e) => setFormData({ ...formData, finalPlacedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> These details will be used to update the student&apos;s final placement record. For managing multiple offers, use the &quot;Manage Placement&quot; button.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
