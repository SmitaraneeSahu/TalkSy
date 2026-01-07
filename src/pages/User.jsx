import React, { useEffect, useState, useRef } from 'react'
import PostCard from '../components/PostCard'
import './User.css'
import {db, auth, storage} from '../firebase/config';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../utils/uploadImage';
import { useUser } from '../context/UserContext';
import { deleteMyAccount } from '../utils/deleteMyAccount';
import { toast } from 'react-toastify';
import { confirmToast } from '../utils/confirmToast';
import useTitle from '../hooks/useTitle';

const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg'
export default function User() {
  useTitle('Talksy - User Account');
  const navigate = useNavigate();
  const { authUser, userProfile, loading: userLoading } = useUser();
  const [userPost, setUserPost]   = useState(false);
  const [appearance,setAppearance] = useState(false);
  const [setting,setSetting] = useState(false);

  // const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const [background, setBackground] = useState(
    localStorage.getItem("background") || "none"
  );
  const [font, setFont] = useState(
    localStorage.getItem("font") || "system"
  );
  const [themeOpen, setThemeOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);
  
  const [photoOpen, setPhotoOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [dltOpen, setDltOpen] = useState(false);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  const[busy, setBusy] = useState(false);

  const BG_OPTIONS = [
    { value: 'none',  label: 'None',  kind: 'pattern', pattern: 'none' },
    { value: 'grid',  label: 'Grid',  kind: 'pattern', pattern: 'grid' },
    { value: 'dots',  label: 'Dots',  kind: 'pattern', pattern: 'dots' },
    { value: 'image1', label: 'Photo 1', kind: 'image', src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop' },
    { value: 'image2', label: 'Photo 2', kind: 'image', src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop' }
  ];
  const FONT_OPTIONS = [
    {
      value: 'system',
      label: 'System',
      fontFamily:
        'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif'
    },
    {
      value: 'serif',
      label: 'Serif',
      fontFamily:
        'Georgia, Cambria, "Times New Roman", Times, serif'
    },
    {
      value: 'mono',
      label: 'Monospace',
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    },
    {
      value: 'display',
      label: 'Display',
      fontFamily:
        '"Poppins", "Segoe UI", "Avenir Next", "Futura", "Nunito", "Rubik", sans-serif'
    }
  ];

  function applyTheme(theme) {
  const root = document.documentElement; // <html>
  root.classList.remove("theme-light", "theme-dark", "theme-sepia");
  root.classList.add(`theme-${theme}`);
  // Optional: persist
  localStorage.setItem("theme", theme);
  }
  function applyBackground(background) {
  document.documentElement.setAttribute("data-bg", background);
  localStorage.setItem("background", background);
  }
  function applyFont(font) {
  document.documentElement.setAttribute("data-font", font);
  localStorage.setItem("font", font);
  }
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(()=>{
    applyBackground(background);
  },[background]);

  useEffect(()=>{
    applyFont(font);
  },[font]);

  useEffect(()=>{
    if (userLoading) return;   
    if (!authUser) {
      setPosts([]);
      setLoading(false);
      return;
    }
  setLoading(false);
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('author.id' , '==', authUser.uid), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, (snapshot)=>{
      const results = snapshot.docs.map((doc)=>(
        {...doc.data(), id: doc.id}
      ));
      //console.log(results);
      setPosts(results);
      setLoading(false);
    },
    (err) => {
        console.error('Error fetching user posts:', err);
        setError('Failed to load your posts.');
        setLoading(false);
      }
    );
    return () => unsub();
  },[userPost,authUser, userLoading])

  function handleUserPost(){
    setUserPost(true);
    setAppearance(false);
    setSetting(false);
  }
  function handleAppearance(){
    setUserPost(false);
    setAppearance(true);
    setSetting(false);
  }
  function handleSetting(){
    setUserPost(false);
    setAppearance(false);
    setSetting(true);
  }
  function handleLogout(){
    signOut(auth);
    // setIsAuth(false);
    localStorage.setItem("isAuth", false);
    navigate('/login')
  }

  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadMsg('');
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
  };
  
  const onUpload = async() =>{
    if(!authUser){
      setUploadMsg("sign in to proceed");
      return;
    }
    if(!selectedFile){
      setUploadMsg("Please select an image");
      return;
    }
    try{
      setIsUploading(true);
      setUploadMsg("");
      const imageUrl = await uploadImageToCloudinary(selectedFile);
      await updateProfile(authUser, {photoURL: imageUrl});
      await setDoc(doc(db, "users", authUser.uid),
        {
          id: authUser.uid,
          email: authUser.email,
          name: userProfile?.name ?? authUser.displayName ?? '',
          photoURL: imageUrl,
          updatedAt: serverTimestamp()
        },{merge: true});
      setUploadMsg("Profile Photo updated successfully");
    }catch(err){
      console.error(err);
      setUploadMsg("upload failed. Try again")
    } finally{
      setIsUploading(false);
    }
  }

  const onChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    if (!authUser) {
      setPwdMsg('You must be signed in.');
      return;
    }
    if (!currentPassword || !newPassword) {
      setPwdMsg('Please enter both current and new password.');
      return;
    }
    try {
      setIsUpdatingPwd(true);

      // Reauthenticate with current password
      const credential = EmailAuthProvider.credential(authUser.email, currentPassword);
      await reauthenticateWithCredential(authUser, credential);

      // Update to new password
      await updatePassword(authUser, newPassword);

      setPwdMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      // Common errors: auth/wrong-password, auth/too-many-requests, auth/weak-password
      setPwdMsg(err?.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  async function onDeleteAccount(e){
    e.preventDefault();
    if (!authUser) {
      toast.error('You must be signed in.');
      return;
    }   
    const confirmed = await confirmToast(
      'Delete Account and All Posts! Are You Sure?',
      { yesText: 'Delete', cancelText: 'Cancel', autoClose: false } 
    );
    if (!confirmed) return;
    try{
      setBusy(true);
      await deleteMyAccount({ deletePosts: true, password: currentPassword });
      toast.success('Your account has been deleted.');
      await signOut(auth);
      localStorage.setItem("isAuth", false);
      navigate('/login');
      // setIsAuth(false);
    }catch(err){
      if (err?.code === 'auth/requires-recent-login') {
        toast.error('Please reauthenticate and try again.\nFor Google: sign in popup will appear.\nFor password: enter your current password.');
      } else {
        toast.error(err?.message || 'Failed to delete account.');
      }
      console.error(err);
    }finally{
      setBusy(false);
    }
  }
  return (
    <section className='userContainer'>
        <div className='userContent'>
            {userPost && 
            <div className="userPostsPanel">              
              {loading && (
              <div className="loading">Loading your posts…</div>)}

              {!loading && error && (
                <div className="error">{error}</div>
              )}

              { !loading && !error && posts.length === 0 && (
              <div className="emptyState">
                <div className="profile-header">
                  <img className="avatar-lg" src={userProfile?.photoURL || DEFAULT_AVATAR} alt="profile"/>
                  <h1>{userProfile?.name || authUser?.displayName}</h1>
                </div>
                <h4>No posts yet.</h4>
                <p>Create your first post to see it here.</p>
              </div>
              )}

              { !loading && !error && posts.length > 0 && (
              <div className="postList">
                <div className="profile-header">
                  <img className="avatar-lg" src={userProfile?.photoURL || DEFAULT_AVATAR} alt="profile"/>
                  <h1>{userProfile?.name || authUser?.displayName}</h1>
                </div>
                <h4 style={{ margin: '10px'}}>Posted By You</h4>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              )}
            </div>}
            {appearance && (<div>
            <label>
              <div className='theme-box'>
              <button type="button" className={`theme-toggle ${themeOpen ? 'open' : ''}`} onClick={() => setThemeOpen(o => !o)} aria-expanded={themeOpen} aria-controls="theme-options">
              <span className='span-text'>Themes</span>
              <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {themeOpen && (
            <div id="theme-options" className="theme-options" role="listbox" aria-label="Choose theme">
              {['light', 'dark', 'sepia'].map(opt => (
                <button
                  key={opt}
                  role="option"
                  aria-selected={theme === opt}
                  className={`theme-circle ${opt} ${theme === opt ? 'selected' : ''}`}
                  onClick={() => {
                    setTheme(opt);
                    setThemeOpen(false); // auto-collapse after selection; remove if you want it to stay open
                  }}
                  title={opt[0].toUpperCase() + opt.slice(1)}/>
              ))}
              </div>)}
            </div>
            </label>

            <label>
              <div className='theme-box'>
              <button type="button" className={`bg-toggle ${bgOpen ? 'open' : ''}`} onClick={() => setBgOpen(o => !o)} aria-expanded={bgOpen} aria-controls="bg-options">
              <span className='span-text'>Backgrounds</span>
              <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {bgOpen && (
            <div id="bg-options" className="bg-options" role="listbox" aria-label="Choose background">
              {BG_OPTIONS.map(opt => {
                const isSelected = background===opt.value;
                const style = (()=> {                  
                    if (opt.kind === 'image' && opt.src) {
                    return {
                      backgroundImage: `url(${opt.src})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    };
                  }
                  return{};
                })();
                return(
                  <button
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`option-tile bg-tile ${opt.kind=== 'pattern' ? `pattern-${opt.pattern}` : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setBackground(opt.value);
                    setBgOpen(false); 
                  }}
                  title={opt.label}
                  style={style}>
                    <span className="tile-label">{opt.label}</span>  
                  </button>
                );
              })}
              </div>)}
              </div>
            </label>

            <label>
              <div className='theme-box'>
                <button type="button" className={`font-toggle ${fontOpen ? 'open' : ''}`} onClick={() => setFontOpen(o => !o)} aria-expanded={fontOpen} aria-controls="font-options">
                <span className='span-text'>Font style</span>
                <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {fontOpen && (
                <div id="font-options" className="font-options" role="listbox" aria-label="Choose font style">
                {FONT_OPTIONS.map(opt => {
                const isSelected = font===opt.value;
                return(
                  <button
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`option-tile font-tile ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setFont(opt.value);
                    setFontOpen(false); 
                  }}
                  title={opt.label}
                  style={{fontFamily: opt.fontFamily}}>
                  {opt.label}
                  </button>
                );
              })}
              </div>
              )}
              </div>
            </label>
            </div>)}
            {setting && (<div>
              <div className='theme-box'>
                <button type="button" className={`panel-toggle ${photoOpen ? 'open' : ''}`} onClick={() => setPhotoOpen((o) => !o)} aria-expanded={photoOpen} aria-controls="photo-panel">
                <span className='span-text'>Set Profile Photo</span>
                <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>                
                {photoOpen && (
                  <div id="photo-panel" className="panel-content">
                    <div className="upload-row">
                      <button type="button" className="upload-tile" onClick={onPickFile} title="Select image">
                        {previewUrl ? (<img src={previewUrl} alt="preview" className="preview-img" />) : (
                          <div className="upload-placeholder">
                            <span className="upload-icon">⬆</span>
                            <span>Click to choose an image (png/jpg)</span>
                            {/* <small>PNG/JPG, ≤ 5MB recommended</small> */}
                          </div>)}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden-file-input" onChange={onFileChange}/>
                      <div className="upload-actions">
                          <button type="button" className="btn primary" onClick={onUpload} disabled={!selectedFile || isUploading}>
                            {isUploading ? 'Uploading…' : 'Upload & Save'}
                          </button>
                          {selectedFile && <div className="file-name">{selectedFile.name}</div>}
                      </div>
                    </div>
                      {uploadMsg && <div className="status-msg">{uploadMsg}</div>}
                  </div>
                )}
              </div>
              <div className='theme-box'>
              <button type="button" className={`panel-toggle ${pwdOpen ? 'open' : ''}`} onClick={() => setPwdOpen((o) => !o)} aria-expanded={pwdOpen} aria-controls="pwd-panel">
                <span className='span-text'>Change PassWord</span>
                <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>  
              {pwdOpen && (
              <div id="pwd-panel" className="panel-content">
                <form className="pwd-form" onSubmit={onChangePassword}>
                  <label className="form-field">
                    <span>Current Password</span>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required/>
                  </label>
                  <label className="form-field">
                  <span>New Password</span>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}/> 
                  </label> 
                <div className="form-actions">
                <button type="submit" className="btn primary" disabled={isUpdatingPwd}>
                  {isUpdatingPwd ? 'Updating…' : 'Update Password'}
                </button>
                </div>
                  {pwdMsg && <div className="status-msg">{pwdMsg}</div>}
                </form>
                </div>)}
              </div>
              <div className='theme-box'>
                <button type="button" className={`panel-toggle ${dltOpen ? 'open' : ''}`} onClick={() => setDltOpen((o) => !o)} aria-expanded={dltOpen} aria-controls="dlt-panel">
                <span className='span-text'>Delete Account</span>
                <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button> 
                {dltOpen &&
                  <div id="dlt-panel" className="panel-content" style={{display: 'flex', flexDirection: 'column'}}>
                    <h3>Please confirm your current password to proceed.</h3>
                    <input type="password" placeholder="Enter your password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={busy} style={{padding: '10px 12px', borderRadius: '10px', width: '50%', border: '1px solid rgba(148, 163, 184, 0.35)', margin:'10px 0 8px 0'}}/>                   
                      <button className="btn-delete" onClick={onDeleteAccount} disabled={busy} style={{ background: '#b00020', color: '#fff', marginTop: 8, padding: '10px 5px', borderRadius: '10px', width: '25%'}}>
                        {busy ? 'Deleting…' : 'Delete My Account'}
                      </button>
                      <p style={{ opacity: 0.8, marginTop: 8, color: '#b00020' }}>
                        This will permanently delete your profile and (optionally) your posts.
                      </p>
                  </div>
                } 
              </div>
            </div>)}
        </div>
        <div className='userMenu'>
            <span onClick={handleUserPost} className={`userMenuOption ${userPost ? 'active' : ''}`}>Your Posts</span>
            <span onClick={handleAppearance} className={`userMenuOption ${appearance ? 'active' : ''}`}>Appearance</span>
            <span onClick={handleSetting} className={`userMenuOption ${setting ? 'active' : ''}`}>Settings</span>
            <span onClick={handleLogout} className='userMenuOption'>Log out</span>
        </div>
    </section>
  )
}
