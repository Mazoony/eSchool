import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  DocumentData,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { getFirebaseServices } from './client';
import { Comment, Like, Notification, Post, Profile, Reply } from '@/app/types';

const asIsoString = (value: unknown): string => {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return new Date(0).toISOString();
};

const profileFromData = (id: string, data: Record<string, unknown>): Profile => ({
  id,
  username: typeof data.username === 'string' ? data.username : null,
  full_name: typeof data.full_name === 'string' ? data.full_name : null,
  avatar_url: typeof data.avatar_url === 'string' ? data.avatar_url : null,
  bio: typeof data.bio === 'string' ? data.bio : null,
  created_at: asIsoString(data.created_at),
  updated_at: asIsoString(data.updated_at),
});

export async function getProfile(userId: string): Promise<Profile | null> {
  const { db } = getFirebaseServices();
  const snapshot = await getDoc(doc(db, 'profiles', userId));
  return snapshot.exists() ? profileFromData(snapshot.id, snapshot.data()) : null;
}

export async function ensureProfile(
  user: FirebaseUser,
  fullName?: string,
): Promise<Profile> {
  const { db } = getFirebaseServices();
  const profileRef = doc(db, 'profiles', user.uid);
  const existing = await getDoc(profileRef);
  const name = fullName || user.displayName || null;
  if (existing.exists()) {
    const data = existing.data();
    if (!data.full_name && name) {
      await updateDoc(profileRef, { full_name: name, updated_at: serverTimestamp() });
      return { ...profileFromData(existing.id, data), full_name: name };
    }
    return profileFromData(existing.id, data);
  }

  const profile: Profile = {
    id: user.uid,
    username: null,
    full_name: name,
    avatar_url: user.photoURL,
    bio: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await setDoc(profileRef, {
    username: null,
    full_name: name,
    avatar_url: user.photoURL,
    bio: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return profile;
}

export async function updateProfile(
  userId: string,
  updates: Pick<Profile, 'username' | 'full_name' | 'bio'>,
): Promise<void> {
  const { db } = getFirebaseServices();
  const profileRef = doc(db, 'profiles', userId);
  const newUsername = updates.username?.trim().toLowerCase() || null;
  if (newUsername && !/^[a-z0-9_]{3,20}$/.test(newUsername)) {
    throw new Error('Username must be 3-20 characters and contain only lowercase letters, numbers, or underscores.');
  }

  await runTransaction(db, async (transaction) => {
    const profileSnapshot = await transaction.get(profileRef);
    if (!profileSnapshot.exists()) {
      throw new Error('Your profile could not be found. Please sign out and back in.');
    }

    const oldUsername = typeof profileSnapshot.data().username === 'string'
      ? profileSnapshot.data().username
      : null;
    const oldUsernameRef = oldUsername ? doc(db, 'usernames', oldUsername) : null;
    const newUsernameRef = newUsername ? doc(db, 'usernames', newUsername) : null;
    const newUsernameSnapshot = newUsernameRef
      ? await transaction.get(newUsernameRef)
      : null;

    if (
      newUsernameSnapshot?.exists() &&
      newUsernameSnapshot.data().uid !== userId
    ) {
      throw new Error('This username is already taken. Please choose another one.');
    }

    if (oldUsernameRef && oldUsername !== newUsername) {
      transaction.delete(oldUsernameRef);
    }
    if (newUsernameRef) {
      transaction.set(newUsernameRef, { uid: userId });
    }
    transaction.update(profileRef, {
      username: newUsername,
      full_name: updates.full_name,
      bio: updates.bio,
      updated_at: serverTimestamp(),
    });
  });
}

const toComment = (
  id: string,
  data: Record<string, unknown>,
  commenter: Profile,
  likes: Like[],
  replies: Reply[],
): Comment => ({
  id,
  content: typeof data.content === 'string' ? data.content : '',
  user_id: typeof data.user_id === 'string' ? data.user_id : '',
  commenter,
  created_at: asIsoString(data.created_at),
  parent_id: typeof data.parent_id === 'string' ? data.parent_id : undefined,
  comment_likes: likes,
  replies,
});

async function fetchComment(
  postId: string,
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Promise<Comment> {
  const { db } = getFirebaseServices();
  const data = snapshot.data();
  const userId = typeof data.user_id === 'string' ? data.user_id : '';
  const commenter = userId
    ? await getProfile(userId)
    : null;
  const [likesSnapshot, repliesSnapshot] = await Promise.all([
    getDocs(collection(db, 'posts', postId, 'comments', snapshot.id, 'likes')),
    getDocs(
      query(
        collection(db, 'posts', postId, 'comments'),
        where('parent_id', '==', snapshot.id),
      ),
    ),
  ]);

  const likes = likesSnapshot.docs.map((like) => ({
    user_id: typeof like.data().user_id === 'string' ? like.data().user_id : like.id,
    comment_id: snapshot.id,
  }));
  const replies = await Promise.all(
    repliesSnapshot.docs
      .sort((left, right) => asIsoString(left.data().created_at).localeCompare(asIsoString(right.data().created_at)))
      .map(async (replySnapshot) => {
        const replyData = replySnapshot.data();
        const replyUserId = typeof replyData.user_id === 'string' ? replyData.user_id : '';
        const replyProfile = replyUserId ? await getProfile(replyUserId) : null;
        return {
          id: replySnapshot.id,
          content: typeof replyData.content === 'string' ? replyData.content : '',
          user_id: replyUserId,
          commenter: replyProfile ?? emptyProfile(replyUserId),
          created_at: asIsoString(replyData.created_at),
          parent_id: snapshot.id,
        };
      }),
  );

  return toComment(
    snapshot.id,
    data,
    commenter ?? emptyProfile(userId),
    likes,
    replies,
  );
}

const emptyProfile = (id: string): Profile => ({
  id,
  username: null,
  full_name: 'Unknown user',
  avatar_url: null,
  bio: null,
});

export async function getPost(postId: string): Promise<Post | null> {
  const { db } = getFirebaseServices();
  const postSnapshot = await getDoc(doc(db, 'posts', postId));
  if (!postSnapshot.exists()) return null;

  const data = postSnapshot.data();
  const userId = typeof data.user_id === 'string' ? data.user_id : '';
  const [author, likesSnapshot, commentsSnapshot] = await Promise.all([
    userId ? getProfile(userId) : Promise.resolve(null),
    getDocs(collection(db, 'posts', postId, 'likes')),
    getDocs(
      query(
        collection(db, 'posts', postId, 'comments'),
      ),
    ),
  ]);

  const topLevelComments = commentsSnapshot.docs
    .filter((comment) => !comment.data().parent_id)
    .sort((left, right) => asIsoString(left.data().created_at).localeCompare(asIsoString(right.data().created_at)));
  const [likes, comments] = await Promise.all([
    Promise.resolve(
      likesSnapshot.docs.map((like) => ({
        user_id: typeof like.data().user_id === 'string' ? like.data().user_id : like.id,
      })),
    ),
    Promise.all(
      topLevelComments.map((comment) => fetchComment(postId, comment)),
    ),
  ]);

  return {
    id: postSnapshot.id,
    content: typeof data.content === 'string' ? data.content : '',
    user_id: userId,
    author: author ?? emptyProfile(userId),
    created_at: asIsoString(data.created_at),
    comments,
    likes,
  };
}

export async function getPosts(): Promise<Post[]> {
  const { db } = getFirebaseServices();
  const snapshot = await getDocs(
    query(collection(db, 'posts')),
  );
  const posts = await Promise.all(
    snapshot.docs
      .sort((left, right) => asIsoString(right.data().created_at).localeCompare(asIsoString(left.data().created_at)))
      .map((post) => getPost(post.id)),
  );
  return posts.filter((post): post is Post => post !== null);
}

export function subscribePosts(
  onPosts: (posts: Post[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const { db } = getFirebaseServices();
  return onSnapshot(
    query(collection(db, 'posts')),
    (snapshot) => {
      const postDocs = snapshot.docs.sort(
        (left, right) => asIsoString(right.data().created_at).localeCompare(asIsoString(left.data().created_at)),
      );
      void Promise.all(postDocs.map((post) => getPost(post.id)))
        .then((posts) => onPosts(posts.filter((post): post is Post => post !== null)))
        .catch((error: unknown) => onError(asError(error)));
    },
    (error) => onError(error),
  );
}

export async function createPost(content: string, userId: string): Promise<void> {
  const { db } = getFirebaseServices();
  await addDoc(collection(db, 'posts'), {
    content: content.trim(),
    user_id: userId,
    created_at: serverTimestamp(),
  });
}

export async function createComment(
  post: Post,
  userId: string,
  content: string,
  parentId?: string,
): Promise<void> {
  const { db } = getFirebaseServices();
  const comment = await addDoc(collection(db, 'posts', post.id, 'comments'), {
    content: content.trim(),
    user_id: userId,
    post_id: post.id,
    parent_id: parentId ?? null,
    created_at: serverTimestamp(),
  });
  const recipientId = parentId
    ? post.comments.find((item) => item.id === parentId)?.user_id
    : post.user_id;
  if (recipientId) {
    await createNotification(recipientId, userId, parentId ? 'reply' : 'comment', post.id, comment.id);
  }
}

export async function togglePostLike(
  postId: string,
  userId: string,
  recipientId: string,
): Promise<void> {
  const { db } = getFirebaseServices();
  const likeRef = doc(db, 'posts', postId, 'likes', userId);
  const added = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(likeRef);
    if (snapshot.exists()) {
      transaction.delete(likeRef);
      return false;
    } else {
      transaction.set(likeRef, { user_id: userId, created_at: serverTimestamp() });
      return true;
    }
  });
  if (added && recipientId !== userId) {
    await createNotification(recipientId, userId, 'like', postId);
  }
}

export async function toggleCommentLike(
  postId: string,
  commentId: string,
  userId: string,
  recipientId: string,
): Promise<void> {
  const { db } = getFirebaseServices();
  const likeRef = doc(db, 'posts', postId, 'comments', commentId, 'likes', userId);
  const added = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(likeRef);
    if (snapshot.exists()) {
      transaction.delete(likeRef);
      return false;
    } else {
      transaction.set(likeRef, { user_id: userId, created_at: serverTimestamp() });
      return true;
    }
  });
  if (added && recipientId !== userId) {
    await createNotification(recipientId, userId, 'like_comment', postId, commentId);
  }
}

async function deleteCollectionDocuments(path: string): Promise<void> {
  const { db } = getFirebaseServices();
  const snapshot = await getDocs(collection(db, path));
  for (let offset = 0; offset < snapshot.docs.length; offset += 450) {
    const batch = writeBatch(db);
    snapshot.docs.slice(offset, offset + 450).forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }
}

export async function removePost(postId: string): Promise<void> {
  const { db } = getFirebaseServices();
  const comments = await getDocs(collection(db, 'posts', postId, 'comments'));
  for (const comment of comments.docs) {
    await deleteCollectionDocuments(
      `posts/${postId}/comments/${comment.id}/likes`,
    );
  }
  await deleteCollectionDocuments(`posts/${postId}/comments`);
  await deleteCollectionDocuments(`posts/${postId}/likes`);
  await deleteDoc(doc(db, 'posts', postId));
}

export async function removeComment(postId: string, commentId: string): Promise<void> {
  const { db } = getFirebaseServices();
  const replies = await getDocs(
    query(
      collection(db, 'posts', postId, 'comments'),
      where('parent_id', '==', commentId),
    ),
  );
  for (const reply of replies.docs) {
    await deleteCollectionDocuments(
      `posts/${postId}/comments/${reply.id}/likes`,
    );
    await deleteDoc(reply.ref);
  }
  await deleteCollectionDocuments(`posts/${postId}/comments/${commentId}/likes`);
  await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
}

async function createNotification(
  recipient_user_id: string,
  sender_user_id: string,
  type: string,
  post_id: string,
  comment_id?: string,
): Promise<void> {
  if (recipient_user_id === sender_user_id) return;
  const { db } = getFirebaseServices();
  await addDoc(collection(db, 'notifications'), {
    recipient_user_id,
    sender_user_id,
    type,
    post_id,
    comment_id: comment_id ?? null,
    is_read: false,
    created_at: serverTimestamp(),
  });
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { db } = getFirebaseServices();
  const snapshot = await getDocs(
    query(collection(db, 'notifications'), where('recipient_user_id', '==', userId)),
  );
  const notifications = await Promise.all(
    snapshot.docs.map(async (item) => {
      const data = item.data();
      const senderId = typeof data.sender_user_id === 'string' ? data.sender_user_id : '';
      const sender = senderId ? await getProfile(senderId) : null;
      return {
        id: item.id,
        created_at: asIsoString(data.created_at),
        recipient_user_id: typeof data.recipient_user_id === 'string' ? data.recipient_user_id : '',
        sender_user_id: senderId,
        type: typeof data.type === 'string' ? data.type : '',
        post_id: typeof data.post_id === 'string' ? data.post_id : '',
        comment_id: typeof data.comment_id === 'string' ? data.comment_id : undefined,
        is_read: data.is_read === true,
        sender: sender ?? emptyProfile(senderId),
      };
    }),
  );
  return notifications.sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export function subscribeNotifications(
  userId: string,
  onNotifications: (notifications: Notification[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const { db } = getFirebaseServices();
  return onSnapshot(
    query(
      collection(db, 'notifications'),
      where('recipient_user_id', '==', userId),
    ),
    (snapshot) => {
      void Promise.all(
        snapshot.docs.map(async (item) => {
          const data = item.data();
          const senderId = typeof data.sender_user_id === 'string' ? data.sender_user_id : '';
          const sender = senderId ? await getProfile(senderId) : null;
          return {
            id: item.id,
            created_at: asIsoString(data.created_at),
            recipient_user_id: userId,
            sender_user_id: senderId,
            type: typeof data.type === 'string' ? data.type : '',
            post_id: typeof data.post_id === 'string' ? data.post_id : '',
            comment_id: typeof data.comment_id === 'string' ? data.comment_id : undefined,
            is_read: data.is_read === true,
            sender: sender ?? emptyProfile(senderId),
          };
        }),
      )
        .then((items) => onNotifications(items.sort((left, right) => right.created_at.localeCompare(left.created_at))))
        .catch((error: unknown) => onError(asError(error)));
    },
    (error) => onError(error),
  );
}

export async function markNotificationsRead(userId: string): Promise<void> {
  const { db } = getFirebaseServices();
  const allNotifications = await getDocs(
    query(collection(db, 'notifications'), where('recipient_user_id', '==', userId)),
  );
  const unread = allNotifications.docs.filter((item) => item.data().is_read !== true);
  for (let offset = 0; offset < unread.length; offset += 450) {
    const batch = writeBatch(db);
    unread
      .slice(offset, offset + 450)
      .forEach((notification) => batch.update(notification.ref, { is_read: true }));
    await batch.commit();
  }
}

export function subscribeUserCount(
  onCount: (count: number) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const { db } = getFirebaseServices();
  return onSnapshot(
    collection(db, 'profiles'),
    (snapshot) => onCount(snapshot.size),
    (error) => onError(error),
  );
}

export function subscribePost(
  postId: string,
  onPost: (post: Post | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const { db } = getFirebaseServices();
  const nestedSubscriptions: Unsubscribe[] = [];
  let active = true;
  const refresh = () => {
    void getPost(postId)
      .then((post) => {
        if (active) onPost(post);
      })
      .catch((error: unknown) => {
        if (active) onError(asError(error));
      });
  };

  const unsubscribePost = onSnapshot(doc(db, 'posts', postId), refresh, onError);
  const unsubscribeLikes = onSnapshot(
    collection(db, 'posts', postId, 'likes'),
    refresh,
    onError,
  );
  const unsubscribeComments = onSnapshot(
    collection(db, 'posts', postId, 'comments'),
    (snapshot) => {
      nestedSubscriptions.forEach((unsubscribe) => unsubscribe());
      nestedSubscriptions.length = 0;
      snapshot.docs.forEach((comment) => {
        nestedSubscriptions.push(
          onSnapshot(
            collection(db, 'posts', postId, 'comments', comment.id, 'likes'),
            refresh,
            onError,
          ),
        );
      });
      refresh();
    },
    onError,
  );

  return () => {
    active = false;
    unsubscribePost();
    unsubscribeLikes();
    unsubscribeComments();
    nestedSubscriptions.forEach((unsubscribe) => unsubscribe());
  };
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
