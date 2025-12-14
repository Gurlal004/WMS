import { useEffect, useState } from "react";
import {auth, db} from "./firebase/config"
import {collection, getDocs} from "firebase/firestore"
import FloatingPlus from "./floatingPlus";
import SearchBar from "./searchBar";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";

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
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const currentUserEmail = auth.currentUser?.email;
    const currentUserRole = users.find(u => u.email === currentUserEmail)?.role;

    useEffect(() => {
        async function loadProducts(){
            const querySnapshot = await getDocs(collection(db, "WMSProjects"));
            const list: Product[] = [];

            querySnapshot.forEach((doc)=> {
                list.push({
                    id: doc.id,
                    ...doc.data(),
                } as Product);
            });
            setProducts(list);
            setLoading(false);
        }
        loadProducts();   
    }, []);

    useEffect(() => {
        async function loadUsers(){
            const querySnapshot = await getDocs(collection(db, "WMSUsers"));
            const list: User[] = [];

            querySnapshot.forEach((doc) =>{
                list.push(doc.data() as User);
            });
            setUsers(list);
        }
        loadUsers();
    }, []);

    const filteredProducts = products.filter((p) => p.art_no.toLowerCase().includes(search.toLowerCase()));
    
    if(loading) return <div className="mt-5 text-center">Loading...</div>

    return(
        <>
            <SearchBar search={search} setSearch={setSearch}/>
            <div className="container">
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
                            {currentUserRole === "admin" && <th style={{ width: "10%" }}>#</th>}                        
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((p) => (
                        <tr key={p.id}>
                            <td>{p.art_no}</td>
                            {currentUserRole === "admin" && <td>{p.ktn}</td>}
                            {currentUserRole === "admin" && <td>{p.pkg}</td>}
                            {currentUserRole === "admin" && <td>{p.pcs}</td>}
                            <td className="text-wrap text-break">{p.magazyn}</td>
                            <td className="text-wrap text-break">{p.level}</td>
                            <td className="text-wrap text-break">{p.location}</td>
                            {currentUserRole === "admin" && <td>
                                <EditIcon 
                                style={{ cursor: "pointer" }}
                                color="primary"
                                onClick={() => navigate(`/editProduct/${p.id}`)}>
                                </EditIcon>
                                 <DeleteIcon 
                                    onClick={() => navigate(`/deleteProduct/${p.id}`)}
                                />
                                <InfoIcon
                                    onClick={() => navigate(`/productInfo/${p.id}`)
                                    }
                                />
                            </td>}
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>
            <FloatingPlus/>
        </>
    );
}

export default Dashboard;