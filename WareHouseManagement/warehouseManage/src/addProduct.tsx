import { useState, useRef } from "react";
import { auth, db } from "./firebase/config";
import {collection, addDoc, serverTimestamp} from "firebase/firestore";
import {useNavigate} from "react-router-dom";

function AddProduct(){
    const navigate = useNavigate()
    
    // 1. CHANGE: Initialize numbers as empty strings "" to allow typing decimals
    const [formData, setFormData] = useState({
        art_no: "", 
        ktn: "", // Store as string
        pkg: "", // Store as string
        pcs: 0, 
        level: "", 
        magazyn: "", 
        location: ""
    });
    const [loading, setLoading] = useState(false);
    
    const isSubmitting = useRef(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        
        // 2. CHANGE: Do NOT convert to Number() here. Keep it as a string.
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if(isSubmitting.current) return;
        isSubmitting.current = true;
        setLoading(true);

        try{
            // 3. CHANGE: Convert strings to Numbers ONLY when saving
            const numericKtn = Number(formData.ktn);
            const numericPkg = Number(formData.pkg);
            const pcs = Math.ceil((numericKtn * numericPkg) * 100) / 100;

            await addDoc(collection(db, "WMSProjects"), {
                ...formData,
                ktn: numericKtn, // Send number to DB
                pkg: numericPkg, // Send number to DB
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

    return(
        <>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="artNo" style={{fontSize: "1.2em", fontWeight: 700}}>Art No</label>
                        <input type="text" className="form-control" id="artNo" name="art_no" value={formData.art_no} onChange={handleChange} style={{fontSize: "1.2em", fontWeight: 700}} required></input>
                    </div>
                </div>
                
                {/* KTN INPUT */}
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="ktn" style={{fontSize: "1.2em", fontWeight: 700}}>KTN</label>
                        <input 
                            type="number" 
                            step="any" // 4. CHANGE: Allow decimal input in browser
                            className="form-control" 
                            id="ktn" 
                            name="ktn" 
                            value={formData.ktn} 
                            onChange={handleChange} 
                            style={{fontSize: "1.2em", fontWeight: 700}}
                            required
                        />
                    </div>
                </div>

                {/* PKG INPUT */}
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="pkg" style={{fontSize: "1.2em", fontWeight: 700}}>PKG</label>
                        <input 
                            type="number" 
                            step="any" // 4. CHANGE: Allow decimal input in browser
                            className="form-control" 
                            id="pkg" 
                            name="pkg" 
                            value={formData.pkg} 
                            onChange={handleChange} 
                            style={{fontSize: "1.2em", fontWeight: 700}}
                            required
                        />
                    </div>
                </div>

                {/* PCS INPUT (Read Only) */}
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="pcs" style={{fontSize: "1.2em", fontWeight: 700}}>PCS</label>
                        <input 
                            type="number" 
                            className="form-control" 
                            id="pcs" 
                            name="pcs" 
                            // 5. CHANGE: Convert to number just for calculation display
                            value={Math.ceil((Number(formData.ktn) * Number(formData.pkg)) * 100) / 100} 
                            style={{fontSize: "1.2em", fontWeight: 700}}
                            readOnly
                        />
                    </div>
                </div>

                <label style={{fontSize: "1.2em", fontWeight: 700}}>Select Magazyn</label>
                <select className="form-control mb-2" value={formData.magazyn} onChange={(e) => setFormData(prev => ({...prev, magazyn: e.target.value}))} style={{fontSize: "1.2em", fontWeight: 700}} required>
                    <option value="">Select Magazyn...</option>
                    <option value={"Mgzn 1"}>{"Mgzn 1"}</option>
                    <option value={"Mgzn 2"}>{"Mgzn 2"}</option>
                    <option value={"Outside"}>{"Outside"}</option>
                </select>
                <label style={{fontSize: "1.2em", fontWeight: 700}}>Select Magazyn Level</label>
                <select className="form-control mb-2" value={formData.level} onChange={(e) => setFormData(prev => ({...prev, level: e.target.value}))} style={{fontSize: "1.2em", fontWeight: 700}} required>
                    <option value="">Select Magazyn Level...</option>
                    <option value={"Up"}>{"Up"}</option>
                    <option value={"Down"}>{"Down"}</option>
                </select>
                <div className="form-row">
                    <div className="form-group col-md-12 mb-2">
                        <label htmlFor="location" style={{fontSize: "1.2em", fontWeight: 700}}>Location</label>
                        <input type="text" className="form-control" id="location" name="location" value={formData.location} onChange={handleChange} style={{fontSize: "1.2em", fontWeight: 700}} required></input>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-100">{loading ? "Adding..." : "Add Product"}</button>
            </form>
        </>
    )
}

export default AddProduct;