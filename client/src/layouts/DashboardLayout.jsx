import {Outlet, Link, useNavigate} from "react-router-dom";
import useAuth from "../context/useAuth";

function DashboardLayout(){
    const {logout} = useAuth();
    const navigate = useNavigate();

    async function handleLogout(){
        try{
            await logout();
            navigate("/login");
        }
        catch(err){
            console.error(err);
        }
    }

    return (
        <div>
            <h1>Career Buddy Header</h1>
            <button onClick = {handleLogout}>LOGOUT</button>
            <aside>
                <h1>Sidebar</h1>
                <Link to = ".">Dashboard</Link>
                <Link to = "task-buddy">Task Buddy</Link>
                <Link to = "progress-buddy">Progress Buddy</Link>
                <Link to = "opportunity-buddy">Opportunity Buddy</Link>
            </aside>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;