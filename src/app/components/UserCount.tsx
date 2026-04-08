'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function UserCount() {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchUserCount = async () => {
      const { count, error } = await supabase()
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching user count:', error.message);
      } else {
        setUserCount(count || 0);
      }
    };

    fetchUserCount();

    const channel = supabase()
      .channel('profiles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, fetchUserCount)
      .subscribe();

    return () => {
      supabase().removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Registered Users</h3>
      <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{userCount}</p>
    </div>
  );
}
