import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase/config';

function Login(){
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if(error){}

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  }
    return(
    <>
        <div className="container mt-5">
            <form className='p-4 border rounded shadow-sm bg-light' onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor="username" className='form-label'>Username:</label>
                    <input id="username" type="text" name="username" className='form-control' value={email} onChange={(e) => setEmail(e.target.value)}/>
    
                    <label htmlFor="password" className='form-label'>Password</label>
                    <input id="password" type="password" name="username" className='form-control' value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit" className='btn btn-primary w-75'>Submit</button>
            </form>
        </div>
    </>
    );
}

export default Login;