'use client'

import { useState } from 'react'
import { X, Plus, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Notice {
  id?: string
  title: string
  content: string
  isImportant: boolean
}

interface NoticesManagerProps {
  jobId: string
  jobTitle: string
  existingNotices: Notice[]
  onClose: () => void
  onSuccess: () => void
}

export function NoticesManager({
  jobId,
  jobTitle,
  existingNotices,
  onClose,
  onSuccess
}: NoticesManagerProps) {
  const [notices, setNotices] = useState<Notice[]>(existingNotices)
  const [newNotice, setNewNotice] = useState<Notice>({
    title: '',
    content: '',
    isImportant: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddNotice = async () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      toast.error('Please fill in both title and content')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotice)
      })

      if (!response.ok) throw new Error('Failed to add notice')

      const addedNotice = await response.json()
      setNotices([...notices, addedNotice])
      setNewNotice({ title: '', content: '', isImportant: false })
      toast.success('Notice added successfully')
    } catch (error) {
      console.error('Error adding notice:', error)
      toast.error('Failed to add notice')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNotice = async (noticeId: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/notices/${noticeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete notice')

      setNotices(notices.filter(n => n.id !== noticeId))
      toast.success('Notice deleted successfully')
    } catch (error) {
      console.error('Error deleting notice:', error)
      toast.error('Failed to delete notice')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Notices
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add New Notice */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add New Notice
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Notice title"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content *
              </label>
              <textarea
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Notice content"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="important"
                checked={newNotice.isImportant}
                onChange={(e) => setNewNotice({ ...newNotice, isImportant: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label htmlFor="important" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Mark as Important
              </label>
            </div>

            <button
              onClick={handleAddNotice}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Adding...' : 'Add Notice'}</span>
            </button>
          </div>

          {/* Existing Notices */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Existing Notices ({notices.length})
            </h3>

            {notices.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No notices added yet
              </p>
            ) : (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className={`p-4 rounded-lg border ${
                      notice.isImportant
                        ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {notice.isImportant && (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {notice.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {notice.content}
                        </p>
                      </div>

                      {notice.id && (
                        <button
                          onClick={() => handleDeleteNotice(notice.id!)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
