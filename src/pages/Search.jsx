
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, getDocs, limit, orderBy, query, startAt, endAt, where, } from "firebase/firestore";
import ProfileCard from "../components/ProfileCard";
import PostCard from "../components/PostCard";
import "./Search.css";
import useTitle from "../hooks/useTitle";


export default function SearchPage() { 
    useTitle('Talksy - Search');
    const [searchText, setSearchText] = useState("");
    const [posts, setPosts] = useState([]);
    const [people, setPeople] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [filteredPeople, setFilteredPeople] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        async function fetchPosts(){
            const snap = await getDocs(collection(db, "posts"));
            const data = snap.docs.map(doc=>({ id: doc.id, ...doc.data()}));
            setPosts(data);
        }
        fetchPosts();
    },[]);
    useEffect(()=>{
        async function fetchPeople(){
            const profile = await getDocs(collection(db, "users"));
            const data = profile.docs.map(doc=>({ id: doc.id, ...doc.data()}));
            setPeople(data);
        }
        fetchPeople();
    },[])
    useEffect(()=>{
        if (!searchText.trim()) {
            setFilteredPosts([]);
            setFilteredPeople([]);
            return;
        };

        setLoading(true);
        const text = searchText.toLowerCase();
        const postResults = posts.filter(post=> post.postContent?.toLowerCase().includes(text));
        const peopleResults = people.filter(p => p.name?.toLowerCase().includes(text));
        
        setFilteredPosts(postResults);
        setFilteredPeople(peopleResults);
        setLoading(false);
        
    },[searchText, posts, people]);
  return (
    <div className="search-page">
        <div className="results-section">
            {loading && <p>Searching...</p>}
            {!loading && (
                <>
                    {filteredPosts.length>0 && (
                        <>
                            <h3 className="section-title">Results for posts</h3>
                            <div className="posts-grid">
                                {filteredPosts.map(post => (
                                    <PostCard key={post.id} post={post}/>
                                ))}
                            </div>
                        </>
                    )}
                    {filteredPeople.length > 0 && (
                        <>
                            <h3 className="section-title">Results for people</h3>
                            <div className="posts-grid">
                                {filteredPeople.map(p => (
                                    <ProfileCard key={p.id} user={p}/>
                                ))}
                            </div>
                        </>
                    )}
                    {filteredPosts.length===0 && filteredPeople.length ===0 && searchText && (
                        <p>No results found</p>
                    )}
                </>
            )}
        </div>
        <div className="search-sidebar">
            <div className="searchbox">
                <i className="bi bi-search"></i>
                <input type="text" placeholder="Search " value={searchText} onChange={e => setSearchText(e.target.value)}/>
            </div>
        </div>
    </div>
  )
}

