export default function StatsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Placement Statistics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Detailed analytics and insights
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 border border-gray-200 dark:border-gray-700 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced statistics including CTC analysis, hiring trends, and comprehensive placement reports will be available soon.
          </p>
        </div>
      </div>
    </div>
  )
}
