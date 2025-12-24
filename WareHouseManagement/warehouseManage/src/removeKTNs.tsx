// import { collection, doc, addDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, db } from "./firebase/config";

// type Product = {
//     id:string, art_no: string, ktn: number, pkg: number, pcs: number, location: string,
// }

// function RemoveKTNs(){
//     const [products, setProducts] = useState<Product[]>([]);
//     const [selectedId, setSelectedId] = useState("");
//     const [formData, setFormData] = useState({
//         art_no: "", ktn: 0, bill_no: 0,
//     });
//     const navigate = useNavigate();

//     const fetchProducts = async(art_no: String) => {
//         const q = query(
//             collection(db, "WMSProjects"), where("art_no", "==", art_no)
//         );
//         const snap = await getDocs(q);

//         const list: Product[] = snap.docs.map(d => ({
//             id: d.id, ...(d.data() as Omit<Product, "id">),
//         }));

//         setProducts(list);

//         if(list.length == 1){
//             setSelectedId(list[0].id);
//         }else{
//             setSelectedId("");
//         }
//     }

//     useEffect(() => {
//         if(formData.art_no.trim().length >= 1){
//             fetchProducts(formData.art_no);
//         }else{
//             setProducts([]);
//             setSelectedId("");
//         }
//     }, [formData.art_no]);

//     const selectedProduct = selectedId ? products.find(p => p.id == selectedId) : (products.length === 1 ? products[0] : undefined);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const {name, value} = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: name === "ktn" ? Number(value) : value,
//         }));
//     };

//     const handleRemove = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if(!selectedId) return;

//         const product = products.find(p => p.id === selectedId);
//         if (!product) return;

//         if (formData.ktn > product.ktn) {
//             alert("Cannot remove more KTN than available.");
//             setFormData(prev => ({
//                 ...prev,
//                 ktn: 0
//             }));
//             return;
//         }

//         const projectRef = doc(db, "WMSProjects", selectedId);

//         await addDoc(collection(db, "WMSRemoveInfo"), {
//             projectId: selectedId,
//             prod_id: product.id,
//             art_no: product.art_no,
//             ktns: formData.ktn,
//             bill_no: formData.bill_no,
//             removedAt: serverTimestamp(),
//             user: auth.currentUser?.email
//         }) 

//         await updateDoc(projectRef, {
//             ktn: product.ktn - formData.ktn,
//             pcs: (product.ktn - formData.ktn) * product.pkg,
//             modifiedAt: serverTimestamp()
//         });

//         navigate("/dashboard");
//     };

//     return(
//         <>
//             <form onSubmit={handleRemove}>
//                 <div className="form-row">
//                     <div className="form-group col-md-12 mb-2">
//                         <label htmlFor="artNo">Art No</label>
//                         <input type="text" className="form-control" id="artNo" name="art_no" value={formData.art_no} onChange={handleChange} required></input>
//                     </div>
//                 </div>

//                 {products?.length > 1 && (
//                     <>
//                         <label>Selection Location</label>
//                         <select className="form-control mb-2" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
//                             <option value="">Select Location...</option>
//                             {products.map(p => (
//                                 <option key={p.id} value={p.id}>{p.location}</option>
//                             ))}
//                         </select>
//                     </>
//                 )}

//                 {products.length === 1 && (
//                     <p className="text-success">Location: {products[0].location}</p>
//                 )}

//                 {(selectedId || products.length === 1) && (
//                     <>
//                         <label>Remove KTN - Left <span style={{ color: "red", fontWeight: "bold"}}>{selectedProduct?.ktn}</span></label>
//                         <input type="number" className="form-control mb-2" name="ktn" value={formData.ktn} onChange={handleChange} required />

//                         <label>Bill No</label>
//                         <input type="number" className="form-control mb-2" name="bill_no" value={formData.bill_no} onChange={handleChange} required />
                    
//                         <button type="submit" className="btn btn-primary w-100">Remove KTN</button>
//                     </>
//                 )}
//             </form>
//         </>
//     );
// }

// export default RemoveKTNs;

import { 
    collection, 
    doc, 
    addDoc, 
    getDocs, 
    query, 
    serverTimestamp, 
    updateDoc, 
    where 
} from "firebase/firestore";
import { useState } from "react"; // Removed useEffect
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase/config";
import SearchIcon from '@mui/icons-material/Search';

type Product = {
    id: string, 
    art_no: string, 
    ktn: number, 
    pkg: number, 
    pcs: number, 
    location: string,
}

function RemoveKTNs(){
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedId, setSelectedId] = useState("");
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [formData, setFormData] = useState({
        art_no: "", 
        ktn: 0, 
        bill_no: 0, // Initialize as number (0) not string
    });
    
    const navigate = useNavigate();

    // 1. New Search Function (Only runs when clicked)
    const handleSearch = async () => {
        if (!formData.art_no.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setProducts([]); // Clear old results
        setSelectedId("");

        try {
            // Find ALL locations for this specific Art No
            const q = query(
                collection(db, "WMSProjects"), 
                where("art_no", "==", formData.art_no)
            );
            const snap = await getDocs(q);

            const list: Product[] = snap.docs.map(d => ({
                id: d.id, 
                ...(d.data() as Omit<Product, "id">),
            }));

            setProducts(list);

            // Auto-select if there is only 1 location found
            if(list.length === 1){
                setSelectedId(list[0].id);
            }

        } catch (error) {
            console.error("Error searching:", error);
            alert("Search failed. Check console.");
        }
        setLoading(false);
    };

    // Helper to allow searching by pressing "Enter" key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submit
            handleSearch();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            // Ensure numbers are stored as numbers
            [name]: (name === "ktn" || name === "bill_no") ? Number(value) : value,
        }));
    };

    const handleRemove = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedId) return;

        const product = products.find(p => p.id === selectedId);
        if (!product) return;

        if (formData.ktn > product.ktn) {
            alert(`Cannot remove ${formData.ktn} KTN. Only ${product.ktn} available.`);
            return;
        }

        try {
            const projectRef = doc(db, "WMSProjects", selectedId);

            // 1. Add to History
            await addDoc(collection(db, "WMSRemoveInfo"), {
                projectId: selectedId,
                prod_id: product.id,
                art_no: product.art_no,
                ktns: Number(formData.ktn),
                bill_no: Number(formData.bill_no),
                removedAt: serverTimestamp(),
                user: auth.currentUser?.email
            }); 

            // 2. Update Stock
            await updateDoc(projectRef, {
                ktn: product.ktn - Number(formData.ktn),
                pcs: (product.ktn - Number(formData.ktn)) * product.pkg,
                modifiedAt: serverTimestamp()
            });

            navigate("/dashboard");
        } catch (error) {
            console.error("Error removing stock:", error);
            alert("Failed to remove stock.");
        }
    };

    // Helper to get currently selected product object
    const selectedProduct = products.find(p => p.id === selectedId);

    return(
        <div className="container mt-3">
            {/* SEARCH SECTION */}
            <div className="form-group mb-3">
                <label htmlFor="artNo">Search Art No</label>
                <div className="d-flex gap-2">
                    <input 
                        type="text" 
                        className="form-control" 
                        id="artNo" 
                        name="art_no" 
                        value={formData.art_no} 
                        onChange={handleChange} 
                        onKeyDown={handleKeyDown}
                        placeholder="Enter Art No..."
                        required
                    />
                    <button 
                        type="button" 
                        className="btn btn-primary d-flex align-items-center" 
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? "..." : <SearchIcon />} 
                    </button>
                </div>
            </div>

            {/* ERROR / EMPTY STATES */}
            {!loading && hasSearched && products.length === 0 && (
                <div className="alert alert-warning">No products found with that Art No.</div>
            )}

            {/* REMOVE FORM (Only shows if products found) */}
            {products.length > 0 && (
                <form onSubmit={handleRemove} className="card p-3 shadow-sm">
                    
                    {/* Location Selector (Only if multiple locations found) */}
                    {products.length > 1 && (
                        <div className="mb-3">
                            <label className="fw-bold">Select Location</label>
                            <select 
                                className="form-control" 
                                value={selectedId} 
                                onChange={(e) => setSelectedId(e.target.value)}
                            >
                                <option value="">-- Choose Location --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.location} (Qty: {p.ktn})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Single Location Display */}
                    {products.length === 1 && (
                        <div className="alert alert-info py-2">
                            <strong>Location:</strong> {products[0].location}
                        </div>
                    )}

                    {/* Actual Input Fields (Only show if a valid location is selected) */}
                    {selectedId && selectedProduct && (
                        <>
                            <div className="mb-2">
                                <label>
                                    Remove KTN <small className="text-muted">(Available: <span className="text-danger fw-bold">{selectedProduct.ktn}</span>)</small>
                                </label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    name="ktn" 
                                    value={formData.ktn} 
                                    onChange={handleChange} 
                                    min="1"
                                    max={selectedProduct.ktn}
                                    required 
                                />
                            </div>

                            <div className="mb-3">
                                <label>Bill No</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    name="bill_no" 
                                    value={formData.bill_no} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        
                            <button type="submit" className="btn btn-danger w-100">
                                Confirm Removal
                            </button>
                        </>
                    )}
                </form>
            )}
        </div>
    );
}

export default RemoveKTNs;