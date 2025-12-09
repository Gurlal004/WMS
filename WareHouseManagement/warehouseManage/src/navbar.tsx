import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Link } from 'react-router-dom';
import { AuthContext } from './authContext/authFile';
import { useContext } from 'react';

function Navbar(){

    const auth = useContext(AuthContext);

    if (!auth) return null; 

    return (
    <>
        <nav className="navbar navbar-dark bg-dark px-3 fixed-top">
            <div className="d-flex w-100 justify-content-between align-items-center">
                <div className="d-flex gap-3">
                    <Link className="text-white text-decoration-none" to="/dashboard">Products</Link>
                    <Link className="text-white text-decoration-none" to="/addProduct">Add New</Link>
                    <Link className="text-white text-decoration-none" to="/removeKTNs">Remove KTNs</Link>
                </div>
                <div>
                    {auth.loggedIn? (<button onClick={auth.logout} className='btn btn-danger btn-sm'>Logout</button>) :
                        (<Link className="text-white text-decoration-none" to="/login">Login</Link>)
                    };
                </div>
            </div>
         </nav>
    </>
  );

}


export default Navbar;