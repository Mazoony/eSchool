'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';

interface LessonSummary {
  id: string;
  title: string;
  created_at: string | null;
}

interface ProfileClientProps {
  profile: {
    id: string;
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  isOwnProfile: boolean;
  currentUserId?: string | null;
  currentUserEmail?: string | null;
  lessonCount: number;
  recentLessons: LessonSummary[];
}

const normalizeAvatarDisplay = (url?: string | null, fullName?: string | null) => {
  if (!url) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=0D8ABC&color=fff&size=256`;
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=0D8ABC&color=fff&size=256`;
};

export default function ProfileClient({
  profile,
  isOwnProfile,
  currentUserId,
  currentUserEmail,
  lessonCount,
  recentLessons,
}: ProfileClientProps) {
  const [username, setUsername] = useState(profile.username || '');
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const avatarSrc = normalizeAvatarDisplay(avatarUrl, fullName || profile.username || 'User');

  const handleSave = async () => {
    if (!isOwnProfile || !currentUserId) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    const updates: Record<string, unknown> = {
      username: cleanUsername || null,
      full_name: fullName.trim() || null,
      bio: bio.trim() || null,
    };

    if (cleanUsername) {
      const { data: existingUser, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (usernameError) {
        setError(usernameError.message);
        setSaving(false);
        return;
      }

      if (existingUser && existingUser.id !== currentUserId) {
        setError('This username is already taken. Please choose another one.');
        setSaving(false);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUserId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(false);
    setMessage('Profile updated successfully.');
    router.refresh();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length || !isOwnProfile || !currentUserId) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `avatar.${fileExt}`;
    const filePath = `${currentUserId}/${fileName}`;

    setUploading(true);
    setProgress(10);
    setError(null);
    setMessage(null);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(50);
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      setError('Could not get avatar URL for the uploaded file.');
      setUploading(false);
      setProgress(0);
      return;
    }

    const publicUrl = urlData.publicUrl;
    setAvatarUrl(publicUrl);
    setProgress(75);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', currentUserId);

    if (updateError) {
      setError(`Failed to save avatar: ${updateError.message}`);
      setUploading(false);
      setProgress(0);
      return;
    }

    setUploading(false);
    setProgress(100);
    setMessage('Avatar updated successfully.');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 text-center">
            <div className="relative mx-auto w-36 h-36 mb-5 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl">
              <Image src={avatarSrc} alt="Profile Avatar" fill style={{ objectFit: 'cover' }} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.full_name || 'Unnamed User'}</h1>
            {profile.username && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">@{profile.username}</p>}
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{profile.bio || 'No bio yet. Add one to tell people what you are learning.'}</p>
            {isOwnProfile && (
              <div className="mt-6 flex flex-col gap-3">
                <label className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer transition">
                  Upload Avatar
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
                <button
                  type="button"
                  onClick={() => setEditing((current) => !current)}
                  className="rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 transition"
                >
                  {editing ? 'Cancel edit' : 'Edit profile'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Lessons created</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{lessonCount}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Last updated</p>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Account</p>
              <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {isOwnProfile && currentUserEmail && (
                  <div>
                    <span className="font-semibold">Email:</span> {currentUserEmail}
                  </div>
                )}
                {profile.created_at && (
                  <div>
                    <span className="font-semibold">Joined:</span> {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                )}
                <div>
                  <span className="font-semibold">User ID:</span> {profile.id}
                </div>
              </div>
            </div>
          </div>
        </div>

        {editing && isOwnProfile && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Edit profile</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Username</label>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Choose a unique username"
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Lowercase, no spaces, and must be unique.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Full name</label>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900 transition"
                >
                  Cancel
                </button>
              </div>
              {message && <p className="text-sm text-green-500">{message}</p>}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Recent lessons</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lessons created by this user.</p>
            </div>
            <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 text-sm font-semibold">{lessonCount}</span>
          </div>

          {recentLessons.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No lessons created yet.</p>
          ) : (
            <ul className="space-y-4">
              {recentLessons.map((lesson) => (
                <li key={lesson.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 transition">
                  <a href={`/lessons/${lesson.id}`} className="block text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300">
                    {lesson.title}
                  </a>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Created {lesson.created_at ? new Date(lesson.created_at).toLocaleDateString() : 'unknown'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
