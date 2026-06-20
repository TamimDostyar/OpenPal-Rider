import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LogIn } from './auth/page/login'
import  Home  from './components/home/index'

function App() {

  return (
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<LogIn/>}/>

      </Routes>
    </BrowserRouter>
  )
}

export default App
