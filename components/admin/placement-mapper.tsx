'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Check, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface Student {
  id: string
  name: string
  rollNumber: string
  department: string
  placementStatus: string
  finalPlacedCompany?: string | null
  finalPlacedCTC?: string | null
  canSitForMore: boolean
}

interface Placement {
  id: string
  company: string
  jobTitle: string
  ctc?: string | null
  stipend?: string | null
  jobType?: string | null
  offerDate: string
  offerStatus: string
  isAccepted: boolean
  notes?: string | null
}

interface Job {
  id: string
  company: string
  title: string
  ctc?: string | null
  stipend?: string | null
  jobType?: string | null
}

interface PlacementMapperProps {
  student: Student
  onSuccess: () => void
  onCancel: () => void
}

export function PlacementMapper({ student, onSuccess, onCancel }: PlacementMapperProps) {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    jobId: '',
    company: '',
    jobTitle: '',
    ctc: '',
    stipend: '',
    jobType: '',
    offerDate: new Date().toISOString().split('T')[0],
    offerStatus: 'PENDING',
    isAccepted: false,
    notes: '',
  })

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id])

  const fetchData = async () => {
    try {
      const [studentRes, jobsRes] = await Promise.all([
        fetch(`/api/students/${student.id}`),
        fetch('/api/jobs'),
      ])

      if (studentRes.ok) {
        const studentData = await studentRes.json()
        setPlacements(studentData.placements || [])
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        setJobs(jobsData)
      }
    } catch (error) {
      toast.error('Failed to load placement data')
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobSelect = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      setFormData({
        ...formData,
        jobId: job.id,
        company: job.company,
        jobTitle: job.title,
        ctc: job.ctc || '',
        stipend: job.stipend || '',
        jobType: job.jobType || '',
      })
    } else {
      setFormData({
        ...formData,
        jobId: '',
        company: '',
        jobTitle: '',
        ctc: '',
        stipend: '',
        jobType: '',
      })
    }
  }

  const calculateEligibility = (ctc: string): boolean => {
    const ctcMatch = ctc?.match(/(\d+(?:\.\d+)?)/)
    const ctcValue = ctcMatch ? parseFloat(ctcMatch[1]) : 0
    return ctcValue <= 6
  }

  const handleAddPlacement = async () => {
    if (!formData.company || !formData.jobTitle) {
      toast.error('Company and job title are required')
      return
    }

    try {
      const response = await fetch(`/api/students/${student.id}/placements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to add placement')

      toast.success('Placement added successfully')
      setShowAddForm(false)
      setFormData({
        jobId: '',
        company: '',
        jobTitle: '',
        ctc: '',
        stipend: '',
        jobType: '',
        offerDate: new Date().toISOString().split('T')[0],
        offerStatus: 'PENDING',
        isAccepted: false,
        notes: '',
      })
      fetchData()
      onSuccess()
    } catch (error) {
      toast.error('Failed to add placement')
      console.error('Error adding placement:', error)
    }
  }

  const handleUpdatePlacement = async (placementId: string, updates: any) => {
    try {
      const response = await fetch(`/api/students/${student.id}/placements/${placementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update placement')

      toast.success('Placement updated successfully')
      fetchData()
      onSuccess()
    } catch (error) {
      toast.error('Failed to update placement')
      console.error('Error updating placement:', error)
    }
  }

  const handleDeletePlacement = async (placementId: string) => {
    if (!confirm('Are you sure you want to delete this placement?')) return

    try {
      const response = await fetch(`/api/students/${student.id}/placements/${placementId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete placement')

      toast.success('Placement deleted successfully')
      fetchData()
      onSuccess()
    } catch (error) {
      toast.error('Failed to delete placement')
      console.error('Error deleting placement:', error)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <p className="text-gray-900 dark:text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage Placements
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {student.name} ({student.rollNumber})
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Current Status
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {student.placementStatus.replace(/_/g, ' ')}
                </p>
                {student.finalPlacedCompany && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Placed at {student.finalPlacedCompany} - {student.finalPlacedCTC}
                  </p>
                )}
              </div>
              {student.canSitForMore && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Can sit for ≤2x CTC
                </span>
              )}
            </div>
          </div>

          {/* Existing Placements */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Placement Offers ({placements.length})
              </h3>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Offer
              </Button>
            </div>

            {placements.length === 0 && !showAddForm && (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No placement offers yet</p>
              </div>
            )}

            <div className="space-y-3">
              {placements.map((placement) => (
                <div
                  key={placement.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        {placement.company}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {placement.jobTitle}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        {placement.ctc && (
                          <span className="text-gray-700 dark:text-gray-300">
                            CTC: {placement.ctc}
                          </span>
                        )}
                        {placement.stipend && (
                          <span className="text-gray-700 dark:text-gray-300">
                            Stipend: {placement.stipend}
                          </span>
                        )}
                        {placement.jobType && (
                          <span className="text-gray-700 dark:text-gray-300">
                            {placement.jobType}
                          </span>
                        )}
                      </div>
                      {placement.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {placement.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {placement.isAccepted ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Accepted
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleUpdatePlacement(placement.id, { isAccepted: true })}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                            title="Accept Offer"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdatePlacement(placement.id, { offerStatus: 'REJECTED' })}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            title="Reject Offer"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeletePlacement(placement.id)}
                        className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete Placement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Placement Form */}
              {showAddForm && (
                <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-4 space-y-4">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">
                    Add New Placement Offer
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Job (or enter manually below)
                    </label>
                    <select
                      value={formData.jobId}
                      onChange={(e) => handleJobSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Manual Entry --</option>
                      {jobs.map(job => (
                        <option key={job.id} value={job.id}>
                          {job.company} - {job.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Company *
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Company Name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Software Engineer"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        CTC
                      </label>
                      <input
                        type="text"
                        value={formData.ctc}
                        onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="12.00 LPA"
                      />
                      {formData.ctc && calculateEligibility(formData.ctc) && (
                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                          ✓ Student can sit for ≤2x CTC companies
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Stipend
                      </label>
                      <input
                        type="text"
                        value={formData.stipend}
                        onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="50,000/month"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Job Type
                      </label>
                      <select
                        value={formData.jobType}
                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
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
                        Offer Date
                      </label>
                      <input
                        type="date"
                        value={formData.offerDate}
                        onChange={(e) => setFormData({ ...formData, offerDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isAccepted"
                      checked={formData.isAccepted}
                      onChange={(e) => setFormData({ ...formData, isAccepted: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isAccepted" className="text-sm text-gray-700 dark:text-gray-300">
                      Mark as accepted (will update student status)
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <Button
                      onClick={() => setShowAddForm(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddPlacement} size="sm">
                      Add Placement
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
