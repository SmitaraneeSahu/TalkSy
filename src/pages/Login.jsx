import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './Login.css';
import {auth, googleProvider, db} from '../firebase/config';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import useTitle from '../hooks/useTitle';

const getAuthErrorMessage = (code) => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger one.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with a different sign-in method for this email.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please try again.';
    case 'auth/invalid-login-credentials': 
      return 'Invalid email or password. Please check and try again.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

function showAuthError(err, context = '') {
  const code = err?.code;
  const message = err?.message;
  
  console.error(`[${context}] Firebase Auth Error`, {
    code,
    message,
    name: err?.name,
    fullError: err
  });
  toast.error(`${getAuthErrorMessage(code)} ${code ? `(${code})` : ''}`);
}
export default function Login() {
  useTitle('Talksy - Login');
  const navigate = useNavigate();
  const [haveAccount, setHaveAccount] = useState(true);
  const { authUser, loading: userLoading } = useUser();
  const [isAuth, setIsAuth] = useState(JSON.parse(localStorage.getItem("isAuth"))|| false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  useEffect(() => {
      if (!userLoading && authUser) {
        navigate('/', {replace: true});
      }
    }, [userLoading, authUser, navigate]);

  async function handleLoginGoogle(){
  try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      setIsAuth(true);
      localStorage.setItem("isAuth", JSON.stringify(true));

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        email: user.email,
        name: user.displayName || "",   // Google account name if available
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success('Logged in with Google!');
      navigate('/');
    } catch (err) {
      showAuthError(err, 'Google Login')
      // console.error("[Google Login] Error:", err);
      // toast.error(getAuthErrorMessage(err?.code));
    }
  }
  async function handleSignup(e){
    e.preventDefault();
    // const data = new FormData(e.currentTarget);
    // const email = data.get('email');
    // const name = data.get('name');
    // const password = data.get('password');   
    const email = signupEmail.trim();
    const name = signupName.trim();
    const password = signupPassword;

    try {
      const {user} = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db,"users", user.uid),{
      id: user.uid,
      email: user.email,
      name: auth.currentUser.displayName,
      photoURL: null,
      createdAt: serverTimestamp()},
      { merge: true });
      localStorage.setItem('isAuth', JSON.stringify(true));
      setIsAuth(true);
      toast.success('Account created! Welcome 👋');
      // navigate('/');
    } catch (err) {
      showAuthError(err, 'Email Signup');
      // console.error(err);
      // toast.error(getAuthErrorMessage(err?.code));
    }
    // return user;
  }
  async function handleLogin(e){
    e.preventDefault();
    // const data = new FormData(e.currentTarget);
    // const email = data.get('email');
    // const password = data.get('password'); 
    const email = loginEmail.trim();
    const password = loginPassword

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      // console.log('Signed in:', cred.user.uid);
      localStorage.setItem('isAuth', JSON.stringify(true));
      setIsAuth(true);
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        email: user.email,
        name: user.displayName || "",
        photoURL: user.photoURL ?? null,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success('Logged in successfully!');
      // navigate('/');
    } catch (err) {
      showAuthError(err, 'Email Login');
      // console.error(err);
      // toast.error(getAuthErrorMessage(err?.code));
    }
  }
  async function handleForgotPassword() {
    const email = loginEmail.trim();
    if (!email) {
      toast.error('Please enter your registered email first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (err) {
      showAuthError(err, 'Forgot Password');
    }
  }

  return (
    <main className='login-container'>
      <div className='loginPage'>
        { haveAccount && <div className='login-div'>
          <div className='login-option'>
            <span onClick={handleLoginGoogle}><i className='bi bi-google'></i> LogIn with Google</span>
            <span><i className='bi bi-envelope-fill'></i>   LogIn with Email</span>
          </div>
          <form onSubmit={handleLogin} className='login-form'>
            <label htmlFor='email'>Registered Email</label>
            <input id='email' type="email" name='email' value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder='Enter your email' autoComplete='off'/>
            <label htmlFor='password'>Password</label>
            <input id='password' type="password" name='password' value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder='Enter your password' />
            <div className='below-div'>
              <button type='submit'>Login</button>
              <span onClick={()=>setHaveAccount(false)} >Don't have Account? SignUp </span>
            </div>
            <div className="forgot-div">
              <span className="link-button" onClick={handleForgotPassword}>
                Forgot password?
              </span>
            </div>
          </form>
        </div>}
        {!haveAccount && <div className='signup-div'>
          <div className='login-option'>
            <span><i className='bi bi-google'></i> SignUp with Google</span>
            <span><i className='bi bi-envelope-fill'></i> SignUp with Email</span>
          </div>
          <form onSubmit={handleSignup} className='signup-form'>
            <label htmlFor='email'>Your Email</label>
            <input id='email' type="email" name='email' value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}placeholder='Enter your email' autoComplete='off'/>
            <label htmlFor="name">Your name</label>
            <input id='name' type="text" name='name' value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder='Enter your name' autoComplete='off' />
            <label htmlFor='password'>Password</label>
            <input id='password' type="password" name='password' value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder='Enter your password' />       
            <div className='below-div'>
              <button type='submit'>Signup</button>
              <span onClick={()=>setHaveAccount(true)}>Already have account! Login</span>
            </div>
          </form>
        </div>}
      </div>
    </main>
  )
}
