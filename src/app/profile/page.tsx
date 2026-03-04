'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string, avatar_url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setUploading(true);

    // Upload the file to Supabase Storage
    let { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      setUploading(false);
      return;
    }

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update the user's profile with the new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user!.id);

    if (updateError) {
      console.error('Error updating profile with new avatar:', updateError);
    } else {
      // Update the profile state to reflect the change immediately
      setProfile(prevProfile => prevProfile ? { ...prevProfile, avatar_url: publicUrl } : { full_name: '', avatar_url: publicUrl });
    }

    setUploading(false);
  };

  if (loading) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center p-8">Please sign in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center sm:flex-row">
            <div className="relative mb-4 sm:mb-0 sm:mr-6">
              <img 
                src={profile?.avatar_url || 'https://i.pravatar.cc/150'} 
                alt="Profile Avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
              />
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-transform duration-300 transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{profile?.full_name || 'Name not set'}</h1>
              <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
            </div>
          </div>
          {uploading && <div className="mt-4 text-center text-blue-500">Uploading...</div>}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Account Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email address</p>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
              <p className="text-lg font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded p-2 text-sm">{user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
