import { collection, getDocs, query, where, type Timestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "./firebase/config";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from "@mui/icons-material/Check";
// import { useState } from "react";
// import { useParams } from "react-router-dom";

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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editBill, setEditBill] = useState(0);
    const [editKTN, setEditKTN] = useState(0);
    const [users, setUsers] = useState<User[]>([]);
    const currentUserEmail = auth.currentUser?.email;
    const currentUserRole = users.find(u => u.email === currentUserEmail)?.role;
    
    
    useEffect(() => {
        const fetchRemoveInfo = async () => {
            if(!id) return;

            const q = query(collection(db, "WMSRemoveInfo"), where("projectId", "==", id));
            const qq = doc(db, "WMSProjects", id);

            const docSnap = await getDocs(q);
            const docSnapqq = await getDoc(qq);

            setRemoved(
                docSnap.docs.map(d => ({
                    id: d.id,
                    ...(d.data() as Omit<ProductRemoveInfoType, "id">)
                }))
            );

            // const list = docSnap.docs.map(d => ({
            //     id: d.id,
            //     ...(d.data() as Omit<ProductRemoveInfoType, "id">)
            // }));

            if(docSnapqq.exists()){
                setProInfo({
                    id: docSnapqq.id,
                    ...(docSnapqq.data() as Omit<ProductAddInfo, "id">)
                });
            }else{
                setProInfo(null);
            }

            // setRemoved(list);
        };

        fetchRemoveInfo();
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

    const startEdit = (r : ProductRemoveInfoType) => {
        setEditingId(r.id);
        setEditBill(r.bill_no);
        setEditKTN(r.ktns);
    };

    const saveEdit = async (rowId: string) => {
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
    };



    return(
        <div className="container mt-4">
            {<p>Product remarked by : {proInfo?.remarks}</p>}
            {<p>Product added by : {proInfo?.addedBy}</p>}
            {<p>Product modified by : {proInfo?.modifiedBy}</p>}
            {<p>Product added at : {proInfo?.createdAt?.toDate().toLocaleString()}</p>}
            {<p>Product modified at : {proInfo?.modifiedAt?.toDate().toLocaleString()}</p>}

            {removed.length === 0 ? <h4 style={{textAlign: "center"}}>Product Never Removed</h4> : <h4 style={{textAlign: "center"}}>Remove Info for {removed[0].art_no}</h4>}

            {removed.length > 0 && (
                <table className="table table-bordered">
                    <thead>
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
                                    {/* {r.bill_no} */}
                                    {editingId === r.id ? (
                                        <input type="number" className="form-control" value={editBill} onChange={e => setEditBill(Number(e.target.value))}/>
                                    ) : (
                                        r.bill_no
                                    )}
                                </td>
                                <td>
                                    {/* {r.ktns} */}
                                    {editingId === r.id ? (
                                        <input type="number" className="form-control" value={editKTN} onChange={e => setEditKTN(Number(e.target.value))}/>
                                    ) : (
                                        r.ktns
                                    )}
                                </td>
                                <td>{r.user}</td>
                                <td>{r.removedAt?.toDate().toLocaleString()}</td>
                                {currentUserRole === "admin" && <td>
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
                                </td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ProductInfo;
