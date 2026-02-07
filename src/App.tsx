
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import BarcodeScannerPage from './features/BarcodeModule/pages/BarcodeScannerPage'

function App() {


  return (
    <div>
      
      <BrowserRouter>

       
        <Routes> 

          
          
         
            <Route path="/" element={<BarcodeScannerPage/>} />
         



    

            
         
       
           

        <Route path='*' element={<h1>404 Not Found</h1>}/> 

        </Routes>   
       
      </BrowserRouter>
    
    </div>
  )
};

export default App
