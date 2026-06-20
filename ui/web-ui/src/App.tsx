import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LogIn } from './auth/page/login'
import { Signup } from './auth/page/signup'
import { ForgotPW } from './auth/page/forgotpw'
import  Home  from './components/home/index'

function App() {

  return (
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<LogIn/>}/>
          <Route path='/signup' element={<Signup/>}/>
          <Route path='/forgot-password' element={<ForgotPW/>}/>

      </Routes>
    </BrowserRouter>
  )
}

export default App
