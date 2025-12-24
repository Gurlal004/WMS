import SearchBar from "./searchBar";
import { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from "@mui/icons-material/Info";
import { collection, endAt, getDocs, limit, orderBy, query, startAt } from "firebase/firestore";
import { db } from "./firebase/config";
import { useNavigate } from "react-router-dom";

type ProductLog = {
    id: string;
    projectId: string;
    art_no: string;
    location: string;
    magazyn: string;
    level: string;
}

function GetProductLog(){
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [productLog, setProductLog] = useState<ProductLog[]>([]);
    const navigate = useNavigate();

    const handleSearch = async () => {
        if(!search.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setProductLog([]);

        try{
            const q = query(
                collection(db, "WMSEditProductLogs"),
                orderBy("art_no"),
                startAt(search),
                endAt(search + '\uf8ff'),
                limit(10)
            );
            const querySnapshot = await getDocs(q);
            const list: ProductLog[] = [];

            querySnapshot.forEach((doc) => {
                list.push({
                    id: doc.id,
                    ...doc.data(),
                } as ProductLog);
            });
            setProductLog(list);
        }catch(error){
            console.log("Error", error);
        }
        setLoading(false);
    };


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return(
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
                {loading && <div className="text-center mt-5">Loading...</div>}
                
                {!loading && hasSearched && productLog.length === 0 && (
                    <div className="alert alert-warning text-center">No product log found for "{search}"</div>
                )}

                {productLog.length > 0 && (
                    <div className="table-responsive" style={{ overflowX: "auto", maxWidth: "100vw", WebkitOverflowScrolling: "touch" }}>
                        <table className="table table-bordered table-striped text-center">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ whiteSpace: "nowrap", width: "10%" }}>Art No</th>
                                    <th style={{ whiteSpace: "nowrap", width: "10%" }}>Magazyn</th>
                                    <th style={{ whiteSpace: "nowrap", width: "10%" }}>Level</th>
                                    <th style={{ whiteSpace: "nowrap", width: "30%" }}>Location</th>
                                    <th style={{ width: "10%" }}>#</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productLog.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.art_no}</td>
                                        <td>{p.magazyn}</td>
                                        <td>{p.level}</td>
                                        <td>{p.location}</td>
                                        <td>
                                            <InfoIcon
                                                style={{ cursor: "pointer" }}
                                                onClick={() => navigate(`/productFromLogInfo/${p.projectId}`)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}

export default GetProductLog;