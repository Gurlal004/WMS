// import { collection, getDocs, orderBy, query, where, type Timestamp } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { db } from "./firebase/config";

// type ProductLog = {
//     id: string;
//     art_no: string;
//     location: string;
//     magazyn: string;
//     level: string;
//     changedBy: string;
//     changedAt: Timestamp;
//     changes: string [];
// }

// function ProductFromLogInfo(){
//     const {id} = useParams<{id: string}>();
//     const [productLog, setProductLog] = useState<ProductLog[]>([]);
//     const [loading, setLoading] = useState(true);

//         useEffect(() => {
//             const fetchProductLog = async () => {
//                 if(!id) return;

//                 try{
//                     const q = query(collection(db, "WMSEditProductLogs"), where("projectId", "==", id), orderBy("changedAt", "desc"));
//                     const snap = await getDocs(q);

//                     const loadedLogs: ProductLog[] = snap.docs.map(doc => ({
//                         id: doc.id,
//                         ...(doc.data() as Omit<ProductLog, "id">)
//                     }));
//                     setProductLog(loadedLogs);
//                 }catch(error){
//                     console.log("Error", error);
//                 } finally{
//                     setLoading(false);
//                 }
//             };
//             fetchProductLog();
//         }, [id]);

//         if(loading) return <div className="text-center mt-5">Loading...</div>;

//         return (
//         <div className="container mt-4">
//             <h3 className="mb-4">Edit History</h3>

//             {productLog.length === 0 ? (
//                 <div className="alert alert-info">No edits recorded for this product.</div>
//             ) : (
//                 <div className="table-responsive">
//                     <table className="table table-bordered table-striped">
//                         <thead className="table-dark">
//                             <tr>
//                                 <th>Date</th>
//                                 <th>User</th>
//                                 <th>Changes Made</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {productLog.map((log) => (
//                                 <tr key={log.id}>
//                                     {/* Format Date */}
//                                     <td style={{ whiteSpace: "nowrap" }}>
//                                         {log.changedAt?.toDate().toLocaleString()}
//                                     </td>
                                    
//                                     {/* User Email */}
//                                     <td>{log.changedBy}</td>
                                    
//                                     {/* Render the list of changes */}
//                                     <td>
//                                         <ul className="mb-0" style={{ paddingLeft: "1.2rem" }}>
//                                             {log.changes && log.changes.map((change, index) => (
//                                                 <li key={index}>{change}</li>
//                                             ))}
//                                         </ul>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default ProductFromLogInfo;
import { collection, getDocs, orderBy, query, where, type Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "./firebase/config";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type ProductLog = {
    id: string;
    art_no: string;
    location: string;
    magazyn: string;
    level: string;
    changedBy: string;
    changedAt: Timestamp;
    changes: string[];
}

function ProductFromLogInfo() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [productLog, setProductLog] = useState<ProductLog[]>([]);
    const [loading, setLoading] = useState(true);
    // State to hold the Art No for the title
    const [artNo, setArtNo] = useState<string>(""); 

    useEffect(() => {
        const fetchProductLog = async () => {
            if (!id) return;

            try {
                // Ensure this matches your collection name ('WMSLogs' or 'WMSEditProductLogs')
                const q = query(
                    collection(db, "WMSEditProductLogs"), 
                    where("projectId", "==", id), 
                    orderBy("changedAt", "desc")
                );
                const snap = await getDocs(q);

                const loadedLogs: ProductLog[] = snap.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<ProductLog, "id">)
                }));

                setProductLog(loadedLogs);

                // Extract Art No from the first log entry if available
                if (loadedLogs.length > 0) {
                    setArtNo(loadedLogs[0].art_no);
                }

            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductLog();
    }, [id]);

    if (loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container mt-4">
            
            {/* Top Navigation Row */}
            <div className="d-flex align-items-center mb-4">
                <button 
                    className="btn btn-secondary me-3 d-flex align-items-center"
                    onClick={() => navigate(-1)}
                >
                    <ArrowBackIcon fontSize="small" className="me-1"/> Back
                </button>
                <h3 className="mb-0">
                    Edit History {artNo ? `of ${artNo}` : ""}
                </h3>
            </div>

            {productLog.length === 0 ? (
                <div className="alert alert-info">
                    No edits recorded for this product.<br/>
                    <small className="text-muted">(If you just added this code, check Console F12 for Index error)</small>
                </div>
            ) : (
                /* Responsive Table Wrapper (Same as Dashboard) */
                <div className="table-responsive" style={{ overflowX: "auto", maxWidth: "100vw", WebkitOverflowScrolling: "touch" }}>
                    <table className="table table-bordered table-striped text-center">
                        <thead className="table-dark">
                            <tr>
                                <th style={{ whiteSpace: "nowrap", width: "20%" }}>Date</th>
                                <th style={{ whiteSpace: "nowrap", width: "30%" }}>User</th>
                                <th style={{ width: "50%" }}>Changes Made</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productLog.map((log) => (
                                <tr key={log.id}>
                                    {/* Date Column */}
                                    <td style={{ whiteSpace: "nowrap" }}>
                                        {log.changedAt?.toDate().toLocaleString()}
                                    </td>
                                    
                                    {/* User Column */}
                                    <td className="text-break">{log.changedBy}</td>
                                    
                                    {/* Changes Column */}
                                    <td className="text-start">
                                        <ul className="mb-0" style={{ paddingLeft: "1.2rem" }}>
                                            {log.changes && log.changes.map((change, index) => (
                                                <li key={index}>{change}</li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ProductFromLogInfo;