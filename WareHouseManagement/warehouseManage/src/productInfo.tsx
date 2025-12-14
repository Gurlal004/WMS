import { collection, getDocs, query, where, type Timestamp, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase/config";
// import { useState } from "react";
// import { useParams } from "react-router-dom";

type ProductRemoveInfoType = {
    id: string, art_no: string, bill_no: number, ktns: number, user: string, removedAt: Timestamp,
}

type ProductAddInfo = {
    id: string, createdAt: Timestamp, modifiedAt: Timestamp, addedBy: string, modifiedBy: string, remarks: string,
}

function ProductInfo(){
    const {id} = useParams<{id: string}>();
    const [removed, setRemoved] = useState<ProductRemoveInfoType[]>([]);
    const [proInfo, setProInfo] = useState<ProductAddInfo | null>(null);
    
    useEffect(() => {
        const fetchRemoveInfo = async () => {
            if(!id) return;

            const q = query(collection(db, "WMSRemoveInfo"), where("projectId", "==", id));
            const qq = doc(db, "WMSProjects", id);

            const docSnap = await getDocs(q);
            const docSnapqq = await getDoc(qq);

            const list = docSnap.docs.map(d => ({
                id: d.id,
                ...(d.data() as Omit<ProductRemoveInfoType, "id">)
            }));

            if(docSnapqq.exists()){
                setProInfo({
                    id: docSnapqq.id,
                    ...(docSnapqq.data() as Omit<ProductAddInfo, "id">)
                });
            }else{
                setProInfo(null);
            }

            setRemoved(list);
        };

        fetchRemoveInfo();
    }, []);

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
                        </tr>
                    </thead>
                    <tbody>
                        {removed.map(r => (
                            <tr key={r.id}>
                                <td>{r.bill_no}</td>
                                <td>{r.ktns}</td>
                                <td>{r.user}</td>
                                <td>{r.removedAt?.toDate().toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ProductInfo;
