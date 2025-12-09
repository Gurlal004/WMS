import { collection, doc, addDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase/config";

type Product = {
    id:string, art_no: string, ktn: number, pkg: number, pcs: number, location: string,
}

function RemoveKTNs(){
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedId, setSelectedId] = useState("");
    const [formData, setFormData] = useState({
        art_no: "", ktn: 0, bill_no: 0,
    });
    const navigate = useNavigate();

    const fetchProducts = async(art_no: String) => {
        const q = query(
            collection(db, "WMSProjects"), where("art_no", "==", art_no)
        );
        const snap = await getDocs(q);

        const list: Product[] = snap.docs.map(d => ({
            id: d.id, ...(d.data() as Omit<Product, "id">),
        }));

        setProducts(list);

        if(list.length == 1){
            setSelectedId(list[0].id);
        }else{
            setSelectedId("");
        }
    }

    useEffect(() => {
        if(formData.art_no.trim().length >= 1){
            fetchProducts(formData.art_no);
        }else{
            setProducts([]);
            setSelectedId("");
        }
    }, [formData.art_no]);

    const selectedProduct = selectedId ? products.find(p => p.id == selectedId) : (products.length === 1 ? products[0] : undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "ktn" ? Number(value) : value,
        }));
    };

    const handleRemove = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedId) return;

        const product = products.find(p => p.id === selectedId);
        if (!product) return;

        if (formData.ktn > product.ktn) {
            alert("Cannot remove more KTN than available.");
            setFormData(prev => ({
                ...prev,
                ktn: 0
            }));
            return;
        }

        const projectRef = doc(db, "WMSProjects", selectedId);

        await addDoc(collection(db, "WMSRemoveInfo"), {
            projectId: selectedId,
            prod_id: product.id,
            art_no: product.art_no,
            ktns: formData.ktn,
            bill_no: formData.bill_no,
            createdAt: serverTimestamp(),
            user: auth.currentUser?.email
        }) 

        await updateDoc(projectRef, {
            ktn: product.ktn - formData.ktn,
            pcs: (product.ktn - formData.ktn) * product.pkg,
            modifiedAt: serverTimestamp()
        });

        navigate("/dashboard");
    };

    return(
        <>
            <form onSubmit={handleRemove}>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="artNo">Art No</label>
                        <input type="text" className="form-control" id="artNo" name="art_no" value={formData.art_no} onChange={handleChange} required></input>
                    </div>
                </div>

                {products?.length > 1 && (
                    <>
                        <label>Selection Location</label>
                        <select className="form-control mb-2" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                            <option value="">Select Location...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.location}</option>
                            ))}
                        </select>
                    </>
                )}

                {products.length === 1 && (
                    <p className="text-success">Location: {products[0].location}</p>
                )}

                {(selectedId || products.length === 1) && (
                    <>
                        <label>Remove KTN - Left <span style={{ color: "red", fontWeight: "bold"}}>{selectedProduct?.ktn}</span></label>
                        <input type="number" className="form-control mb-2" name="ktn" value={formData.ktn} onChange={handleChange} required />

                        <label>Bill No</label>
                        <input type="number" className="form-control mb-2" name="bill_no" value={formData.bill_no} onChange={handleChange} required />
                    
                        <button type="submit" className="btn btn-primary w-100">Remove KTN</button>
                    </>
                )}
            </form>
        </>
    );
}

export default RemoveKTNs;