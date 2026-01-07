
// src/pages/ProfilePage.jsx
import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit as fbLimit,} from "firebase/firestore";
import "./ProfilePage.css";
import PostCard from "../components/PostCard";
import ProfileCard from "../components/ProfileCard";
import useTitle from "../hooks/useTitle";
import { useUser } from "../context/UserContext";
const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg';

export default function ProfilePage() {
  const {authUser} = useUser();
  useTitle(`Talksy - ${authUser?.displayName}`);
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      
      if (!id) return;
      setLoading(true);
      try {
        const uSnap = await getDoc(doc(db, "users", id));
        setUser(uSnap.exists() ? uSnap.data() : null);

        const postsSnap = await getDocs(
          query(
            collection(db, "posts"),
            where("author.id", "==", id),
            orderBy("createdAt", "desc"),
            fbLimit(50)
          )
        );
        const postsData = postsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);
  
  if (loading) return <div className="loading">Loading…</div>;
  if (!user) return <div className="error">User not found</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img className="avatar-lg" src={user.photoURL || DEFAULT_AVATAR} alt="profile"/>
        <h1>{user.name}</h1>
      </div>
      <section className="user-posts">
        <h2>Posts by {user.name}</h2>
        {posts.length === 0 ? (
          <div className="empty">No posts yet</div>
        ) : (
          // <ul className="posts-list">
          //   {posts.map((p) => (
          //     <li key={p.id} className="post-card">
          //       <PostCard key={p.id} post={p}/>
          //     </li>
          //   ))}
          // </ul>
          <div className="posts-list">{posts.map((p)=>(
            <PostCard key={p.id} post={p}/>
          ))}</div>
        )}
      </section>
    </div>
  );
}
