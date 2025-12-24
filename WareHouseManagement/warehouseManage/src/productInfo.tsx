// import { collection, getDocs, query, where, type Timestamp, doc, getDoc, updateDoc } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { auth, db } from "./firebase/config";
// import EditIcon from '@mui/icons-material/Edit';
// import CheckIcon from "@mui/icons-material/Check";
// // import { useState } from "react";
// // import { useParams } from "react-router-dom";

// type ProductRemoveInfoType = {
//     id: string, art_no: string, bill_no: number, ktns: number, user: string, removedAt: Timestamp,
// }

// type ProductAddInfo = {
//     id: string, createdAt: Timestamp, modifiedAt: Timestamp, addedBy: string, modifiedBy: string, remarks: string,
// }

// type User = {
//     email: string;
//     role: string;
// }

// function ProductInfo(){
//     const {id} = useParams<{id: string}>();
//     const [removed, setRemoved] = useState<ProductRemoveInfoType[]>([]);
//     const [proInfo, setProInfo] = useState<ProductAddInfo | null>(null);
//     const [editingId, setEditingId] = useState<string | null>(null);
//     const [editBill, setEditBill] = useState(0);
//     const [editKTN, setEditKTN] = useState(0);
//     const [users, setUsers] = useState<User[]>([]);
//     const currentUserEmail = auth.currentUser?.email;
//     const currentUserRole = users.find(u => u.email === currentUserEmail)?.role;
    
    
//     useEffect(() => {
//         const fetchRemoveInfo = async () => {
//             if(!id) return;

//             const q = query(collection(db, "WMSRemoveInfo"), where("projectId", "==", id));
//             const qq = doc(db, "WMSProjects", id);

//             const docSnap = await getDocs(q);
//             const docSnapqq = await getDoc(qq);

//             setRemoved(
//                 docSnap.docs.map(d => ({
//                     id: d.id,
//                     ...(d.data() as Omit<ProductRemoveInfoType, "id">)
//                 }))
//             );

//             // const list = docSnap.docs.map(d => ({
//             //     id: d.id,
//             //     ...(d.data() as Omit<ProductRemoveInfoType, "id">)
//             // }));

//             if(docSnapqq.exists()){
//                 setProInfo({
//                     id: docSnapqq.id,
//                     ...(docSnapqq.data() as Omit<ProductAddInfo, "id">)
//                 });
//             }else{
//                 setProInfo(null);
//             }

//             // setRemoved(list);
//         };

//         fetchRemoveInfo();
//     }, []);

//     useEffect(() => {
//             async function loadUsers(){
//                 const querySnapshot = await getDocs(collection(db, "WMSUsers"));
//                 const list: User[] = [];
    
//                 querySnapshot.forEach((doc) =>{
//                     list.push(doc.data() as User);
//                 });
//                 setUsers(list);
//             }
//             loadUsers();
//         }, []);

//     const startEdit = (r : ProductRemoveInfoType) => {
//         setEditingId(r.id);
//         setEditBill(r.bill_no);
//         setEditKTN(r.ktns);
//     };

//     const saveEdit = async (rowId: string) => {
//         await updateDoc(doc(db, "WMSRemoveInfo", rowId), {
//             bill_no: editBill,
//             ktns: editKTN,
//         });

//         setRemoved(prev =>
//         prev.map(r =>
//             r.id === rowId ? { ...r, bill_no: editBill, ktns: editKTN } : r
//             )
//         );
//         setEditingId(null);
//     };



//     return(
//         <div className="container mt-4">
//             {<p>Product remarked by : {proInfo?.remarks}</p>}
//             {<p>Product added by : {proInfo?.addedBy}</p>}
//             {<p>Product modified by : {proInfo?.modifiedBy}</p>}
//             {<p>Product added at : {proInfo?.createdAt?.toDate().toLocaleString()}</p>}
//             {<p>Product modified at : {proInfo?.modifiedAt?.toDate().toLocaleString()}</p>}

//             {removed.length === 0 ? <h4 style={{textAlign: "center"}}>Product Never Removed</h4> : <h4 style={{textAlign: "center"}}>Remove Info for {removed[0].art_no}</h4>}

//             {removed.length > 0 && (
//                 <table className="table table-bordered">
//                     <thead>
//                         <tr>
//                             <th>Bill No</th>
//                             <th>KTNs Removed</th>
//                             <th>Removed By</th>
//                             <th>Date</th>
//                             {currentUserRole === "admin" && <th>#</th>}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {removed.map(r => (
//                             <tr key={r.id}>
//                                 <td>
//                                     {/* {r.bill_no} */}
//                                     {editingId === r.id ? (
//                                         <input type="number" className="form-control" value={editBill} onChange={e => setEditBill(Number(e.target.value))}/>
//                                     ) : (
//                                         r.bill_no
//                                     )}
//                                 </td>
//                                 <td>
//                                     {/* {r.ktns} */}
//                                     {editingId === r.id ? (
//                                         <input type="number" className="form-control" value={editKTN} onChange={e => setEditKTN(Number(e.target.value))}/>
//                                     ) : (
//                                         r.ktns
//                                     )}
//                                 </td>
//                                 <td>{r.user}</td>
//                                 <td>{r.removedAt?.toDate().toLocaleString()}</td>
//                                 {currentUserRole === "admin" && <td>
//                                     {editingId === r.id ? (
//                                         <CheckIcon
//                                             style={{ cursor: "pointer" }}
//                                             color="success"
//                                             onClick={() => saveEdit(r.id)}
//                                         />
//                                     ) : (
//                                         <EditIcon
//                                             style={{ cursor: "pointer" }}
//                                             color="primary"
//                                             onClick={() => startEdit(r)}
//                                         />
//                                     )}
//                                 </td>}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// }

// export default ProductInfo;

import { 
    collection, 
    getDocs, 
    query, 
    where, 
    Timestamp, 
    doc, 
    getDoc, 
    updateDoc, 
    limit 
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "./firebase/config";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from "@mui/icons-material/Check";

type ProductRemoveInfoType = {
    id: string, art_no: string, bill_no: number, ktns: number, user: string, removedAt: Timestamp,
}

type ProductAddInfo = {
    id: string, createdAt: Timestamp, modifiedAt: Timestamp, addedBy: string, modifiedBy: string, remarks: string,
}

type User = {
    email: string;
    role: string;
}

function ProductInfo(){
    const {id} = useParams<{id: string}>();
    const [removed, setRemoved] = useState<ProductRemoveInfoType[]>([]);
    const [proInfo, setProInfo] = useState<ProductAddInfo | null>(null);
    
    // Edit States
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editBill, setEditBill] = useState(0);
    const [editKTN, setEditKTN] = useState(0);
    
    // Optimization: Store role string directly, don't store a list of users
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const currentUserEmail = auth.currentUser?.email;

    // ---------------------------------------------------------
    // OPTIMIZATION 1: Fetch ONLY the current user's role (Cost: 1 Read)
    // ---------------------------------------------------------
    useEffect(() => {
        async function loadUserRole() {
            if (!currentUserEmail) return;

            // Query specifically for the logged-in user
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
    // OPTIMIZATION 2: Efficient Data Loading (Parallel Requests)
    // ---------------------------------------------------------
    useEffect(() => {
        const fetchProductData = async () => {
            if(!id) return;

            try {
                // Prepare queries
                const removeQuery = query(collection(db, "WMSRemoveInfo"), where("projectId", "==", id));
                const productRef = doc(db, "WMSProjects", id);

                // Execute both at the same time (Faster UX)
                const [removeSnap, productSnap] = await Promise.all([
                    getDocs(removeQuery),
                    getDoc(productRef)
                ]);

                // 1. Process Removal History
                setRemoved(
                    removeSnap.docs.map(d => ({
                        id: d.id,
                        ...(d.data() as Omit<ProductRemoveInfoType, "id">)
                    }))
                );

                // 2. Process Product Details
                if(productSnap.exists()){
                    setProInfo({
                        id: productSnap.id,
                        ...(productSnap.data() as Omit<ProductAddInfo, "id">)
                    });
                } else {
                    setProInfo(null);
                }
            } catch (error) {
                console.error("Error loading product info:", error);
            }
        };

        fetchProductData();
    }, [id]); // Depend on ID so it refreshes if ID changes

    const startEdit = (r : ProductRemoveInfoType) => {
        setEditingId(r.id);
        setEditBill(r.bill_no);
        setEditKTN(r.ktns);
    };

    const saveEdit = async (rowId: string) => {
        try {
            await updateDoc(doc(db, "WMSRemoveInfo", rowId), {
                bill_no: editBill,
                ktns: editKTN,
            });
    
            setRemoved(prev =>
            prev.map(r =>
                r.id === rowId ? { ...r, bill_no: editBill, ktns: editKTN } : r
                )
            );
            setEditingId(null);
        } catch (error) {
            console.error("Error updating remove info:", error);
            alert("Could not update. Check console.");
        }
    };

    return(
        <div className="container mt-4">
            {proInfo && (
                <div className="mb-4">
                    <p><strong>Remarks:</strong> {proInfo.remarks || "None"}</p>
                    <p><strong>Added by:</strong> {proInfo.addedBy}</p>
                    <p><strong>Modified by:</strong> {proInfo.modifiedBy}</p>
                    <p><strong>Added at:</strong> {proInfo.createdAt?.toDate().toLocaleString()}</p>
                    <p><strong>Modified at:</strong> {proInfo.modifiedAt?.toDate().toLocaleString()}</p>
                </div>
            )}

            {removed.length === 0 ? (
                <h4 style={{textAlign: "center"}}>Product Never Removed</h4>
            ) : (
                <h4 style={{textAlign: "center"}}>
                    Remove Info for {removed[0]?.art_no || "Product"}
                </h4>
            )}

            {removed.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Bill No</th>
                                <th>KTNs Removed</th>
                                <th>Removed By</th>
                                <th>Date</th>
                                {currentUserRole === "admin" && <th>#</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {removed.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        {editingId === r.id ? (
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                value={editBill} 
                                                onChange={e => setEditBill(Number(e.target.value))}
                                            />
                                        ) : (
                                            r.bill_no
                                        )}
                                    </td>
                                    <td>
                                        {editingId === r.id ? (
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                value={editKTN} 
                                                onChange={e => setEditKTN(Number(e.target.value))}
                                            />
                                        ) : (
                                            r.ktns
                                        )}
                                    </td>
                                    <td>{r.user}</td>
                                    <td>{r.removedAt?.toDate().toLocaleString()}</td>
                                    {currentUserRole === "admin" && (
                                        <td>
                                            {editingId === r.id ? (
                                                <CheckIcon
                                                    style={{ cursor: "pointer" }}
                                                    color="success"
                                                    onClick={() => saveEdit(r.id)}
                                                />
                                            ) : (
                                                <EditIcon
                                                    style={{ cursor: "pointer" }}
                                                    color="primary"
                                                    onClick={() => startEdit(r)}
                                                />
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
    );
}

export default ProductInfo;