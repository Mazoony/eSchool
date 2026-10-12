import { RealtimeChannel } from '@supabase/supabase-js';
import { Comment, Like, Notification, Post, Profile, Reply } from '@/app/types';
import { createClient } from './client';
import { isGradeId } from '@/app/lessons/curriculum';

type Row = Record<string, unknown>;

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const asIsoString = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString();
  return typeof value === 'string' ? value : new Date(0).toISOString();
};

const emptyProfile = (id: string): Profile => ({
  id,
  username: null,
  full_name: 'Unknown user',
  avatar_url: null,
  bio: null,
  is_paid: false,
  preferred_grade: null,
});

function profileFromRow(row: Row): Profile {
  return {
    id: asString(row.id),
    username: typeof row.username === 'string' ? row.username : null,
    full_name: typeof row.full_name === 'string' ? row.full_name : null,
    avatar_url: typeof row.avatar_url === 'string' ? row.avatar_url : null,
    cover_url: typeof row.cover_url === 'string' ? row.cover_url : null,
    bio: typeof row.bio === 'string' ? row.bio : null,
    preferred_grade: typeof row.preferred_grade === 'string' && isGradeId(row.preferred_grade)
      ? row.preferred_grade
      : null,
    is_paid: row.is_paid === true,
    created_at: typeof row.created_at === 'string' ? row.created_at : null,
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : null,
  };
}

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await createClient()
    .from('profiles')
    .select('id, username, full_name, avatar_url, cover_url, bio, is_paid, preferred_grade, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();
  throwIfError(error);
  return data ? profileFromRow(data) : null;
}

export async function ensureProfile(
  userId: string,
  metadata?: Record<string, unknown>,
): Promise<Profile> {
  const existing = await getProfile(userId);
  if (existing) return existing;

  const profile: Profile = {
    id: userId,
    username: null,
    full_name: asString(metadata?.full_name, asString(metadata?.name)) || null,
    avatar_url: asString(metadata?.avatar_url, asString(metadata?.picture)) || null,
    bio: null,
    preferred_grade: typeof metadata?.preferred_grade === 'string' && isGradeId(metadata.preferred_grade)
      ? metadata.preferred_grade
      : null,
  };
  const { error } = await createClient().from('profiles').upsert(profile, { onConflict: 'id' });
  throwIfError(error);
  return profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'username' | 'full_name' | 'bio' | 'preferred_grade'>>,
): Promise<void> {
  if (updates.preferred_grade && !isGradeId(updates.preferred_grade)) {
    throw new Error('Select a valid learning path.');
  }

  const profileUpdates: Record<string, string | null> = { updated_at: new Date().toISOString() };
  if ('username' in updates) {
    const username = updates.username?.trim().toLowerCase() || null;
    if (username && !/^[a-z0-9_]{3,20}$/.test(username)) {
      throw new Error('Username must be 3-20 characters and contain only lowercase letters, numbers, or underscores.');
    }
    profileUpdates.username = username;
  }
  if ('full_name' in updates) profileUpdates.full_name = updates.full_name?.trim() || null;
  if ('bio' in updates) profileUpdates.bio = updates.bio?.trim() || null;
  if ('preferred_grade' in updates) profileUpdates.preferred_grade = updates.preferred_grade ?? null;

  const { data, error } = await createClient()
    .from('profiles')
    .update(profileUpdates)
    .eq('id', userId)
    .select('id')
    .maybeSingle();
  throwIfError(error);
  if (!data) throw new Error('Could not find your profile to update.');
}

export async function uploadProfileAvatar(userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${userId}/avatar.${extension}`;
  const client = createClient();
  const { error: uploadError } = await client.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  throwIfError(uploadError);

  const { data } = client.storage.from('avatars').getPublicUrl(path);
  if (!data.publicUrl) throw new Error('Could not get the uploaded avatar URL.');

  const { error: profileError } = await client
    .from('profiles')
    .update({ avatar_url: data.publicUrl, updated_at: new Date().toISOString() })
    .eq('id', userId);
  throwIfError(profileError);
  return data.publicUrl;
}

export async function uploadProfileCover(userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/cover.${extension}`;
  const client = createClient();
  const { error: uploadError } = await client.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
  throwIfError(uploadError);

  const { data } = client.storage.from('avatars').getPublicUrl(path);
  if (!data.publicUrl) throw new Error('Could not get the uploaded cover photo URL.');

  const coverUrl = `${data.publicUrl}?v=${Date.now()}`;
  const { error: profileError } = await client
    .from('profiles')
    .update({ cover_url: coverUrl, updated_at: new Date().toISOString() })
    .eq('id', userId);
  throwIfError(profileError);
  return coverUrl;
}

async function loadPosts(postId?: string, authorId?: string): Promise<Post[]> {
  const client = createClient();
  let postsQuery = client
    .from('posts')
    .select('id, content, user_id, created_at, lesson_submission_id')
    .order('created_at', { ascending: false });
  if (postId) postsQuery = postsQuery.eq('id', postId);
  if (authorId) postsQuery = postsQuery.eq('user_id', authorId);

  const { data: postRows, error: postsError } = await postsQuery;
  throwIfError(postsError);
  if (!postRows?.length) return [];

  const postIds = postRows.map((row) => row.id);
  const userIds = [...new Set(postRows.map((row) => asString(row.user_id)))];
  const [
    { data: profileRows, error: profilesError },
    { data: likeRows, error: likesError },
    { data: commentRows, error: commentsError },
  ] = await Promise.all([
    client.from('profiles').select('id, username, full_name, avatar_url, cover_url, bio, is_paid, created_at, updated_at').in('id', userIds),
    client.from('likes').select('post_id, user_id').in('post_id', postIds),
    client.from('comments').select('id, post_id, parent_id, user_id, content, created_at').in('post_id', postIds).order('created_at'),
  ]);
  throwIfError(profilesError);
  throwIfError(likesError);
  throwIfError(commentsError);

  const commentUserIds = [...new Set((commentRows ?? []).map((row) => asString(row.user_id)))];
  const commentIds = (commentRows ?? []).map((row) => row.id);
  const [{ data: commentProfiles, error: commentProfilesError }, { data: commentLikeRows, error: commentLikesError }] =
    await Promise.all([
      commentUserIds.length
        ? client.from('profiles').select('id, username, full_name, avatar_url, cover_url, bio, is_paid, created_at, updated_at').in('id', commentUserIds)
        : Promise.resolve({ data: [], error: null }),
      commentIds.length
        ? client.from('comment_likes').select('comment_id, user_id').in('comment_id', commentIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
  throwIfError(commentProfilesError);
  throwIfError(commentLikesError);

  const profilesById = new Map<string, Profile>();
  for (const row of [...(profileRows ?? []), ...(commentProfiles ?? [])]) {
    const profile = profileFromRow(row);
    profilesById.set(profile.id, profile);
  }
  const likesByPost = new Map<string, Like[]>();
  for (const row of likeRows ?? []) {
    const key = String(row.post_id);
    likesByPost.set(key, [...(likesByPost.get(key) ?? []), { user_id: asString(row.user_id) }]);
  }
  const commentLikesById = new Map<string, Like[]>();
  for (const row of commentLikeRows ?? []) {
    const key = String(row.comment_id);
    commentLikesById.set(key, [...(commentLikesById.get(key) ?? []), { user_id: asString(row.user_id) }]);
  }

  const commentsByPost = new Map<string, Comment[]>();
  for (const row of commentRows ?? []) {
    const id = String(row.id);
    const userId = asString(row.user_id);
    const comment: Comment = {
      id,
      content: asString(row.content),
      user_id: userId,
      commenter: profilesById.get(userId) ?? emptyProfile(userId),
      created_at: asIsoString(row.created_at),
      parent_id: row.parent_id == null ? undefined : String(row.parent_id),
      comment_likes: commentLikesById.get(id) ?? [],
      replies: [],
    };
    const postKey = String(row.post_id);
    commentsByPost.set(postKey, [...(commentsByPost.get(postKey) ?? []), comment]);
  }
  for (const [postKey, comments] of commentsByPost) {
    const topLevel = comments.filter((comment) => !comment.parent_id);
    for (const comment of topLevel) {
      comment.replies = comments
        .filter((reply) => reply.parent_id === comment.id)
        .map((reply): Reply => ({
          id: reply.id,
          content: reply.content,
          user_id: reply.user_id,
          commenter: reply.commenter,
          created_at: reply.created_at,
          parent_id: comment.id,
        }));
    }
    commentsByPost.set(postKey, topLevel);
  }

  return postRows.map((row) => {
    const id = String(row.id);
    const authorId = asString(row.user_id);
    return {
      id,
      content: asString(row.content),
      user_id: authorId,
      lesson_submission_id: typeof row.lesson_submission_id === 'string' ? row.lesson_submission_id : null,
      author: profilesById.get(authorId) ?? emptyProfile(authorId),
      created_at: asIsoString(row.created_at),
      comments: commentsByPost.get(id) ?? [],
      likes: likesByPost.get(id) ?? [],
    };
  });
}

export function getPosts(): Promise<Post[]> {
  return loadPosts();
}

export async function getPost(postId: string): Promise<Post | null> {
  return (await loadPosts(postId))[0] ?? null;
}

export function subscribeUserPosts(
  userId: string,
  onPosts: (posts: Post[]) => void,
  onError: (error: Error) => void,
): () => void {
  const refresh = () => {
    void loadPosts(undefined, userId).then(onPosts).catch((error: unknown) => onError(asError(error)));
  };
  refresh();
  return subscribeToTables(`profile-posts-${userId}`, ['posts', 'comments', 'likes', 'comment_likes', 'profiles'], refresh, onError);
}

function subscribeToTables(
  channelName: string,
  tables: string[],
  refresh: () => void,
  onError: (error: Error) => void,
): () => void {
  const client = createClient();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const channel: RealtimeChannel = client.channel(channelName);
  for (const table of tables) {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(refresh, 100);
    });
  }
  channel.subscribe((status, error) => {
    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      onError(error ?? new Error(`Realtime subscription failed: ${status}`));
    }
  });
  return () => {
    if (timer) clearTimeout(timer);
    void client.removeChannel(channel);
  };
}

export function subscribePosts(
  onPosts: (posts: Post[]) => void,
  onError: (error: Error) => void,
): () => void {
  const refresh = () => {
    void getPosts().then(onPosts).catch((error: unknown) => onError(asError(error)));
  };
  refresh();
  return subscribeToTables('social-feed', ['posts', 'comments', 'likes', 'comment_likes', 'profiles'], refresh, onError);
}

export function subscribePost(
  postId: string,
  onPost: (post: Post | null) => void,
  onError: (error: Error) => void,
): () => void {
  const refresh = () => {
    void getPost(postId).then(onPost).catch((error: unknown) => onError(asError(error)));
  };
  refresh();
  return subscribeToTables(`post-${postId}`, ['posts', 'comments', 'likes', 'comment_likes', 'profiles'], refresh, onError);
}

export async function createPost(content: string, userId: string): Promise<void> {
  const { error } = await createClient().from('posts').insert({ content: content.trim(), user_id: userId });
  throwIfError(error);
}

export async function createComment(
  post: Post,
  userId: string,
  content: string,
  parentId?: string,
): Promise<void> {
  const { error } = await createClient()
    .from('comments')
    .insert({
      content: content.trim(),
      post_id: Number(post.id),
      user_id: userId,
      parent_id: parentId ? Number(parentId) : null,
    });
  throwIfError(error);
}

export async function removePost(postId: string): Promise<void> {
  const { error } = await createClient().from('posts').delete().eq('id', Number(postId));
  throwIfError(error);
}

export async function removeComment(postId: string, commentId: string): Promise<void> {
  const { error } = await createClient().from('comments').delete().eq('id', Number(commentId)).eq('post_id', Number(postId));
  throwIfError(error);
}

export async function togglePostLike(postId: string, userId: string): Promise<void> {
  const client = createClient();
  const { data: existing, error: readError } = await client.from('likes').select('id').eq('post_id', Number(postId)).eq('user_id', userId).maybeSingle();
  throwIfError(readError);
  if (existing) {
    const { error } = await client.from('likes').delete().eq('id', existing.id);
    throwIfError(error);
    return;
  }
  const { error } = await client.from('likes').insert({ post_id: Number(postId), user_id: userId });
  throwIfError(error);
}

export async function toggleCommentLike(commentId: string, userId: string): Promise<void> {
  const client = createClient();
  const { data: existing, error: readError } = await client.from('comment_likes').select('id').eq('comment_id', Number(commentId)).eq('user_id', userId).maybeSingle();
  throwIfError(readError);
  if (existing) {
    const { error } = await client.from('comment_likes').delete().eq('id', existing.id);
    throwIfError(error);
    return;
  }
  const { error } = await client.from('comment_likes').insert({ comment_id: Number(commentId), user_id: userId });
  throwIfError(error);
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await createClient()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  throwIfError(error);
  const senderIds = [...new Set((data ?? []).map((row) => asString(row.triggered_by_user_id)))];
  const { data: profiles, error: profilesError } = senderIds.length
    ? await createClient().from('profiles').select('id, username, full_name, avatar_url, cover_url, bio, is_paid').in('id', senderIds)
    : { data: [], error: null };
  throwIfError(profilesError);
  const profilesById = new Map((profiles ?? []).map((row) => {
    const profile = profileFromRow(row);
    return [profile.id, profile];
  }));

  return (data ?? []).map((row) => {
    const senderId = asString(row.triggered_by_user_id);
    return {
      id: String(row.id),
      created_at: asIsoString(row.created_at),
      recipient_user_id: asString(row.user_id),
      sender_user_id: senderId,
      type: asString(row.type),
      post_id: row.post_id == null ? '' : String(row.post_id),
      comment_id: row.comment_id == null ? undefined : String(row.comment_id),
      content: typeof row.content === 'string' ? row.content : null,
      is_read: row.is_read === true,
      sender: profilesById.get(senderId) ?? emptyProfile(senderId),
    };
  });
}

export function subscribeNotifications(
  userId: string,
  onNotifications: (notifications: Notification[]) => void,
  onError: (error: Error) => void,
): () => void {
  const refresh = () => {
    void getNotifications(userId).then(onNotifications).catch((error: unknown) => onError(asError(error)));
  };
  refresh();
  const client = createClient();
  const channel = client
    .channel(`notifications-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, refresh)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, refresh)
    .subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        onError(error ?? new Error(`Notification subscription failed: ${status}`));
      }
    });
  return () => { void client.removeChannel(channel); };
}

export async function markNotificationsRead(userId: string): Promise<void> {
  const { error } = await createClient()
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  throwIfError(error);
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  const { error } = await createClient()
    .from('notifications')
    .update({ is_read: true })
    .eq('id', Number(notificationId))
    .eq('user_id', userId);
  throwIfError(error);
}

export async function getUserCount(): Promise<number> {
  const { count, error } = await createClient().from('profiles').select('id', { count: 'exact', head: true });
  throwIfError(error);
  return count ?? 0;
}

export function subscribeUserCount(
  onCount: (count: number) => void,
  onError: (error: Error) => void,
): () => void {
  const client = createClient();
  let active = true;
  const refresh = () => {
    void getUserCount()
      .then((count) => { if (active) onCount(count); })
      .catch((error: unknown) => onError(asError(error)));
  };
  refresh();
  const channel = client
    .channel('registered-users')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, refresh)
    .subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        onError(error ?? new Error(`User count subscription failed: ${status}`));
      }
    });
  return () => {
    active = false;
    void client.removeChannel(channel);
  };
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
