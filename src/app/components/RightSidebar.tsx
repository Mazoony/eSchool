'use client';

export default function RightSidebar() {
  return (
    <aside className="hidden lg:block w-80 p-6 bg-gray-50 dark:bg-gray-800/50">
      <div className="space-y-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Trends for you</h3>
          {/* Placeholder for trends */}
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>#NextJS</li>
            <li>#Supabase</li>
            <li>#AI</li>
            <li>#DeveloperTools</li>
          </ul>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Who to follow</h3>
          {/* Placeholder for user suggestions */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>User suggestions will appear here.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
