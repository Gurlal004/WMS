import { useNavigate, useParams } from "react-router-dom";
import { db } from "./firebase/config";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";

function DeleteProduct(){
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();

    const handleConfirmDelete = async () => {
        await deleteDoc(doc(db, "WMSProjects", id!));
        
        const removeRef = collection(db, "WMSRemoveInfo");
        const q = query(removeRef, where("projectId", "==", id));
        const queryRun = await getDocs(q);

        if(!queryRun.empty){
            // const docToDelete = queryRun.docs[0];
            // await deleteDoc(doc(db, "WMSRemoveInfo", docToDelete.id));
            // queryRun.forEach(async (doc) => {
            //     // 3. Delete THIS specific document
            //     await deleteDoc(doc.ref); 
            // });
            const deletePromises = queryRun.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        }

        navigate("/dashboard");
    }

    return (
    <>
        <div className="d-flex justify-content-center mt-5">
            <div className="card shadow" style={{ width: "22rem" }}>
                <div className="card-body text-center">

                    <h5 className="card-title text-danger mb-3">
                        Delete Product?
                    </h5>

                    <p className="card-text">
                        Are you sure you want to delete the product?
                    </p>

                    <div className="d-flex justify-content-around mt-4">
                        <button 
                            className="btn btn-danger w-45"
                            onClick={handleConfirmDelete}
                        >
                            Yes, Delete
                        </button>

                        <button 
                            className="btn btn-secondary w-45"
                            onClick={() => navigate(-1)}
                        >
                            No, Go Back
                        </button>
                    </div>

                </div>
            </div>
        </div>
    </>
);

}

export default DeleteProduct;