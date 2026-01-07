import React from "react";
import { Link } from "react-router-dom";
import "./profileCard.css";
const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg';

export default function ProfileCard({ user }) {
  const {name, id, photoURL} = user;
  return (
    <Link to={`/profile/${user.id}`} className="profile-postcard" aria-label={`Open ${user.name}'s profile`}>
      <div className="cover"></div>
      <div className="content">
        <img className="avatar" src={user.photoURL || DEFAULT_AVATAR} alt=""/>
        <div className="info">
          <h3 className="name">{user.name}</h3>
          {/* {user.title && <p className="title">{user.title}</p>}
          {user.location && <p className="location">{user.location}</p>}
          {user.bio && <p className="bio">{user.bio}</p>} */}
        </div>
      </div>
    </Link>
  );
}

