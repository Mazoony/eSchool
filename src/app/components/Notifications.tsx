'use client';

import { useState, useEffect } from 'react';
import { markNotificationRead, markNotificationsRead, subscribeNotifications } from '@/utils/supabase/data';
import { useAuth } from '../AuthContext';
import { Notification } from '../types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { BellIcon } from '@heroicons/react/24/outline';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    return subscribeNotifications(
      user.id,
      (items) => {
        setNotifications(items);
        setUnreadCount(items.filter((item) => !item.is_read).length);
        setError(null);
      },
      (loadError) => {
        console.error('Error fetching notifications:', loadError);
        setError(loadError.message);
      },
    );
  }, [user]);

  const markAsRead = async () => {
    if (!user) return;

    try {
      await markNotificationsRead(user.id);
      setUnreadCount(0);
      setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
    } catch (error: unknown) {
      console.error('Error marking notifications as read:', error);
      setError(error instanceof Error ? error.message : 'Could not update notifications.');
    }
  };

  const markAsReadAndClose = async (notification: Notification) => {
    setIsOpen(false);
    if (!user || notification.is_read) return;
    setNotifications((items) => items.map((item) =>
      item.id === notification.id ? { ...item, is_read: true } : item,
    ));
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await markNotificationRead(user.id, notification.id);
    } catch (error: unknown) {
      console.error('Error marking notification as read:', error);
      setNotifications((items) => items.map((item) =>
        item.id === notification.id ? { ...item, is_read: false } : item,
      ));
      setUnreadCount((count) => count + 1);
      setError(error instanceof Error ? error.message : 'Could not update notification.');
    }
  };

  const getNotificationLink = (notification: Notification) => {
    const target = notification.comment_id
      ? `comment-${notification.comment_id}`
      : `post-${notification.post_id}`;
    return notification.post_id ? `/social#${target}` : '/social';
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return `liked your post.`
      case 'comment':
        return notification.content
          ? `commented on your post: “${notification.content}”`
          : 'commented on your post.'
      case 'like_comment':
        return `liked your comment.`
      case 'reply':
        return notification.content
          ? `replied to your comment: “${notification.content}”`
          : 'replied to your comment.'
      default:
        return 'sent you a notification.'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={isOpen}
      >
        <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs font-semibold leading-5 text-white ring-2 ring-white dark:ring-gray-800">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold">Notifications</h3>
            {unreadCount > 0 && 
              <button onClick={markAsRead} className="text-sm text-blue-500 hover:underline">Mark all as read</button>
            }
          </div>
          {error && <p className="p-3 text-sm text-red-600" role="alert">{error}</p>}
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {notifications.map(notification => (
              <Link key={notification.id} href={getNotificationLink(notification)} onClick={() => void markAsReadAndClose(notification)}>
                <div className={`p-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <div className="flex items-start">
                    <img src={notification.sender.avatar_url || '/user.svg'} alt={notification.sender.full_name || 'User'} className="w-8 h-8 rounded-full mr-3"/>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-bold">{notification.sender.full_name || notification.sender.username || 'Someone'}</span>{' '}
                        <span>{getNotificationMessage(notification)}</span>
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