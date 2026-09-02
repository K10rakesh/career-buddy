import {useState, useEffect} from "react";
import {getTasks, createTask, updateTask, deleteTask} from "../api/taskApi";
import TaskItem from "../components/TaskItem";

function TaskBuddy(){
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState(null);
    const [toggleCompleteTaskId, setToggleCompleteTaskId] = useState(null);

    async function handleCreateTask(e){
        e.preventDefault();
        setError("");
        setCreating(true);

        try{
            const newTask = await createTask(title, description);
            setTasks([...tasks, newTask]);
            setTitle("");
            setDescription("");
        }
        catch (err){
            setError(err.message);
        }
        finally{
            setCreating(false);
        }
    }

    async function handleToggleCompleted(task){
        setError("");
        setToggleCompleteTaskId(task._id);

        try{
            const updatedTask = await updateTask(task._id, {
                completed: !task.completed
            });
            const updatedTasks = tasks.map((task) => {
                if (task._id === updatedTask._id){
                    return updatedTask;
                }
                return task;
            });
            setTasks(updatedTasks);
        }
        catch(err){
            setError(err.message);
        }
        finally{
            setToggleCompleteTaskId(null);
        }
    }

    async function handleDeleteTask(id){
        setError("");
        setDeletingTaskId(id);

        try{
            await deleteTask(id);
            const remainingTasks = tasks.filter((task) => task._id !== id);
            setTasks(remainingTasks);
        }
        catch (err){
            setError(err.message);
        }
        finally{
            setDeletingTaskId(null);
        }
    }

    async function handleUpdateTask(id, title, description){
        setError("");

        try{
            const updatedTask = await updateTask(id, {
                title,
                description
            });
            const updatedTasks = tasks.map((task) => {
                if (task._id === updatedTask._id){
                    return updatedTask;
                }
                return task;
            });
            setTasks(updatedTasks);
        }
        catch (err){
            setError(err.message);
            throw err;
        }
    }

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
            <p>Loading tasks...</p>
        );
    }

    return (
        <div>
            <h1>Task Buddy</h1>
            {
            tasks.length === 0 ? (
                <p>No tasks yet.</p>
            ): (
                tasks.map((task) => {
                    return (
                        <TaskItem 
                            key = {task._id} 
                            task = {task} 
                            onDelete = {handleDeleteTask} 
                            deletingTaskId = {deletingTaskId}
                            onToggleCompleted = {handleToggleCompleted}
                            toggleCompleteTaskId = {toggleCompleteTaskId}
                            onUpdate = {handleUpdateTask}
                        />
                    );
                })
            )
            }
            <form onSubmit = {handleCreateTask}>
                <input type = "text" placeholder = "Please enter title" value = {title} onChange = {(e) => setTitle(e.target.value)} disabled = {creating}/>
                <input type = "text" placeholder = "Please enter description" value = {description} onChange = {(e) => setDescription(e.target.value)} disabled = {creating}/>
                {error && <p>{error}</p>}
                <button type = "submit" disabled = {creating}>{creating? "CREATING...": "CREATE"}</button>
            </form>
        </div>
    );
}

export default TaskBuddy;