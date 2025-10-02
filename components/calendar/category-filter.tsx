'use client'

import { EventCategory } from '@prisma/client'
import { getCategoryLabel, getCategoryColor } from '@/lib/utils'

interface CategoryFilterProps {
  selectedCategories: EventCategory[]
  onCategoriesChange: (categories: EventCategory[]) => void
}

export function CategoryFilter({ selectedCategories, onCategoriesChange }: CategoryFilterProps) {
  const toggleCategory = (category: EventCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category))
    } else {
      onCategoriesChange([...selectedCategories, category])
    }
  }

  const selectAll = () => {
    onCategoriesChange(Object.values(EventCategory))
  }

  const selectNone = () => {
    onCategoriesChange([])
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filter by Category</h3>
        <div className="flex space-x-2">
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            All
          </button>
          <span className="text-xs text-gray-400">|</span>
          <button
            onClick={selectNone}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            None
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.values(EventCategory).map((category) => {
          const isSelected = selectedCategories.includes(category)
          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getCategoryColor(category) }}
              />
              <span>{getCategoryLabel(category)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}