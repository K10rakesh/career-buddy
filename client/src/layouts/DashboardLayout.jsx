import {Outlet, Link} from "react-router-dom";

function DashboardLayout(){
    return (
        <div>
            <h1>Career Buddy Header</h1>
            <aside>
                <h1>Sidebar</h1>
                <Link to = "">Dashboard</Link>
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