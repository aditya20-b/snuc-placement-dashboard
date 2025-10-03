export default function TrackerPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Job Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your application status
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 border border-gray-200 dark:border-gray-700 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The job tracker feature will allow you to manage your applications, track deadlines, and monitor your placement journey. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  )
}
