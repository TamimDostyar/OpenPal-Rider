import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LogIn } from './auth/page/login'
function App() {

  return (
    <BrowserRouter>
      <Routes>
          <Route path='/login' element={<LogIn/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
