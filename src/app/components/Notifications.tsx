''''use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '../AuthContext';
import { Notification } from '../types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { BellIcon } from '@heroicons/react/24/outline';

export default function Notifications() {
  const supabase = createClient();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*, sender:profiles!sender_user_id(*)')
      .eq('recipient_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error.message);
    } else {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!user) return;
    
    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_user_id=eq.${user.id}` }, fetchNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications, supabase]);

  const markAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking notifications as read:', error.message);
    } else {
      setUnreadCount(0);
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.type === 'like' || notification.type === 'comment') {
      return `/post/${notification.post_id}`;
    }
    if (notification.type === 'like_comment' || notification.type === 'reply') {
        return `/post/${notification.post_id}#comment-${notification.comment_id}`;
    }
    return '#';
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return `liked your post.`
      case 'comment':
        return `commented on your post.`
      case 'like_comment':
        return `liked your comment.`
      case 'reply':
        return `replied to your comment.`
      default:
        return 'sent you a notification.'
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
        <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold">Notifications</h3>
            {unreadCount > 0 && 
              <button onClick={markAsRead} className="text-sm text-blue-500 hover:underline">Mark all as read</button>
            }
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {notifications.map(notification => (
              <Link key={notification.id} href={getNotificationLink(notification)}>
                <div className={`p-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <div className="flex items-start">
                    <img src={notification.sender.avatar_url} alt={notification.sender.full_name} className="w-8 h-8 rounded-full mr-3"/>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-bold">{notification.sender.full_name}</span> {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {notifications.length === 0 && (
                <p className="p-4 text-center text-sm text-gray-500">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
'''