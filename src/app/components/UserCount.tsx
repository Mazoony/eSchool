'use client';

import { useState, useEffect } from 'react';
import { subscribeUserCount } from '@/utils/supabase/data';

export default function UserCount() {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    return subscribeUserCount(
      setUserCount,
      (error) => console.error('Error fetching user count:', error),
    );
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Registered Users</h3>
      <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{userCount}</p>
    </div>
  );
}
