import {Routes, Route} from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard'

function App(){
  return (
    <Routes>
      <Route path = "/login" element = {<Login/>}/>
      <Route path = "/register" element = {<Register/>}/>
      <Route path = "/dashboard" element = {<Dashboard/>}/>
      <Route path = "*" element = {<NotFound/>}/>
    </Routes>
  );
}

export default App;