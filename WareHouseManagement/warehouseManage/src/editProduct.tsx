import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, type ChangeEvent } from "react";
import { auth, db } from "./firebase/config";
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";

type Product = {
    id:string, art_no: string, ktn: number, pkg: number, pcs: number, location: string, magazyn: string, level: string, remarks: string,
}

function EditProduct(){
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const userEmail = auth.currentUser?.email;

    const [product, setProduct] = useState<Product | null>(null);
    const [productCopy, setProductCopy] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    
    // FIX 1: Add a "Saving" state to disable the button
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function fetchProduct(){
            if(!id) return;

            const docRef = doc(db, "WMSProjects", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = {
                    id: docSnap.id,
                    ...(docSnap.data() as Omit<Product, "id">),
                };
                setProduct(data);
                setProductCopy({...data});
            }
            setLoading(false);
        }
        fetchProduct();
    }, [id]);

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (!product) return <div className="text-center mt-5">Product not found</div>;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // NOTE: If you need decimals, use the string logic we discussed earlier. 
        // For now, this keeps your existing logic but beware of decimals!
        setProduct(prev => prev ? { ...prev, [name]: name === "ktn" || name === "pkg" ? Number(value) : value } : null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if(!product || !productCopy) return;

        // FIX 2: Prevent Double Clicks
        if(isSaving) return; 
        setIsSaving(true);

        try{
            const changes: string[] = [];
            const fieldsToCheck: (keyof Product)[] = ["art_no", "ktn", "pkg", "location", "magazyn", "level", "remarks"];

            fieldsToCheck.forEach((key) => {
                // FIX 3: ONLY add to log if the value is DIFFERENT
                if(productCopy[key] !== product[key]) {
                    changes.push(`${key}: ${productCopy[key]} -> ${product[key]}`);
                }
            });

            // FIX 4: Only create a Log Entry if there are actual changes
            if(changes.length > 0){
                await addDoc(collection(db, "WMSEditProductLogs"), {
                    projectId: product.id,
                    art_no: product.art_no, // Record Art No for easier searching
                    location: product.location,
                    level: product.level,
                    magazyn: product.magazyn,
                    changedBy: userEmail,
                    changedAt: serverTimestamp(),
                    changes: changes
                });
            }

            const docRef = doc(db, "WMSProjects", product.id);
            await updateDoc(docRef, {
                art_no: product.art_no,
                ktn: product.ktn,
                pkg: product.pkg,
                pcs: product.ktn * product.pkg,
                location: product.location,
                magazyn: product.magazyn,
                level: product.level,
                remarks: product.remarks,
                modifiedAt: serverTimestamp(),
                modifiedBy: userEmail
            });
            navigate("/dashboard");
        }catch(error){
            console.error("Error saving product", error);
            setIsSaving(false); // Re-enable button if error
        }
    };

    return(
        <>
            <form onSubmit={handleSave}>
                <h3 style={{fontWeight: 700}}>Edit Product: {product.art_no}</h3>
                
                {/* ... (Your Inputs remain the same) ... */}

                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="artNo" style={{fontSize: "1.2em", fontWeight: 700}}>Art No</label>
                        <input type="text" className="form-control" id="artNo" name="art_no" value={product.art_no} onChange={handleChange} style={{fontSize: "1.2em", fontWeight: 700}}></input>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="ktn" style={{fontSize: "1.2em", fontWeight: 700}}>KTN</label>
                        <input type="number" step="any" className="form-control" id="ktn" name="ktn" value={product.ktn} onChange={handleChange} style={{fontSize: "1.2em", fontWeight: 700}}></input>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="pkg" style={{fontSize: "1.2em", fontWeight: 700}}>PKG</label>
                        <input type="number" step="any" className="form-control" id="pkg" name="pkg" value={product.pkg} onChange={handleChange} style={{fontSize: "1.2em", fontWeight: 700}}></input>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="pcs" style={{fontSize: "1.2em", fontWeight: 700}}>PCS</label>
                        <input type="number" className="form-control" id="pcs" name="pcs" value={product.ktn * product.pkg} style={{fontSize: "1.2em", fontWeight: 700}} readOnly></input>
                    </div>
                </div>
                <label style={{fontSize: "1.2em", fontWeight: 700}}>Select Magazyn</label>
                <select className="form-control mb-2" value={product.magazyn} onChange={(e) => setProduct(prev => prev ? ({...prev, magazyn: e.target.value}) : prev)} style={{fontSize: "1.2em", fontWeight: 700}} required>
                    <option value="">Select Magazyn...</option>
                    <option value={"Mgzn 1"}>{"Mgzn 1"}</option>
                    <option value={"Mgzn 2"}>{"Mgzn 2"}</option>
                </select>
                <label style={{fontSize: "1.2em", fontWeight: 700}}>Select Magazyn Level</label>
                <select className="form-control mb-2" value={product.level} onChange={(e) => setProduct(prev => prev ? ({...prev, level: e.target.value}) : prev)} style={{fontSize: "1.2em", fontWeight: 700}} required>
                    <option value="">Select Magazyn Level...</option>
                    <option value={"Up"}>{"Up"}</option>
                    <option value={"Down"}>{"Down"}</option>
                </select>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="location" style={{fontSize: "1.2em", fontWeight: 700}}>Location</label>
                        <input type="text" className="form-control" id="location" name="location" value={product.location} onChange={handleChange} style={{fontSize: "1.2em", fontWeight: 700}} required></input>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="remarks" style={{fontSize: "1.2em", fontWeight: 700}}>Remarks</label>
                        <input type="text" className="form-control" id="remarks" name="remarks" value={product.remarks || ""} onChange={handleChange} style={{fontSize: "1.2em", fontWeight: 700}}></input>
                    </div>
                </div>

                {/* FIX 5: Disable button while saving */}
                <button type="submit" className="btn btn-primary w-100" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Product"}
                </button>
            </form>
        </>
    )
}

export default EditProduct;