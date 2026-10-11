'use client';

import { useState, useEffect, useRef } from 'react';
import { markNotificationRead, markNotificationsRead, subscribeNotifications } from '@/utils/supabase/data';
import { useAuth } from '../AuthContext';
import { Notification } from '../types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  BellIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CreditCardIcon,
  HeartIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import PaidBadge from './PaidBadge';

export default function Notifications() {
  const { user } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
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

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

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
    if (notification.type === 'payment') {
      return `/profile/${notification.recipient_user_id}`;
    }
    if (notification.type === 'follow') {
      return `/profile/${notification.sender_user_id}`;
    }
    const target = notification.comment_id
      ? `comment-${notification.comment_id}`
      : `post-${notification.post_id}`;
    return notification.post_id ? `/social#${target}` : '/social';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
      case 'like_comment':
        return <HeartIcon className="h-4 w-4" aria-hidden="true" />;
      case 'comment':
      case 'reply':
        return <ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4" aria-hidden="true" />;
      case 'follow':
        return <UserPlusIcon className="h-4 w-4" aria-hidden="true" />;
      case 'payment':
        return <CreditCardIcon className="h-4 w-4" aria-hidden="true" />;
      default:
        return <BellIcon className="h-4 w-4" aria-hidden="true" />;
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post.';
      case 'comment':
        return notification.content
          ? `commented on your post: “${notification.content}”`
          : 'commented on your post.';
      case 'like_comment':
        return 'liked your comment.';
      case 'reply':
        return notification.content
          ? `replied to your comment: “${notification.content}”`
          : 'replied to your comment.';
      case 'follow':
        return 'started following you.';
      case 'payment':
        return notification.content || 'confirmed your payment.';
      default:
        return 'sent you a notification.';
    }
  };

  const visibleNotifications = showUnreadOnly
    ? notifications.filter((notification) => !notification.is_read)
    : notifications;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-gray-700"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="notifications-panel"
      >
        <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs font-semibold leading-5 text-white ring-2 ring-white dark:ring-gray-800" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <section
          id="notifications-panel"
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-3 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
            {unreadCount > 0 && (
              <button
                onClick={markAsRead}
                className="rounded-lg px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="flex gap-2 px-4 pb-3">
            <button
              onClick={() => setShowUnreadOnly(false)}
              aria-pressed={!showUnreadOnly}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                !showUnreadOnly
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setShowUnreadOnly(true)}
              aria-pressed={showUnreadOnly}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                showUnreadOnly
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Unread
            </button>
          </div>
          {error && <p className="px-5 pb-3 text-sm text-red-600" role="alert">{error}</p>}
          <div className="max-h-[min(28rem,65vh)] overflow-y-auto px-2 pb-2">
            {visibleNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={getNotificationLink(notification)}
                onClick={() => void markAsReadAndClose(notification)}
                className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:hover:bg-gray-700 ${
                  !notification.is_read ? 'bg-blue-50/80 dark:bg-blue-900/20' : ''
                }`}
              >
                <span className="relative mt-0.5 shrink-0">
                  <img
                    src={notification.sender.avatar_url || '/user.svg'}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-white dark:ring-gray-800">
                    {getNotificationIcon(notification.type)}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-5 text-gray-800 dark:text-gray-100">
                    <span className="inline font-bold">
                      {notification.sender.full_name || notification.sender.username || 'Someone'}
                    </span>{' '}
                    <span>{getNotificationMessage(notification)}</span>
                    {notification.sender.is_paid && (
                      <span className="ml-1 inline-flex align-middle">
                        <PaidBadge isPaid />
                      </span>
                    )}
                  </span>
                  <span className={`mt-1 block text-xs font-semibold ${
                    !notification.is_read ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </span>
                {!notification.is_read && (
                  <span className="mt-5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />
                )}
              </Link>
            ))}
            {visibleNotifications.length === 0 && (
              <div className="px-5 py-10 text-center">
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {showUnreadOnly ? 'You’re all caught up' : 'No notifications yet'}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {showUnreadOnly ? 'You have no unread notifications.' : 'New activity will show up here.'}
                </p>
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <Link
              href="/social"
              onClick={() => setIsOpen(false)}
              className="block border-t border-gray-200 px-4 py-3 text-center text-sm font-semibold text-blue-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-700"
            >
              Go to your feed
            </Link>
          )}
        </section>
      )}
    </div>
  );
}