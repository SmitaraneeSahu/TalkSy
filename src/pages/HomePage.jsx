import React from 'react'
import { Link } from 'react-router-dom';
import './HomePage.css';
import PostCard from '../components/PostCard'
import { useEffect, useState } from "react";
import { getDocs, collection, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import useTitle from '../hooks/useTitle';

export default function HomePage() {
  useTitle('TalkSy - Home');
  const [posts, setPosts] = useState([]);
  const postsRef = collection(db, "posts");
  useEffect(()=>{
    async function getPosts(){
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      const data = await getDocs(q);
      setPosts(data.docs.map((document)=>(
        {...document.data(), id: document.id}
      )))
    }
    getPosts();
  },[]);
  
 function handleAfterDelete(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <main>
        <div>
          {posts.map((post)=>(
            <PostCard key={post.id} post={post} onAfterDelete={handleAfterDelete}/>
          ))}
        </div>
        <Link to="/post" className='write-post'>
            <span>Write a Post <i className='bi bi-pencil-square'></i></span>
        </Link>
    </main>
  )
}
