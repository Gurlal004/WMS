import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, type ChangeEvent } from "react";
import { db } from "./firebase/config";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

type Product = {
    id:string, art_no: string, ktn: number, pkg: number, pcs: number, location: string, magazyn: string, level: string, remarks: string,
}

function EditProduct(){
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProduct(){
            if(!id) return;

            const docRef = doc(db, "WMSProjects", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setProduct({
                    id: docSnap.id,
                    ...(docSnap.data() as Omit<Product, "id">),
                });
            }

            setLoading(false);
        }
        fetchProduct();
    }, [id]);

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (!product) return <div className="text-center mt-5">Product not found</div>;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProduct(prev => prev ? { ...prev, [name]: name === "ktn" || name === "pkg" ? Number(value) : value } : null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if(!product) return;
        const docRef = doc(db, "WMSProjects", product.id);

        await updateDoc(docRef, {
            art_no: product.art_no,
            ktn: product.ktn,
            pkg: product.pkg,
            pcs: product.ktn * product.pkg,
            location: product.location,
            modifiedAt: serverTimestamp(),
            remarks: product.remarks
        });
        navigate("/dashboard");
    };

    return(
        <>
            <form onSubmit={handleSave}>
                <h3>Edit Product: {product.art_no}</h3>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="artNo">Art No</label>
                        <input type="text" className="form-control" id="artNo" name="art_no" value={product.art_no} onChange={handleChange}></input>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="ktn">KTN</label>
                        <input type="number" className="form-control" id="ktn" name="ktn" value={product.ktn} onChange={handleChange}></input>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="pkg">PKG</label>
                        <input type="number" className="form-control" id="pkg" name="pkg" value={product.pkg} onChange={handleChange}></input>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="pcs">PCS</label>
                        <input type="number" className="form-control" id="pcs" name="pcs" value={product.ktn * product.pkg} onChange={handleChange}></input>
                    </div>
                </div>
                <label>Select Magazyn</label>
                <select className="form-control mb-2" value={product.magazyn} onChange={(e) => setProduct(prev => prev ? ({...prev, magazyn: e.target.value}) : prev)} required>
                    <option value="">Select Magazyn...</option>
                    <option value={"Mgzn 1"}>{"Mgzn 1"}</option>
                    <option value={"Mgzn 2"}>{"Mgzn 2"}</option>
                </select>
                <label>Select Magazyn Level</label>
                <select className="form-control mb-2" value={product.level} onChange={(e) => setProduct(prev => prev ? ({...prev, level: e.target.value}) : prev)} required>
                    <option value="">Select Magazyn Level...</option>
                    <option value={"Up"}>{"Up"}</option>
                    <option value={"Down"}>{"Down"}</option>
                </select>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="location">Location</label>
                        <input type="text" className="form-control" id="location" name="location" value={product.location} onChange={handleChange} required></input>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="remarks">Remarks</label>
                        <input type="text" className="form-control" id="remarks" name="remarks" value={product.remarks} onChange={handleChange}></input>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary w-100">Save Product</button>
            </form>
        </>
    )
}

export default EditProduct;