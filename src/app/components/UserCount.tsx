'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { FaUsers } from 'react-icons/fa';

export default function UserCount() {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchUserCount = async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching user count:', error);
      } else {
        setUserCount(count || 0);
      }
    };

    fetchUserCount();

    const subscription = supabase
      .channel('profiles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        fetchUserCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="text-center p-4">
      <div className="flex items-center justify-center gap-2">
        <FaUsers className="text-2xl text-blue-600" />
        <p className="text-2xl font-bold">{userCount.toLocaleString()}</p>
      </div>
      <p className="text-sm text-gray-500">registered users</p>
    </div>
  );
}
