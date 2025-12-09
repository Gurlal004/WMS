import Login from './login'
import Dashboard from './dashboard'
import AddProduct from './addProduct'
import ProtectedRoute from './protectedRoutes'
import './App.css'
import Navbar from './navbar'
import {Routes, Route} from 'react-router-dom'
import EditProduct from './editProduct'
import DeleteProduct from './deleteProduct'
import RemoveKTNs from './removeKTNs';
import ProductInfo from './productInfo'

function App() {

  return (
    <>
    <Navbar/>
    <div className='main-content'>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path='/addProduct' element={<ProtectedRoute><AddProduct/></ProtectedRoute>}/>
        <Route path='/editProduct/:id' element={<ProtectedRoute><EditProduct/></ProtectedRoute>}/>\
        <Route path='/deleteProduct/:id' element={<ProtectedRoute><DeleteProduct/></ProtectedRoute>}/>
        <Route path='/removeKTNs' element={<ProtectedRoute><RemoveKTNs/></ProtectedRoute>}/>
        <Route path='/productInfo/:id' element={<ProtectedRoute><ProductInfo/></ProtectedRoute>}/>
      </Routes>
    </div>
    </>
  )
}

export default App
