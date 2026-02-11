
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import BarcodeScannerPage from './features/BarcodeModule/pages/BarcodeScannerPage'
import { Login } from './authModule/Login/Login'
import AuthGuard from './authModule/AuthGuard/AuthGuard'

function App() {


  return (
    <div>
      
      <BrowserRouter>

       
        <Routes> 

          
          
         
            <Route path="/" element={<BarcodeScannerPage/>} />
         
            <Route path="/protected" element={<AuthGuard><h1>Ruta protegida</h1></AuthGuard>} />
         
            <Route path='/login' element={<Login/>} />


    

            
         
       
           

        <Route path='*' element={<h1>404 Not Found</h1>}/> 

        </Routes>   
       
      </BrowserRouter>
    
    </div>
  )
};

export default App
