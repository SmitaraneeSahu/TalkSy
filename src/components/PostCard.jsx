import React from 'react'
import { useState, useEffect, useMemo } from 'react';
import './PostCard.css'
import { formatRelativeOrDate } from '../logics/timeFormat';
import { getDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';

const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg';
const avatarCache = new Map();

export default function({post, onAfterDelete}) {
    const { id: postId, postContent, author = {}, createdAt, updatedAt } = post || {};
    const { authUser, userProfile } = useUser();
    const [avatarUrl, setAvatarUrl] = useState(null);
    const id = author?.id;
    const authorId =  post.author?.id;
  // typeof post.author === "string" ? post.author : post.author?.uid ||

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const isCurrentUserAuthor = useMemo(
    () => !!authUser && !!authorId && authUser.uid === authorId,
    [authUser, authorId]
  );
  
useEffect(()=>{
    if (!id) return;
    async function fetchPhoto(){
      try{
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()){
          setAvatarUrl(snap.data().photoURL || null);
        }
      }catch(err){
        console.error(err);
      }
    }
    fetchPhoto();
  }, [id]);

  const preferredFromPost =
    typeof author?.photoURL === 'string' && author.photoURL.trim().length > 0
      ? author.photoURL.trim()
      : '';

  const finalAvatar =
    preferredFromPost ||
    (avatarUrl && avatarUrl.length > 0 ? avatarUrl : '') ||
    DEFAULT_AVATAR;

  useEffect(() => {
    setAvatarUrl(finalAvatar || DEFAULT_AVATAR);
  }, [finalAvatar]);

  async function onDelete() {
    if (!isCurrentUserAuthor || !postId) return;

    setIsBusy(true);
    setError('');
    await toast.promise (deleteDoc(doc(db, 'posts', postId)) ,
       {
        pending: 'Deleting post…',
        success: 'Post deleted!',
        error: 'Failed to delete. Please try again.',
      },
      )
      // Let parent remove this post from the list immediately
      .then(() => {
      onAfterDelete?.(postId); // remove from list immediately
    }).catch ((err)=> {
      console.error('[PostCard] Failed to delete post:', err);
      setError('Failed to delete. Please try again.');
    }). finally (()=>{
      setIsBusy(false);
    })
  }

  return (
    <div className='post-container'>
        <div className='post-inner'>
            <img src={avatarUrl || DEFAULT_AVATAR} alt='profile' className='avatar'/>
            <div className='post-content'>
                <div className='post-header'>
                    <span className='name'>{author.name}</span>
                    {/* <span className='username'>@smsahu</span> */}
                    <span className='dot'>.</span>
                    <span className='date'>{post.createdAt ? formatRelativeOrDate(post.createdAt) : ''}</span>
                </div>
                <div className='post-text'>
                    <p>
                      {postContent}
                    </p>
                {isCurrentUserAuthor && (
                  <div className="post-actions" style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  {/* <button onClick={() => onEdit(post)}>Edit</button> */}
                  <button onClick={() => onDelete(post.id)}><i className='bi bi-trash3'></i></button>
                  </div>)}
                </div>
            </div>
        </div>
    </div>
  )
}
