import Login from './login'
import Dashboard from './dashboard'
import AddProduct from './addProduct'
import ProtectedRoute from './protectedRoutes'
import './App.css'
import Navbar from './navbar'
// import {Routes, Route, Navigate} from 'react-router-dom'
import {Routes, Route} from 'react-router-dom'
import EditProduct from './editProduct'
import DeleteProduct from './deleteProduct'
import RemoveKTNs from './removeKTNs';
import ProductInfo from './productInfo';
import GetProductLog from './getProductLog';
import ProductFromLogInfo from './productFromLogInfo'
// import { useContext } from 'react'
// import { AuthContext } from './authContext/authFile'

// function HomeRedirect() {
//   const auth = useContext(AuthContext);

//   // while auth is restoring, render nothing (avoid wrong redirect)
// if (!auth || auth.loading) {
//     return <div>Loading...</div>; // or spinner
//   }  
//   return auth.loggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
// }

function App() {

  return (
    <>
    <Navbar/>
    <div className='main-content'>
      <Routes>
        {/* <Route path='/' element={<HomeRedirect/>}/> */}
        <Route path='/login' element={<Login/>}/>
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path='/addProduct' element={<ProtectedRoute><AddProduct/></ProtectedRoute>}/>
        <Route path='/editProduct/:id' element={<ProtectedRoute><EditProduct/></ProtectedRoute>}/>
        <Route path='/deleteProduct/:id' element={<ProtectedRoute><DeleteProduct/></ProtectedRoute>}/>
        <Route path='/removeKTNs' element={<ProtectedRoute><RemoveKTNs/></ProtectedRoute>}/>
        <Route path='/productInfo/:id' element={<ProtectedRoute><ProductInfo/></ProtectedRoute>}/>
        <Route path='/iwanttogetproducteditlog/' element={<ProtectedRoute><GetProductLog/></ProtectedRoute>}/>
        <Route path='/productFromLogInfo/:id' element={<ProtectedRoute><ProductFromLogInfo/></ProtectedRoute>}/>
      </Routes>
    </div>
    </>
  )
}

export default App;
