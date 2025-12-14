import { useState, useRef } from "react";
import { auth, db } from "./firebase/config";
import {collection, addDoc, serverTimestamp} from "firebase/firestore";
import {useNavigate} from "react-router-dom";

function AddProduct(){
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        art_no: "", ktn: 0, pkg: 0, pcs: 0, level: "", magazyn: "", location: ""
    });
    const [loading, setLoading] = useState(false);
    
    const isSubmitting = useRef(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "ktn" || name === "pkg" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if(isSubmitting.current) return;
        isSubmitting.current = true;
        setLoading(true);

        try{
            const pcs = formData.ktn * formData.pkg;

            await addDoc(collection(db, "WMSProjects"), {
                ...formData,
                pcs: pcs,
                createdAt: serverTimestamp(),
                modifiedAt: serverTimestamp(),
                addedBy: auth.currentUser?.email, 
                modifiedBy: auth.currentUser?.email,
                remarks: auth.currentUser?.email,
            });
            setLoading(false);
            navigate("/dashboard");
        }catch(err){
            console.error(err);
            setLoading(false);
        }
    };

    if(loading){}

    return(
        <>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="artNo">Art No</label>
                        <input type="text" className="form-control" id="artNo" name="art_no" value={formData.art_no} onChange={handleChange} required></input>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="ktn">KTN</label>
                        <input type="number" className="form-control" id="ktn" name="ktn" value={formData.ktn} onChange={handleChange} required></input>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="pkg">PKG</label>
                        <input type="number" className="form-control" id="pkg" name="pkg" value={formData.pkg} onChange={handleChange} required></input>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="pcs">PCS</label>
                        <input type="number" className="form-control" id="pcs" name="pcs" value={formData.ktn * formData.pkg} onChange={handleChange} readOnly></input>
                    </div>
                </div>
                <label>Select Magazyn</label>
                <select className="form-control mb-2" value={formData.magazyn} onChange={(e) => setFormData(prev => ({...prev, magazyn: e.target.value}))} required>
                    <option value="">Select Magazyn...</option>
                    <option value={"Mgzn 1"}>{"Mgzn 1"}</option>
                    <option value={"Mgzn 2"}>{"Mgzn 2"}</option>
                    <option value={"Outside"}>{"Outside"}</option>
                </select>
                <label>Select Magazyn Level</label>
                <select className="form-control mb-2" value={formData.level} onChange={(e) => setFormData(prev => ({...prev, level: e.target.value}))} required>
                    <option value="">Select Magazyn Level...</option>
                    <option value={"Up"}>{"Up"}</option>
                    <option value={"Down"}>{"Down"}</option>
                </select>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="location">Location</label>
                        <input type="text" className="form-control" id="location" name="location" value={formData.location} onChange={handleChange} required></input>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-100">{loading ? "Adding..." : "Add Product"}</button>
            </form>
        </>
    )
}

export default AddProduct;