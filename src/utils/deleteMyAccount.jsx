import React from 'react';
import { auth, db } from '../firebase/config';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser
} from 'firebase/auth';
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';


export async function reauthenticateIfNeeded({ password } = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in.');

  // Determine if the user signed-in with password or Google
  const providers = user.providerData.map(p => p.providerId);
  const usesPassword = providers.includes('password');
  const usesGoogle = providers.includes('google.com');

  // Firebase may not always throw upfront; we proactively reauth before destructive actions.
  if (usesPassword) {
    if (!password || password.trim().length === 0) {
      throw new Error('Please enter your current password to confirm.');
    }
    const cred = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, cred);
  } else if (usesGoogle) {
    const provider = new GoogleAuthProvider();
    // Optionally: provider.setCustomParameters({ prompt: 'select_account' })
    await reauthenticateWithPopup(user, provider);
  }
}

export async function deleteMyAccount({ deletePosts = true, password = '' } = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in.');

  // 1) Reauthenticate if needed (required for critical ops like delete)
  // If your app uses email/password, ask for current password.
  if (user.providerData.some(p => p.providerId === 'password')) {
    if (!password || password.trim().length === 0) {
      throw new Error('Please enter your current password to confirm account deletion.');
    }
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  }
  // For Google-only accounts, recent login is typically OK; if you hit "requires-recent-login",
  // re-run the Google sign-in flow and retry.

  const uid = user.uid;

  // 2) Optionally delete all posts authored by this user
  if (deletePosts) {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('author.id', '==', uid));
    const snap = await getDocs(q);
    const batchPromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.allSettled(batchPromises);
    // NOTE: For large datasets, prefer a Cloud Function with Firestore triggers or batch/queue processing.
  }

  // 3) Delete Firestore user profile document
  await deleteDoc(doc(db, 'users', uid));

  // 4) Delete the Auth user (final step)
//   await user.delete();
  await deleteUser(user);

  // At this point, the user is removed. Your context/onAuthStateChanged should handle UI changes.
}
