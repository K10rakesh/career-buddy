import {Routes, Route} from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './layouts/DashboardLayout'
import TaskBuddy from './pages/TaskBuddy'
import ProgressBuddy from './pages/ProgressBuddy'
import OpportunityBuddy from './pages/OpportunityBuddy'

function App(){
  return (
    <Routes>
      <Route path = "/login" element = {<Login/>}/>
      <Route path = "/register" element = {<Register/>}/>
      <Route path = "/dashboard" element = {<DashboardLayout/>}>
        <Route index element = {<Dashboard/>} />
        <Route path = "task-buddy" element = {<TaskBuddy/>} />
        <Route path = "progress-buddy" element = {<ProgressBuddy/>} />
        <Route path = "opportunity-buddy" element = {<OpportunityBuddy/>} />
      </Route>
      <Route path = "*" element = {<NotFound/>}/>
    </Routes>
  );
}

export default App;