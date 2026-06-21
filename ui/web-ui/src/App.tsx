import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LogIn } from './auth/page/login'
import { Signup } from './auth/page/signup'
import { ForgotPW } from './auth/page/forgotpw'
import  Index  from './components/home/index'
import  {MainHome}  from './components/home/home'

function App() {

  return (
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Index/>}/>
          <Route path='/home' element={<MainHome/>}/>
          <Route path='/forgot-password' element={<ForgotPW/>}/>  
          <Route path='/login' element={<LogIn/>}/>
          <Route path='/signup' element={<Signup/>}/>
          <Route path='/forgot-password' element={<ForgotPW/>}/>

      </Routes>
    </BrowserRouter>
  )
}

export default App
