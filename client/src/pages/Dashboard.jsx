import {useEffect, useState} from "react";
import {getTasks} from "../api/taskApi";

function Dashboard(){
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function fetchTasks(){
      try{
        const data = await getTasks();
        setTasks(data.tasks);
      }
      catch (err){
        setError(err.message);
      }
      finally{
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (loading){
    return (
      <p>Loading dashboard...</p>
    );
  }

  if (error){
    return (
      <p>{error}</p>
    )
  }

  const totalTasks = tasks.length;

  const activeTasks = tasks.filter((task) => {
    return !task.completed;
  }).length;

  const completedTasks = tasks.filter(((task) => {
    return task.completed;
  })).length;

  const completionPercentage = totalTasks === 0? 0: Math.round((completedTasks/totalTasks) * 100);

  return (
    <div>
      <h1>Dashboard</h1>
      {totalTasks === 0? (
        <p>You have not created any tasks yet.</p>
      ): (
        <div>
          <div>
            <h2>Task Completion</h2>
            <p>{completionPercentage}%</p>
          </div>
          <div>
            <h2>Total Tasks</h2>
            <p>{totalTasks}</p>
          </div>
          <div>
            <h2>Active Tasks</h2>
            <p>{activeTasks}</p>
          </div>
          <div>
            <h2>Completed Tasks</h2>
            <p>{completedTasks}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;