import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext/authFile';
import { useContext, useEffect, useState } from 'react';
import {auth, db} from "./firebase/config";
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function Navbar(){
    const authCtx = useContext(AuthContext);
    const navigate = useNavigate();

    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        const checkRole = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsAdmin(null);

                try {
                    let q = query(collection(db, "WMSUsers"), where("email", "==", user.email));
                    let querySnapshot = await getDocs(q);

                    if (querySnapshot.empty && user.email) {
                        q = query(collection(db, "WMSUsers"), where("email", "==", user.email.toLowerCase()));
                        querySnapshot = await getDocs(q);
                    }

                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data();
                        const role = userData.role || "user";
                        
                        if (role.toLowerCase() === "admin") {
                            setIsAdmin(true);
                        } else {
                            setIsAdmin(false);
                        }
                    } else {
                        setIsAdmin(false);
                    }
                } catch (error) {
                    console.error("Error checking role:", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        });

        return () => checkRole();
    }, []);

    useEffect(() => {
        const logoutOthers = onSnapshot(doc(db, "WMSSettings", "toggleForAllowAdminLoginOnly"), (docSnapshot) => {
            if(docSnapshot.exists()){
                const locked = docSnapshot.data().toggleAdmin;  
                setIsLocked(locked);
                
                if(locked && auth.currentUser && isAdmin === false){
                    if(authCtx && authCtx.logout){
                        alert("Maintenance Mode Initiated: Admin Access Only.");
                        authCtx.logout();
                        navigate("/login");
                    }
                }
            }
        });
        return () => logoutOthers();
    }, [isAdmin, authCtx, navigate]);

    const handleLockToggle = async () => {
        try{
            await updateDoc(doc(db, "WMSSettings", "toggleForAllowAdminLoginOnly"), {
                toggleAdmin: !isLocked
            });
        }catch(err){
            console.error("Error updating lock:", err);
            alert("Error: Ensure 'settings/config' document exists in Firestore.");
        }
    }

    if (!authCtx) return null; 
    const isLoading = isAdmin === null;

    return (
    <>
        <nav className="navbar navbar-dark bg-dark px-3 fixed-top">
            <div className="d-flex w-100 justify-content-between align-items-center">
                <div className="d-flex gap-3">
                    <Link className="text-white text-decoration-none" to="/dashboard">Products</Link>
                    <Link className="text-white text-decoration-none" to="/addProduct">Add New</Link>
                    <Link className="text-white text-decoration-none" to="/removeKTNs">Remove KTNs</Link>

                    {isAdmin && (
                        <div>
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id="adminLockSwitch"
                                checked={isLocked} 
                                onChange={handleLockToggle}
                                style={{ cursor: "pointer", backgroundColor: isLocked ? "red" : "" }} 
                            />
                            <label className="form-check-label" htmlFor="adminLockSwitch">
                                {isLocked ? "⛔ ADMIN ONLY" : "✅ OPEN ACCESS"}
                            </label>
                        </div>
                    )}
                </div>
                <div>
                    
                    {authCtx.loggedIn && !isLoading? (<button onClick={authCtx.logout} className='btn btn-danger btn-sm'>Logout</button>) :
                        (<Link className="text-white text-decoration-none" to="/login">Login</Link>)
                    };
                </div>
            </div>
         </nav>
    </>
  );

}


export default Navbar;