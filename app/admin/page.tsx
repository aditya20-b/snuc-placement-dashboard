'use client'

import { useState, useEffect } from 'react'
import { EventsList } from '@/components/admin/events-list'
import { JobsList } from '@/components/admin/jobs-list'
import { StudentsList } from '@/components/admin/students-list'
import { Calendar, Briefcase, Users, TrendingUp } from 'lucide-react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'jobs' | 'students'>('events')
  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalStudents: 0,
    placedStudents: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobsRes, eventsRes, studentsRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/events'),
          fetch('/api/students/stats')
        ])

        if (jobsRes.ok && eventsRes.ok) {
          const jobs = await jobsRes.json()
          const events = await eventsRes.json()

          const now = new Date()
          const upcomingEvents = events.filter((e: any) => new Date(e.startTime) > now).length

          let totalStudents = 0
          let placedStudents = 0

          if (studentsRes.ok) {
            const studentStats = await studentsRes.json()
            totalStudents = studentStats.totalStudents || 0
            placedStudents = studentStats.placedCount || 0
          }

          setStats({
            totalJobs: jobs.length,
            openJobs: jobs.filter((j: any) => j.status === 'OPEN').length,
            totalEvents: events.length,
            upcomingEvents,
            totalStudents,
            placedStudents
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage events, job postings, and students
        </p>
      </div>

      {/* Quick Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalJobs}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Open Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.openJobs}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalEvents}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.upcomingEvents}
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Placed Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.placedStudents}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('events')}
              className={`
                inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'events'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              <Calendar className="w-5 h-5" />
              <span>Events Management</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`
                inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'jobs'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              <Briefcase className="w-5 h-5" />
              <span>Jobs Management</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`
                inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'students'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              <Users className="w-5 h-5" />
              <span>Students Management</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'events' && <EventsList />}
          {activeTab === 'jobs' && <JobsList />}
          {activeTab === 'students' && <StudentsList />}
        </div>
      </div>
    </div>
  )
}