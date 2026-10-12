'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { subscribeUserPosts, updateProfile, uploadProfileAvatar, uploadProfileCover } from '@/utils/supabase/data';
import { Post } from '../../types';
import PostItem from '../../components/PostItem';
import CreatePost from '../../components/CreatePost';
import PaidBadge from '../../components/PaidBadge';
import ExpandableText from '../../components/ExpandableText';

interface ProfileClientProps {
  profile: {
    id: string;
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    cover_url?: string | null;
    bio?: string | null;
    is_paid?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
  };
  isOwnProfile: boolean;
  currentUserId?: string | null;
  currentUserEmail?: string | null;
  createdFallbackProfile?: boolean;
}

export default function ProfileClient({
  profile,
  isOwnProfile,
  currentUserId,
  currentUserEmail,
  createdFallbackProfile,
}: ProfileClientProps) {
  const profileFormId = useId().replace(/:/g, '');
  const [username, setUsername] = useState(profile.username || '');
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [coverUrl, setCoverUrl] = useState(profile.cover_url || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const avatarSrc = avatarUrl || '/user.svg';

  useEffect(() => subscribeUserPosts(
    profile.id,
    (userPosts) => {
      setPosts(userPosts);
      setPostsLoading(false);
      setPostsError(null);
    },
    (loadError) => {
      console.error('Failed to load profile posts:', loadError);
      setPostsError(loadError.message);
      setPostsLoading(false);
    },
  ), [profile.id]);

  const handleSave = async () => {
    if (!isOwnProfile || !currentUserId) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername && !/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      setError('Username must be 3-20 characters and contain only lowercase letters, numbers, or underscores.');
      setSaving(false);
      return;
    }

    try {
      await updateProfile(currentUserId, {
        username: cleanUsername || null,
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
      });
      setMessage('Profile updated successfully.');
      setSaving(false);
      setEditing(false);
    } catch (updateError: unknown) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update profile.');
      setSaving(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !isOwnProfile || !currentUserId) return;

    const file = event.target.files[0];
    event.target.value = '';
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Choose a PNG, JPEG, WebP, or GIF image that is 5 MB or smaller.');
      return;
    }

    setAvatarUploading(true);
    setError(null);
    setMessage(null);

    try {
      const publicUrl = await uploadProfileAvatar(currentUserId, file);
      setAvatarUrl(publicUrl);
      setAvatarUploading(false);
      setMessage('Avatar updated successfully.');
      setTimeout(() => setMessage(null), 3000);
    } catch (uploadError: unknown) {
      setError(`Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error.'}`);
      setAvatarUploading(false);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !isOwnProfile || !currentUserId) return;

    const file = event.target.files[0];
    event.target.value = '';
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Choose a PNG, JPEG, WebP, or GIF cover image that is 5 MB or smaller.');
      return;
    }

    setCoverUploading(true);
    setError(null);
    setMessage(null);
    try {
      const publicUrl = await uploadProfileCover(currentUserId, file);
      setCoverUrl(publicUrl);
      setMessage('Cover photo updated successfully.');
    } catch (uploadError: unknown) {
      console.error('Failed to upload profile cover photo:', uploadError);
      setError(`Cover photo upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error.'}`);
    } finally {
      setCoverUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
          <div className="relative h-36 bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 sm:h-56">
            {coverUrl ? (
              <Image src={coverUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/25 via-transparent to-transparent" />
            )}
            {isOwnProfile && (
              <label className="absolute bottom-3 right-3 cursor-pointer rounded-lg bg-gray-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-black focus-within:ring-2 focus-within:ring-white">
                {coverUploading ? 'Uploading cover…' : coverUrl ? 'Change cover photo' : 'Add cover photo'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleCoverUpload}
                  className="sr-only"
                  disabled={coverUploading}
                  aria-label="Upload a cover photo"
                />
              </label>
            )}
          </div>
          <div className="px-5 pb-5 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="relative -mt-14 h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg dark:border-gray-800 dark:bg-gray-700 sm:-mt-20 sm:h-40 sm:w-40">
                <Image src={avatarSrc} alt={`${fullName || 'User'}'s profile picture`} fill sizes="(max-width: 640px) 112px, 160px" className="object-cover" priority />
              </div>
              {isOwnProfile && (
                <div className="flex flex-wrap gap-2 pb-1">
                  <label className="cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 focus-within:ring-2 focus-within:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
                    {avatarUploading ? 'Uploading…' : 'Change photo'}
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleUpload} className="sr-only" disabled={avatarUploading} aria-label="Upload a new profile picture" />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('about');
                      setEditing((current) => !current);
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {editing ? 'Cancel edit' : 'Edit profile'}
                  </button>
                </div>
              )}
            </div>
            <div className="mt-3">
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {fullName || 'Unnamed User'}
                <PaidBadge isPaid={profile.is_paid} />
              </h1>
              {username && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">@{username}</p>}
              {bio && (
                <ExpandableText
                  text={bio}
                  className="mt-3 max-w-2xl text-sm text-gray-700 dark:text-gray-300"
                />
              )}
              {createdFallbackProfile && isOwnProfile && (
                <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">Your profile is ready. Add a username and bio to help classmates find you.</p>
              )}
            </div>
            <div className="mt-5 flex gap-6 border-t border-gray-200 pt-4 text-sm dark:border-gray-700">
              <span><strong>{posts.length}</strong> <span className="text-gray-500 dark:text-gray-400">posts</span></span>
              {profile.created_at && <span className="text-gray-500 dark:text-gray-400">Joined {new Date(profile.created_at).toLocaleDateString()}</span>}
            </div>
            <div className="-mb-5 mt-4 flex gap-6 border-t border-gray-200 dark:border-gray-700" role="tablist" aria-label="Profile sections">
              {(['posts', 'about'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`${profileFormId}-tab-${tab}`}
                  tabIndex={activeTab === tab ? 0 : -1}
                  aria-selected={activeTab === tab}
                  aria-controls={`${profileFormId}-panel`}
                  onClick={() => setActiveTab(tab)}
                  onKeyDown={(event) => {
                    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                    event.preventDefault();
                    const nextTab = tab === 'posts' ? 'about' : 'posts';
                    setActiveTab(nextTab);
                    event.currentTarget.parentElement
                      ?.querySelector<HTMLButtonElement>(`#${profileFormId}-tab-${nextTab}`)
                      ?.focus();
                  }}
                  className={`border-b-2 px-1 py-4 text-sm font-semibold capitalize transition ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {message && <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300" role="status">{message}</p>}
        {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300" role="alert">{error}</p>}

        {editing && isOwnProfile && (
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Edit profile</h2>
            <div className="grid gap-4">
              <div>
                <label htmlFor={`${profileFormId}-username`} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Username</label>
                <input
                  id={`${profileFormId}-username`}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Choose a unique username"
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-describedby={`${profileFormId}-username-description`}
                />
                <p id={`${profileFormId}-username-description`} className="mt-2 text-xs text-gray-600 dark:text-gray-300">Lowercase, no spaces, and must be unique.</p>
              </div>
              <div>
                <label htmlFor={`${profileFormId}-full-name`} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Full name</label>
                <input
                  id={`${profileFormId}-full-name`}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`${profileFormId}-bio`} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Bio</label>
                <textarea
                  id={`${profileFormId}-bio`}
                  value={bio}
                  onChange={(event) => setBio(event.target.value.slice(0, 280))}
                  rows={4}
                  maxLength={280}
                  aria-describedby={`${profileFormId}-bio-character-count`}
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p id={`${profileFormId}-bio-character-count`} className="mt-1 text-right text-xs text-gray-600 dark:text-gray-300">{bio.length}/280</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername(profile.username || '');
                    setFullName(profile.full_name || '');
                    setBio(profile.bio || '');
                    setEditing(false);
                    setError(null);
                  }}
                  className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        <div id={`${profileFormId}-panel`} role="tabpanel" aria-labelledby={`${profileFormId}-tab-${activeTab}`} tabIndex={0}>
        {activeTab === 'posts' ? (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.8fr),minmax(0,1.4fr)]">
            <section className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
              <h2 className="text-lg font-bold">About</h2>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{bio || 'No bio yet.'}</p>
              {profile.created_at && (
                <p className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>
              )}
            </section>
            <section className="min-w-0 space-y-4" aria-label={`${profile.full_name || 'User'}'s posts`}>
              {isOwnProfile && <CreatePost />}
              {postsError && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300" role="alert">{postsError}</p>}
              {postsLoading ? (
                <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400" role="status">Loading posts…</p>
              ) : posts.length ? (
                posts.map((post) => (
                  <PostItem key={post.id} post={post} onDelete={(postId) => setPosts((items) => items.filter((item) => item.id !== postId))} />
                ))
              ) : (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
                  <h2 className="font-semibold">No posts yet</h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{isOwnProfile ? 'Share a thought or lesson answer with your classmates.' : 'When this student shares something, it will appear here.'}</p>
                </div>
              )}
            </section>
          </div>
        ) : (
          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h2 className="text-lg font-bold">About {isOwnProfile ? 'you' : fullName || 'this student'}</h2>
            <dl className="mt-5 divide-y divide-gray-200 text-sm dark:divide-gray-700">
              <div className="py-4">
                <dt className="font-semibold text-gray-900 dark:text-white">Bio</dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-300">{bio || 'No bio added yet.'}</dd>
              </div>
              {profile.created_at && (
                <div className="py-4">
                  <dt className="font-semibold text-gray-900 dark:text-white">Joined eSchool</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-300">{new Date(profile.created_at).toLocaleDateString()}</dd>
                </div>
              )}
              {isOwnProfile && currentUserEmail && (
                <div className="py-4">
                  <dt className="font-semibold text-gray-900 dark:text-white">Email</dt>
                  <dd className="mt-1 text-gray-600 dark:text-gray-300">{currentUserEmail}</dd>
                </div>
              )}
            </dl>
          </section>
        )}
        </div>
      </div>
    </main>
  );
}
