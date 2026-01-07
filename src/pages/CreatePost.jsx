import React from 'react'
import { useState, useEffect } from 'react';
import './CreatePost.css';
import { addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import useTitle from '../hooks/useTitle';

const DEFAULT_AVATAR ='https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg';

export default function CreatePost() {
  useTitle('Talksy - Create Post');
  const navigate = useNavigate();
  const postRef = collection( db, "posts");
  const { userProfile, loading } = useUser();

  async function handleCreatePost(event){
    event.preventDefault();
    const form = event.target;
    const postContent = form.postContent.value;
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
    if (!postContent) return;

    const authorName = userProfile?.name ?? auth.currentUser.displayName ?? '';
    const authorPhoto = userProfile?.photoURL ?? auth.currentUser.photoURL ?? null;

    const document = {
      postContent: event.target.postContent.value,
      author: {
        name: auth.currentUser.displayName,
        id: auth.currentUser.uid,
        photoURL: authorPhoto
      },
      createdAt: serverTimestamp()
    }
    await addDoc(postRef, document);
    form.reset();
    navigate("/");
  }
  function handleReset(event){
    event.preventDefault();
    const form = event.currentTarget.closest('form');
    if (form) form.reset();
  }

  return (
    <section style={{padding: "10px"}}>
      <div className='createpost-container'>
        <form onSubmit={handleCreatePost}>
        <div className='content-container'>
            <img src={userProfile?.photoURL||DEFAULT_AVATAR} alt=""  className='avatar'/>
            <textarea type='text' placeholder='Write your post here' className='textarea' name='postContent' required></textarea>
        </div>
        <div className='button-container'>
          <button className='cancel' onClick={handleReset}>Cancel</button>
          <button className='post'>Post</button>
        </div>
      </form>
      </div>
    </section>
  )
}
