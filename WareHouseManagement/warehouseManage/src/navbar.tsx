// import 'bootstrap/dist/css/bootstrap.min.css'; 
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import HomeIcon from '@mui/icons-material/Home';
// import { Link, useNavigate } from 'react-router-dom';
// import { AuthContext } from './authContext/authFile';
// import { useContext, useEffect, useState } from 'react';
// import {auth, db} from "./firebase/config";
// import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';

// function Navbar(){
//     const authCtx = useContext(AuthContext);
//     const navigate = useNavigate();

//     const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
//     const [isLocked, setIsLocked] = useState(false);

//     useEffect(() => {
//         const checkRole = onAuthStateChanged(auth, async (user) => {
//             if (user) {
//                 setIsAdmin(null);

//                 try {
//                     let q = query(collection(db, "WMSUsers"), where("email", "==", user.email));
//                     let querySnapshot = await getDocs(q);

//                     if (querySnapshot.empty && user.email) {
//                         q = query(collection(db, "WMSUsers"), where("email", "==", user.email.toLowerCase()));
//                         querySnapshot = await getDocs(q);
//                     }

//                     if (!querySnapshot.empty) {
//                         const userData = querySnapshot.docs[0].data();
//                         const role = userData.role || "user";
                        
//                         if (role.toLowerCase() === "admin") {
//                             setIsAdmin(true);
//                         } else {
//                             setIsAdmin(false);
//                         }
//                     } else {
//                         setIsAdmin(false);
//                     }
//                 } catch (error) {
//                     console.error("Error checking role:", error);
//                     setIsAdmin(false);
//                 }
//             } else {
//                 setIsAdmin(false);
//             }
//         });

//         return () => checkRole();
//     }, []);

//     useEffect(() => {
//         const logoutOthers = onSnapshot(doc(db, "WMSSettings", "toggleForAllowAdminLoginOnly"), (docSnapshot) => {
//             if(docSnapshot.exists()){
//                 const locked = docSnapshot.data().toggleAdmin;  
//                 setIsLocked(locked);
                
//                 if(locked && auth.currentUser && isAdmin === false){
//                     if(authCtx && authCtx.logout){
//                         alert("Maintenance Mode Initiated: Admin Access Only.");
//                         authCtx.logout();
//                         navigate("/login");
//                     }
//                 }
//             }
//         });
//         return () => logoutOthers();
//     }, [isAdmin, authCtx, navigate]);

//     const handleLockToggle = async () => {
//         try{
//             await updateDoc(doc(db, "WMSSettings", "toggleForAllowAdminLoginOnly"), {
//                 toggleAdmin: !isLocked
//             });
//         }catch(err){
//             console.error("Error updating lock:", err);
//             alert("Error: Ensure 'settings/config' document exists in Firestore.");
//         }
//     }

//     if (!authCtx) return null; 
//     const isLoading = isAdmin === null;

//     return (
//     <>
//         <nav className="navbar navbar-dark bg-dark px-3 fixed-top">
//             <div className="d-flex w-100 justify-content-between align-items-center flex-nowrap">
//                 <div className="d-flex gap-3 align-items-center flex-nowrap overflow-hidden">
//                     <Link
//                     to="/dashboard"
//                     className="text-white text-decoration-none d-flex align-items-center text-nowrap"
//                     title="Products"
//                     >
//                     <HomeIcon fontSize="medium" />
//                     </Link>
//                     <Link className="text-white text-decoration-none text-nowrap" to="/addProduct">Add New</Link>
//                     <Link className="text-white text-decoration-none text-nowrap" to="/removeKTNs">Remove KTNs</Link>

//                     {isAdmin && (
//                         <div className="form-check form-switch d-flex align-items-center gap-1 text-nowrap">
//                             <input 
//                                 className="form-check-input" 
//                                 type="checkbox" 
//                                 id="adminLockSwitch"
//                                 checked={isLocked} 
//                                 onChange={handleLockToggle}
//                                 style={{ cursor: "pointer", backgroundColor: isLocked ? "red" : "" }} 
//                             />
//                             <label className="form-check-label" htmlFor="adminLockSwitch">
//                                 {isLocked ? "⛔ ADMIN ONLY" : "✅ OPEN ACCESS"}
//                             </label>
//                         </div>
//                     )}
//                 </div>
//                 <div className="flex-shrink-0 text-nowrap">
//                     {authCtx.loggedIn && !isLoading? (<button onClick={authCtx.logout} className='btn btn-danger btn-sm'>Logout</button>) :
//                         (<Link className="text-white text-decoration-none" to="/login">Login</Link>)
//                     };
//                 </div>
//             </div>
//          </nav>
//     </>
//   );

// }


// export default Navbar;
// import 'bootstrap/dist/css/bootstrap.min.css'; 
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import HomeIcon from '@mui/icons-material/Home';
// import { Link, useNavigate } from 'react-router-dom';
// import { AuthContext } from './authContext/authFile';
// import { useContext, useEffect, useState } from 'react';
// import { auth, db } from "./firebase/config";
// import { collection, doc, getDocs, limit, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';

// function Navbar(){
//     const authCtx = useContext(AuthContext);
//     const navigate = useNavigate();

//     const [isAdmin, setIsAdmin] = useState<boolean>(false);
//     const [isLocked, setIsLocked] = useState(false);

//     // 1. OPTIMIZED ROLE CHECK (Costs 0 reads if cached, 1 read if new)
//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, async (user) => {
//             if (user && user.email) {
                
//                 // A. Check Local Storage first (Free)
//                 const cachedRole = localStorage.getItem(`role_${user.email}`);
//                 if (cachedRole) {
//                     setIsAdmin(cachedRole === 'admin');
//                     return; // STOP HERE! Don't call Firestore.
//                 }

//                 // B. Only call Firestore if we don't know the role yet (Cost: 1 Read)
//                 try {
//                     const q = query(
//                         collection(db, "WMSUsers"), 
//                         where("email", "==", user.email),
//                         limit(1) // Safety Limit
//                     );
//                     const querySnapshot = await getDocs(q);

//                     if (!querySnapshot.empty) {
//                         const userData = querySnapshot.docs[0].data();
//                         const role = userData.role || "user";
                        
//                         // Save to cache so we don't pay for this read next time
//                         localStorage.setItem(`role_${user.email}`, role);
//                         setIsAdmin(role === "admin");
//                     } else {
//                         setIsAdmin(false);
//                     }
//                 } catch (error) {
//                     console.error("Error checking role:", error);
//                     setIsAdmin(false);
//                 }
//             } else {
//                 setIsAdmin(false);
//                 // Clear cache on logout
//                 localStorage.clear(); 
//             }
//         });

//         return () => unsubscribe();
//     }, []);

//     // 2. MAINTENANCE MODE LISTENER (Efficient)
//     useEffect(() => {
//         const logoutOthers = onSnapshot(doc(db, "WMSSettings", "toggleForAllowAdminLoginOnly"), (docSnapshot) => {
//             if(docSnapshot.exists()){
//                 const locked = docSnapshot.data().toggleAdmin;  
//                 setIsLocked(locked);
                
//                 // Logic: If locked AND user is logged in AND user is NOT admin
//                 if(locked && auth.currentUser && isAdmin === false){
//                     if(authCtx && authCtx.logout){
//                         alert("Maintenance Mode Initiated: Admin Access Only.");
//                         authCtx.logout();
//                         navigate("/login");
//                     }
//                 }
//             }
//         });
//         return () => logoutOthers();
//     }, [isAdmin, authCtx, navigate]);

//     const handleLockToggle = async () => {
//         try{
//             await updateDoc(doc(db, "WMSSettings", "toggleForAllowAdminLoginOnly"), {
//                 toggleAdmin: !isLocked
//             });
//         }catch(err){
//             console.error("Error updating lock:", err);
//             alert("Error: Ensure 'settings/config' document exists in Firestore.");
//         }
//     }

//     if (!authCtx) return null; 

//     return (
//     <>
//         <nav className="navbar navbar-dark bg-dark px-3 fixed-top">
//             <div className="d-flex w-100 justify-content-between align-items-center flex-nowrap">
//                 <div className="d-flex gap-3 align-items-center flex-nowrap overflow-hidden">
//                     <Link
//                     to="/dashboard"
//                     className="text-white text-decoration-none d-flex align-items-center text-nowrap"
//                     title="Products"
//                     >
//                     <HomeIcon fontSize="medium" />
//                     </Link>
//                     <Link className="text-white text-decoration-none text-nowrap" to="/addProduct">Add New</Link>
//                     <Link className="text-white text-decoration-none text-nowrap" to="/removeKTNs">Remove KTNs</Link>

//                     {isAdmin && (
//                         <div className="form-check form-switch d-flex align-items-center gap-1 text-nowrap">
//                             <input 
//                                 className="form-check-input" 
//                                 type="checkbox" 
//                                 id="adminLockSwitch"
//                                 checked={isLocked} 
//                                 onChange={handleLockToggle}
//                                 style={{ cursor: "pointer", backgroundColor: isLocked ? "red" : "" }} 
//                             />
//                             <label className="form-check-label" htmlFor="adminLockSwitch">
//                                 {isLocked ? "⛔ ADMIN ONLY" : "✅ OPEN ACCESS"}
//                             </label>
//                         </div>
//                     )}
//                 </div>
//                 <div className="flex-shrink-0 text-nowrap">
//                     {authCtx.loggedIn ? (<button onClick={() => { localStorage.clear(); authCtx.logout(); }} className='btn btn-danger btn-sm'>Logout</button>) :
//                         (<Link className="text-white text-decoration-none" to="/login">Login</Link>)
//                     }
//                 </div>
//             </div>
//          </nav>
//     </>
//   );

// }

// export default Navbar;
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import HomeIcon from '@mui/icons-material/Home';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext/authFile';
import { useContext, useEffect, useState } from 'react';
import { auth, db } from "./firebase/config";
import { collection, doc, getDocs, limit, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { isOutsideWorkingHoursInPoland } from './utils';

function Navbar(){
    const authCtx = useContext(AuthContext);
    const navigate = useNavigate();

    // Start as NULL (Loading) so we don't kick users out prematurely
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    // 1. ROLE CHECK
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.email) {
                // Reset to loading state immediately to prevent race conditions
                setUserRole(null);
                
                // A. Check Local Storage first (Zero Cost)
                // const cachedRole = localStorage.getItem(`role_${user.email}`);
                // if (cachedRole) {
                //     setIsAdmin(cachedRole.toLowerCase() === 'admin');
                //     return; 
                // }

                // B. Fetch from Firestore (1 Read)
                try {
                    let q = query(
                        collection(db, "WMSUsers"), 
                        where("email", "==", user.email),
                        limit(1)
                    );
                    let querySnapshot = await getDocs(q);

                    // Fallback to lowercase email if exact match fails
                    if (querySnapshot.empty) {
                        q = query(
                            collection(db, "WMSUsers"), 
                            where("email", "==", user.email.toLowerCase()),
                            limit(1)
                        );
                        querySnapshot = await getDocs(q);
                    }

                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data();
                        const role = userData.role || "user";
                        console.log(role);
                        // Save to cache
                        localStorage.setItem(`role_${user.email}`, role);
                        
                        setUserRole(role.toLowerCase());
                    } else {
                        setUserRole("user");
                    }
                } catch (error) {
                    console.error("Error checking role:", error);
                    setUserRole("user");
                }
            } else {
                setUserRole("user");
                localStorage.clear(); 
            }
        });

        return () => unsubscribe();
    }, []);

    // 2. MAINTENANCE LOCK LISTENER
    // useEffect(() => {
    //     const logoutOthers = onSnapshot(doc(db, "WMSSettings", "toggleForAllowAdminLoginOnly"), (docSnapshot) => {
    //         if(docSnapshot.exists()){
    //             const locked = docSnapshot.data().toggleAdmin;  
    //             setIsLocked(locked);
                
    //             // SAFETY CHECK: Only kick if isAdmin is explicitly FALSE.
    //             // If isAdmin is null (loading), we wait.
    //             if(locked && auth.currentUser && isAdmin === false){
    //                 if(authCtx && authCtx.logout){
    //                     alert("Maintenance Mode Initiated: Admin Access Only.");
    //                     authCtx.logout();
    //                     navigate("/login");
    //                 }
    //             }
    //         }
    //     });
    //     return () => logoutOthers();
    // }, [isAdmin, authCtx, navigate]);
    useEffect(() => {
        const unsubscribeLock = onSnapshot(doc(db, "WMSSettings", "toggleForAllowAdminLoginOnly"), (docSnapshot) => {
            if(docSnapshot.exists()){
                setIsLocked(docSnapshot.data().toggleAdmin);
            }
        });

        const evaluateAccess = () => {
            if (!auth.currentUser || !authCtx || !userRole) return;

            // Condition A: Manual Admin Lock
            if (isLocked && userRole !== "admin") {
                alert("Maintenance Mode Initiated: Admin Access Only.");
                authCtx.logout();
                navigate("/login");
                return;
            }

            // Condition B: Time Cutoff for standard users
            // if (userRole === "user" && isOutsideWorkingHoursInPoland()) {
            //     alert("Access Restricted: Warehouse operations are closed for regular users between 5:20 PM and 7:00 AM (Warsaw Time).");
            //     authCtx.logout();
            //     navigate("/login");
            // }
            // Condition B: Time Cutoff for users and super users
            if ((userRole === "user" || userRole === "s_user") && isOutsideWorkingHoursInPoland(userRole)) {
                const cutoffTime = userRole === "s_user" ? "10:00 PM" : "5:20 PM";
                alert(`Access Restricted: Warehouse operations are closed for your role between ${cutoffTime} and 7:00 AM (Warsaw Time).`);
                
                authCtx.logout();
                navigate("/login");
                return;
            }
        };

        // Run immediately
        evaluateAccess();

        // Run checking interval every 60 seconds
        const cronId = setInterval(evaluateAccess, 60000);

        return () => {
            unsubscribeLock();
            clearInterval(cronId);
        };
    }, [userRole, isLocked, authCtx, navigate]);

    const handleLockToggle = async () => {
        try{
            await updateDoc(doc(db, "WMSSettings", "toggleForAllowAdminLoginOnly"), {
                toggleAdmin: !isLocked
            });
        }catch(err){
            console.error("Error updating lock:", err);
            alert("Error: Ensure 'WMSSettings/toggleForAllowAdminLoginOnly' exists in Firestore.");
        }
    }

    if (!authCtx) return null; 

    return (
    <>
        <nav className="navbar navbar-dark bg-dark px-3 fixed-top">
            <div className="d-flex w-100 justify-content-between align-items-center flex-nowrap">
                <div className="d-flex gap-3 align-items-center flex-nowrap overflow-hidden">
                    <Link
                    to="/dashboard"
                    className="text-white text-decoration-none d-flex align-items-center text-nowrap"
                    title="Products"
                    >
                    <HomeIcon fontSize="medium" />
                    </Link>
                    <Link className="text-white text-decoration-none text-nowrap" to="/addProduct">Add New</Link>
                    <Link className="text-white text-decoration-none text-nowrap" to="/removeKTNs">Remove KTNs</Link>

                    {userRole === "admin" && (
                        <div className="form-check form-switch d-flex align-items-center gap-1 text-nowrap">
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
                <div className="flex-shrink-0 text-nowrap">
                    {authCtx.loggedIn ? (<button onClick={() => { localStorage.clear(); authCtx.logout(); }} className='btn btn-danger btn-sm'>Logout</button>) :
                        (<Link className="text-white text-decoration-none" to="/login">Login</Link>)
                    }
                </div>
            </div>
         </nav>
    </>
  );
}

export default Navbar;