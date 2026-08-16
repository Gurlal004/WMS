import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase/config';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { AuthContext } from './authContext/authFile'; // use the same context path you use in ProtectedRoute
import { isOutsideWorkingHoursInPoland } from './utils';

function Login(){
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

   useEffect(() => {
    if (!authCtx) return;
    if (!authCtx.loading && authCtx.loggedIn) {
      navigate("/dashboard");
    }
  }, [authCtx?.loading, authCtx?.loggedIn, navigate]);

  if(error){}

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");
    try {
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        const userEmail = userCredentials.user.email;
        
        // 1. Fetch Lock Settings
        const settingRef = doc(db, "WMSSettings", "toggleForAllowAdminLoginOnly");
        const settingSnap = await getDoc(settingRef);
        const isLocked = settingSnap.exists() ? settingSnap.data().toggleAdmin : false;
        
        let role = "user"; // Default

        // 2. ROBUST ROLE FETCH (Case-Insensitive)
        let q = query(collection(db, "WMSUsers"), where("email", "==", userEmail));
        let querySnap = await getDocs(q);
        
        // Fallback for case-sensitivity
        if (querySnap.empty && userEmail) {
            q = query(collection(db, "WMSUsers"), where("email", "==", userEmail.toLowerCase()));
            querySnap = await getDocs(q);
        }
        
        if (!querySnap.empty) {
            role = querySnap.docs[0].data().role?.toLowerCase() || "user";
        }

        // 3. Evaluate Admin Lock
        if (isLocked && role !== "admin") {
            await signOut(auth);
            throw new Error("Maintenance Mode: Only Admins can log in right now.");
        }

        // 4. Evaluate Time Cutoff 
        // if (role === "user" && isOutsideWorkingHoursInPoland()) {
        //     await signOut(auth);
        //     throw new Error("System is closed for regular users between 5:20 PM and 7:00 AM (Warsaw Time).");
        // }
        // 4. Evaluate Time Cutoff based on Role
        // if ((role === "user" || role === "s_user") && isOutsideWorkingHoursInPoland(role)) {
        //     await signOut(auth);
            
        //     // Give them a role-specific error message
        //     const cutoffTime = role === "s_user" ? "10:00 PM" : "5:20 PM";
        //     throw new Error(`System is closed for your role between ${cutoffTime} and 7:00 AM (Warsaw Time).`);
        // }
        const lockoutReason = isOutsideWorkingHoursInPoland(role);
        
        if ((role === "user" || role === "s_user") && lockoutReason) {
            await signOut(auth);
            throw new Error(lockoutReason); // Displays the exact dynamic message!
        }
              
        navigate("/dashboard");
    } catch (err: any) {
        console.error("Login Error: ", err);
        setError(err.message);
    }
}

return(
    <div className="container mt-5">
        {/* NEW: VISUAL ERROR ALERT SO IT STOPS FAILING SILENTLY */}
        {error && <div className="alert alert-danger text-center shadow-sm">{error}</div>}

        <form className='p-4 border rounded shadow-sm bg-light' onSubmit={handleSubmit}>
            <div className='mb-3'>
                <label htmlFor="username" className='form-label'>Username:</label>
                <input id="username" type="text" name="username" className='form-control' value={email} onChange={(e) => setEmail(e.target.value)}/>
                
                <label htmlFor="password" className='form-label mt-2'>Password</label>
                <input id="password" type="password" name="password" className='form-control' value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className='btn btn-primary w-75'>Submit</button>
        </form>
    </div>
  );
}

export default Login;