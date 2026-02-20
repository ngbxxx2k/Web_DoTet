export default function BasicInfo() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Basic Information
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure your store's core details visible to customers.
          </p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Store Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
              Store Name
            </span>
            <input
              className="w-full h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
              placeholder="e.g. Nextmerce Official Store"
              type="text"
              defaultValue="Nextmerce Official Store"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
              Contact Email
            </span>
            <input
              className="w-full h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
              placeholder="support@nextmerce.com"
              type="email"
              defaultValue="admin@nextmerce.com"
            />
          </label>
        </div>
        {/* PhoneNumber*/}
        <label className="block max-w-md">
          <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
              Phone Number
            </span>
            <input
              className="w-full h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
              placeholder="+84 123 456 789"
              type="text"
              defaultValue="+84 123 456 789"
            />
        </label>
      </div>
    </div>
  );
}
