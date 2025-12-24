// import { useEffect, useState } from "react";
// import {auth, db} from "./firebase/config"
// import {collection, getDocs} from "firebase/firestore"
// import FloatingPlus from "./floatingPlus";
// import SearchBar from "./searchBar";
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from "@mui/icons-material/Delete";
// import InfoIcon from "@mui/icons-material/Info";
// import { useNavigate } from "react-router-dom";

// type Product = {
//     id: string;
//     art_no: string;
//     ktn: number;
//     pkg: number;
//     pcs: number;
//     location: string;
//     magazyn: string;
//     level: string;
// }

// type User = {
//     email: string;
//     role: string;
// }

// function Dashboard() {
//     const [products, setProducts] = useState<Product[]>([]);
//     const [users, setUsers] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState("");
//     const navigate = useNavigate();
//     const currentUserEmail = auth.currentUser?.email;
//     const currentUserRole = users.find(u => u.email === currentUserEmail)?.role;

//     useEffect(() => {
//         async function loadProducts(){
//             const querySnapshot = await getDocs(collection(db, "WMSProjects"));
//             const list: Product[] = [];

//             querySnapshot.forEach((doc)=> {
//                 list.push({
//                     id: doc.id,
//                     ...doc.data(),
//                 } as Product);
//             });
//             setProducts(list);
//             setLoading(false);
//         }
//         loadProducts();   
//     }, []);

//     useEffect(() => {
//         async function loadUsers(){
//             const querySnapshot = await getDocs(collection(db, "WMSUsers"));
//             const list: User[] = [];

//             querySnapshot.forEach((doc) =>{
//                 list.push(doc.data() as User);
//             });
//             setUsers(list);
//         }
//         loadUsers();
//     }, []);

//     const filteredProducts = products.filter((p) => p.art_no.toLowerCase().includes(search.toLowerCase()));
    
//     if(loading) return <div className="mt-5 text-center">Loading...</div>

//     return(
//         <>
//             <SearchBar search={search} setSearch={setSearch}/>
//             <div className="container">
//                 <div className="table-responsive" style={{ overflowX: "auto", maxWidth: "100vw", WebkitOverflowScrolling: "touch" }}>
//                     <table className="table table-bordered table-striped text-center">
//                     <thead className="table-dark">
//                         <tr>
//                             <th style={{ whiteSpace: "nowrap", width: "10%" }}>Art No</th>
//                             {currentUserRole === "admin" && <th style={{ width: "10%" }}>KTN</th>}
//                             {currentUserRole === "admin" && <th style={{ width: "10%" }}>PKG</th>}
//                             {currentUserRole === "admin" && <th style={{ width: "10%" }}>PCS</th>}
//                             <th style={{ width: "10%" }}>Magazyn</th>
//                             <th style={{ width: "10%" }}>Level</th>
//                             <th style={{ width: "40%" }}>Location</th>
//                             {(currentUserRole === "admin" || currentUserRole === "s_user") && <th style={{ width: "10%" }}>#</th>}                        
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredProducts.map((p) => (
//                         <tr key={p.id}>
//                             <td>{p.art_no}</td>
//                             {currentUserRole === "admin" && <td>{p.ktn}</td>}
//                             {currentUserRole === "admin" && <td>{p.pkg}</td>}
//                             {currentUserRole === "admin" && <td>{p.pcs}</td>}
//                             <td className="text-wrap text-break">{p.magazyn}</td>
//                             <td className="text-wrap text-break">{p.level}</td>
//                             <td className="text-wrap text-break">{p.location}</td>
//                             {(currentUserRole === "admin" || currentUserRole === "s_user") && (
//                                 <td>
//                                     <EditIcon
//                                     style={{ cursor: "pointer" }}
//                                     color="primary"
//                                     onClick={() => navigate(`/editProduct/${p.id}`)}
//                                     />

//                                     {currentUserRole === "admin" && (
//                                     <>
//                                         <DeleteIcon
//                                         style={{ cursor: "pointer" }}
//                                         onClick={() => navigate(`/deleteProduct/${p.id}`)}
//                                         />
//                                         <InfoIcon
//                                         style={{ cursor: "pointer" }}
//                                         onClick={() => navigate(`/productInfo/${p.id}`)}
//                                         />
//                                     </>
//                                     )}
//                                 </td>
//                                 )}
//                         </tr>
//                         ))}
//                     </tbody>
//                     </table>
//                 </div>
//             </div>
//             <FloatingPlus/>
//         </>
//     );
// }

// export default Dashboard;

import { useEffect, useState } from "react";
import { auth, db } from "./firebase/config";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  orderBy, 
  startAt, 
  endAt 
} from "firebase/firestore";
import FloatingPlus from "./floatingPlus";
import SearchBar from "./searchBar";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search'; // Added for the button

type Product = {
    id: string;
    art_no: string;
    ktn: number;
    pkg: number;
    pcs: number;
    location: string;
    magazyn: string;
    level: string;
}

type User = {
    email: string;
    role: string;
}

function Dashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    // We only need the string role, not the whole user list
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    
    // Track if a search has been performed so we can show "No results" vs empty state
    const [hasSearched, setHasSearched] = useState(false);

    const navigate = useNavigate();
    const currentUserEmail = auth.currentUser?.email;

    // ---------------------------------------------------------
    // OPTIMIZATION 1: Fetch ONLY the current user's role (Cost: 1 Read)
    // ---------------------------------------------------------
    useEffect(() => {
        async function loadUserRole() {
            if (!currentUserEmail) return;

            // Instead of downloading ALL users, we ask for just ONE.
            const q = query(
                collection(db, "WMSUsers"), 
                where("email", "==", currentUserEmail),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data() as User;
                setCurrentUserRole(userData.role);
            }
        }
        loadUserRole();
    }, [currentUserEmail]);


    // ---------------------------------------------------------
    // OPTIMIZATION 2: Search on Button Click Only (Cost: Max 10 Reads)
    // ---------------------------------------------------------
    const handleSearch = async () => {
        // Don't search if the box is empty
        if (!search.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setProducts([]); // Clear previous results

        try {
            // This query finds documents where art_no starts with the search term
            const q = query(
                collection(db, "WMSProjects"),
                orderBy("art_no"),
                startAt(search),
                endAt(search + '\uf8ff'), // \uf8ff is a high Unicode character that acts as a wildcard
                limit(10) // STRICT LIMIT to save money
            );

            const querySnapshot = await getDocs(q);
            const list: Product[] = [];

            querySnapshot.forEach((doc) => {
                list.push({
                    id: doc.id,
                    ...doc.data(),
                } as Product);
            });
            setProducts(list);

        } catch (error) {
            console.error("Error fetching products:", error);
            alert("Error searching. Check console. You might need to create an index.");
        }
        setLoading(false);
    };

    // Allow pressing "Enter" key to trigger search
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <>
            <div className="container mt-3">
                {/* Search Bar + Button Wrapper */}
                <div className="d-flex align-items-center mb-3">
                    <div className="flex-grow-1" onKeyDown={handleKeyDown}>
                        <SearchBar search={search} setSearch={setSearch} />
                    </div>
                    <button 
                        className="btn btn-primary ms-2" 
                        onClick={handleSearch}
                        disabled={loading}
                        style={{ height: "fit-content" }}
                    >
                        {loading ? "..." : <SearchIcon />} Search
                    </button>
                </div>
            </div>

            <div className="container">
                {/* Status Messages */}
                {loading && <div className="text-center mt-5">Loading...</div>}
                
                {!loading && hasSearched && products.length === 0 && (
                    <div className="alert alert-warning text-center">No products found for "{search}"</div>
                )}

                {/* Only show table if we actually have results */}
                {products.length > 0 && (
                    <div className="table-responsive" style={{ overflowX: "auto", maxWidth: "100vw", WebkitOverflowScrolling: "touch" }}>
                        <table className="table table-bordered table-striped text-center">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ whiteSpace: "nowrap", width: "10%" }}>Art No</th>
                                    {currentUserRole === "admin" && <th style={{ width: "10%" }}>KTN</th>}
                                    {currentUserRole === "admin" && <th style={{ width: "10%" }}>PKG</th>}
                                    {currentUserRole === "admin" && <th style={{ width: "10%" }}>PCS</th>}
                                    <th style={{ width: "10%" }}>Magazyn</th>
                                    <th style={{ width: "10%" }}>Level</th>
                                    <th style={{ width: "40%" }}>Location</th>
                                    {(currentUserRole === "admin" || currentUserRole === "s_user") && <th style={{ width: "10%" }}>#</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.art_no}</td>
                                        {currentUserRole === "admin" && <td>{p.ktn}</td>}
                                        {currentUserRole === "admin" && <td>{p.pkg}</td>}
                                        {currentUserRole === "admin" && <td>{p.pcs}</td>}
                                        <td className="text-wrap text-break">{p.magazyn}</td>
                                        <td className="text-wrap text-break">{p.level}</td>
                                        <td className="text-wrap text-break">{p.location}</td>
                                        {(currentUserRole === "admin" || currentUserRole === "s_user") && (
                                            <td>
                                                <EditIcon
                                                    style={{ cursor: "pointer" }}
                                                    color="primary"
                                                    onClick={() => navigate(`/editProduct/${p.id}`)}
                                                />

                                                {currentUserRole === "admin" && (
                                                    <>
                                                        <DeleteIcon
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => navigate(`/deleteProduct/${p.id}`)}
                                                        />
                                                        <InfoIcon
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => navigate(`/productInfo/${p.id}`)}
                                                        />
                                                    </>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <FloatingPlus />
        </>
    );
}

export default Dashboard;