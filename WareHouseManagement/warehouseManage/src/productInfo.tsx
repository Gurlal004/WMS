import { collection, getDocs, query, where, type Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase/config";
// import { useState } from "react";
// import { useParams } from "react-router-dom";

type ProductInfoType = {
    id: string, art_no: string, bill_no: number, ktns: number, user: string, createdAt: Timestamp
}

function ProductInfo(){
    const {id} = useParams<{id: string}>();
    const [removed, setRemoved] = useState<ProductInfoType[]>([]);
    
    useEffect(() => {
        const fetchRemoveInfo = async () => {
            if(!id) return;

            const q = query(collection(db, "WMSRemoveInfo"), where("projectId", "==", id));
            const docSnap = await getDocs(q);

            const list = docSnap.docs.map(d => ({
                id: d.id,
                ...(d.data() as Omit<ProductInfoType, "id">)
            }));
            setRemoved(list);
        };

        fetchRemoveInfo();
    }, []);

    return(
        <div className="container mt-4">
            {removed.length === 0 ? <p>Product Never removed</p> : <h4>Remove Info for {removed[0].art_no}</h4>}

            {removed.length > 0 && (
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Bill No</th>
                            <th>KTNs Removed</th>
                            <th>Removed By</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {removed.map(r => (
                            <tr key={r.id}>
                                <td>{r.bill_no}</td>
                                <td>{r.ktns}</td>
                                <td>{r.user}</td>
                                <td>{r.createdAt?.toDate().toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ProductInfo;
