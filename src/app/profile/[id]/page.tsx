
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../AuthContext';
import { supabase } from '../../supabase';
import Image from 'next/image';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
}

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase()
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setProfile(data as Profile);
        setIsOwnProfile(user?.id === id);
      }
      setLoading(false);
    };

    if (id) {
      fetchProfile();
    }
  }, [id, user]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !isOwnProfile || !user) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccessMessage(null);

    setProgress(10);
    const { error: uploadError } = await supabase().storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      setError(`Failed to upload avatar: ${uploadError.message}`);
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(50);
    const { data: urlData } = supabase().storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      setError('Could not get public URL for the avatar.');
      setUploading(false);
      setProgress(0);
      return;
    }

    const publicUrl = urlData.publicUrl;

    setProgress(75);
    const { error: updateError } = await supabase()
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      setError(`Failed to save new avatar: ${updateError.message}`);
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(100);
    setProfile(prevProfile => prevProfile ? { ...prevProfile, avatar_url: publicUrl } : { id: '', full_name: '', avatar_url: publicUrl });
    setSuccessMessage('Profile photo updated successfully!');
    setUploading(false);

    setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
      setProgress(0);
    }, 3000);
  };

  if (loading) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center p-8">Profile not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center sm:flex-row">
            <div className="relative mb-4 sm:mb-0 sm:mr-6">
              <Image
                src={profile.avatar_url || 'https://i.pravatar.cc/150'}
                alt="Profile Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                width={128}
                height={128}
              />
              {isOwnProfile && (
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-transform duration-300 transform hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>
            <div className="text-center sm:text-left flex-grow">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{profile.full_name || 'Name not set'}</h1>
              {isOwnProfile && <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{user?.email}</p>}
              
              {(uploading || progress > 0) && (
                <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 my-4">
                  <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${progress}%` }}>
                    {progress}%
                  </div>
                </div>
              )}
              {successMessage && <div className="mt-2 text-center text-green-500">{successMessage}</div>}
              {error && <div className="mt-2 text-center text-red-500">{error}</div>}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Account Details</h2>
          <div className="space-y-4">
            {isOwnProfile && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email address</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{user?.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
              <p className="text-lg font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded p-2 text-sm">{id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
