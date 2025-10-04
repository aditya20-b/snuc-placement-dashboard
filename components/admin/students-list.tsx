'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Edit2, UserPlus, Filter } from 'lucide-react'
import { StudentForm } from './student-form'
import { PlacementMapper } from './placement-mapper'
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
  finalPlacedCTC?: string | null
  _count: {
    placements: number
  }
}

export function StudentsList() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [mappingPlacementFor, setMappingPlacementFor] = useState<Student | null>(null)

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (!response.ok) throw new Error('Failed to fetch students')

      const data = await response.json()
      setStudents(data)
      setFilteredStudents(data)
    } catch (error) {
      toast.error('Failed to load students')
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    let filtered = students

    if (search) {
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
          s.email?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (departmentFilter) {
      filtered = filtered.filter(s => s.department === departmentFilter)
    }

    if (statusFilter) {
      filtered = filtered.filter(s => s.placementStatus === statusFilter)
    }

    setFilteredStudents(filtered)
  }, [search, departmentFilter, statusFilter, students])

  const handleFormSuccess = () => {
    setEditingStudent(null)
    fetchStudents()
  }

  const handlePlacementSuccess = () => {
    setMappingPlacementFor(null)
    fetchStudents()
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OPTED_IN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      OPTED_OUT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      HIGHER_STUDIES: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      PLACED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PLACED_FINAL: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    }

    const labels: Record<string, string> = {
      OPTED_IN: 'Opted In',
      OPTED_OUT: 'Opted Out',
      HIGHER_STUDIES: 'Higher Studies',
      PLACED: 'Placed',
      PLACED_FINAL: 'Placed (Final)',
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const departments = Array.from(new Set(students.map(s => s.department)))
  const statuses = ['OPTED_IN', 'OPTED_OUT', 'HIGHER_STUDIES', 'PLACED', 'PLACED_FINAL']

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500 dark:text-gray-400">Loading students...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Student Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {students.length} students | Showing: {filteredStudents.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {statuses.map(status => (
            <option key={status} value={status}>
              {status.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400">No students found matching your filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Roll No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    CGPA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Placement
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                      {student.rollNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {student.name}
                      </div>
                      {student.email && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{student.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {student.department}
                      {student.section && ` (${student.section})`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {student.cgpa?.toFixed(2) || 'N/A'}
                      {student.currentArrears ? (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          {student.currentArrears} arrear(s)
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(student.placementStatus)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {student.finalPlacedCompany ? (
                        <div>
                          <div className="text-gray-900 dark:text-white font-medium">
                            {student.finalPlacedCompany}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {student.finalPlacedCTC}
                            {student.canSitForMore && (
                              <span className="ml-1 text-blue-600 dark:text-blue-400">
                                (Can sit for more)
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">Not placed</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMappingPlacementFor(student)}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                          title="Manage Placement"
                        >
                          <UserPlus className="w-4 h-4" />
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

      {/* Edit Student Modal */}
      {editingStudent && (
        <StudentForm
          student={editingStudent}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditingStudent(null)}
        />
      )}

      {/* Placement Mapper Modal */}
      {mappingPlacementFor && (
        <PlacementMapper
          student={mappingPlacementFor}
          onSuccess={handlePlacementSuccess}
          onCancel={() => setMappingPlacementFor(null)}
        />
      )}
    </div>
  )
}
