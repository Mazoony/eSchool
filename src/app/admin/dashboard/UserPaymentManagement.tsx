'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type PaymentStatus = 'not-paid' | 'paid';

interface UserPayment {
  user_id: string;
  email: string | null;
  full_name: string | null;
  payment_status: PaymentStatus;
  created_at: string;
}

export default function UserPaymentManagement() {
  const [users, setUsers] = useState<UserPayment[]>([]);
  const [draftStatuses, setDraftStatuses] = useState<Record<string, PaymentStatus>>({});
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await createClient().rpc('get_admin_user_payment_statuses');
      if (queryError) throw new Error(queryError.message);
      setUsers((data ?? []) as UserPayment[]);
      setDraftStatuses({});
    } catch (loadError: unknown) {
      console.error('Could not load user payment statuses:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Could not load user payment statuses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const client = createClient();
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        refreshTimeout = null;
        void loadUsers();
      }, 200);
    };
    const channel = client
      .channel('admin-user-payment-statuses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_payment_status' }, scheduleRefresh)
      .subscribe((status, channelError) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          const details = channelError?.message ?? `Realtime subscription failed: ${status}`;
          console.error('Could not subscribe to user payment updates:', details);
          setError(`Live payment updates unavailable: ${details}`);
        }
      });

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      void client.removeChannel(channel);
    };
  }, [loadUsers]);

  const saveStatus = async (userId: string) => {
    const status = draftStatuses[userId];
    if (!status) return;

    setSavingUserId(userId);
    setError(null);
    setMessage(null);
    try {
      const { error: updateError } = await createClient().rpc('set_admin_user_payment_status', {
        target_user_id: userId,
        new_status: status,
      });
      if (updateError) throw new Error(updateError.message);
      setUsers((current) => current.map((user) => (
        user.user_id === userId ? { ...user, payment_status: status } : user
      )));
      setDraftStatuses((current) => {
        const next = { ...current };
        delete next[userId];
        return next;
      });
      setMessage('Payment status updated.');
    } catch (saveError: unknown) {
      console.error('Could not update user payment status:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Could not update payment status.');
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <section aria-labelledby="user-payments-heading" className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="user-payments-heading" className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            User payments
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            New and existing users default to not-paid. Only the site admin can change these labels.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadUsers()}
          disabled={loading}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          {loading ? 'Loading...' : 'Refresh users'}
        </button>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200" role="alert">{error}</p>}
      {message && <p className="mb-4 text-sm text-green-700 dark:text-green-300" role="status">{message}</p>}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">User</th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">Registered</th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">Payment status</th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700" aria-busy={loading}>
            {users.map((user) => {
              const draft = draftStatuses[user.user_id] ?? user.payment_status;
              return (
                <tr key={user.user_id}>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <span className="block font-medium">{user.full_name || 'Unnamed user'}</span>
                    <span className="block text-gray-600 dark:text-gray-300">{user.email || 'No email available'}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`payment-status-${user.user_id}`}>
                      Payment status for {user.email || user.full_name || 'user'}
                    </label>
                    <select
                      id={`payment-status-${user.user_id}`}
                      value={draft}
                      onChange={(event) => setDraftStatuses((current) => ({
                        ...current,
                        [user.user_id]: event.target.value as PaymentStatus,
                      }))}
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="not-paid">not-paid</option>
                      <option value="paid">paid</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void saveStatus(user.user_id)}
                      disabled={savingUserId === user.user_id || draft === user.payment_status}
                      className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingUserId === user.user_id ? 'Saving...' : 'Save'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-300">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && users.length === 0 && <p className="p-6 text-center text-sm text-gray-600 dark:text-gray-300" role="status">Loading users...</p>}
      </div>
    </section>
  );
}
