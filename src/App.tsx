
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import BarcodeScannerPage from './features/BarcodeModule/pages/BarcodeScannerPage'
import { Login } from './authModule/Login/Login'
import AuthGuard from './authModule/AuthGuard/AuthGuard'
import InstallButton from './PWAinstall/InstallButton'

function App() {


  return (
    <div>
      
      
      <BrowserRouter>

       <InstallButton/>
        <Routes> 

          
          
         
         
            <Route path="/" element={<AuthGuard><BarcodeScannerPage/></AuthGuard>} />
         
            <Route path='/login' element={<Login/>} />


    

            
         
       
           

        <Route path='*' element={<h1>404 Not Found</h1>}/> 

        </Routes>   
       
      </BrowserRouter>
    
    </div>
  )
};

export default App
