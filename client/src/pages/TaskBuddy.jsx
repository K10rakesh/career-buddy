import {useState, useEffect} from "react";
import {getTasks, createTask, updateTask, deleteTask} from "../api/taskApi";

function TaskBuddy(){
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [creating, setCreating] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState(null);
    const [saving, setSaving] = useState(false);
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

    function handleEditTask(task){
        setEditingTaskId(task._id);
        setEditTitle(task.title);
        setEditDescription(task.description);
    }

    function handleCancelEdit(){
        setEditingTaskId(null);
    }

    async function handleSubmit(e){
        e.preventDefault();
        setError("");
        setSaving(true);

        try{
            const updatedTask = await updateTask(editingTaskId, {
                title: editTitle,
                description: editDescription
            });
            const updatedTasks = tasks.map((task) => {
                if (task._id === updatedTask._id){
                    return updatedTask;
                }
                return task;
            });
            setTasks(updatedTasks);
            setEditingTaskId(null);
        }
        catch (err){
            setError(err.message);
        }
        finally{
            setSaving(false);
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
                    <div key = {task._id}>
                        {editingTaskId === task._id? (
                            <div>
                                <form onSubmit = {handleSubmit}>
                                    <input value = {editTitle} type = "text" onChange = {(e) => setEditTitle(e.target.value)} disabled = {saving}/>
                                    <input type = "text" value = {editDescription} onChange = {(e) => setEditDescription(e.target.value)} disabled = {saving}/>
                                    <button type = "submit" disabled = {saving}>{saving? "SAVING...": "SAVE"}</button>
                                </form>
                                <button onClick = {handleCancelEdit}>CANCEL</button>
                            </div>
                        ): (
                            <div>
                                <h2>{task.title}</h2>
                                <p>{task.description}</p>
                                <button onClick = {() => handleEditTask(task)} disabled = {deletingTaskId === task._id}>EDIT</button>
                            </div>
                        )}
                        <label>
                            <input type = "checkbox" checked = {task.completed} onChange = {() => handleToggleCompleted(task)} disabled = {toggleCompleteTaskId === task._id || deletingTaskId === task._id}/>
                            {toggleCompleteTaskId === task._id? "TOGGLING...": "COMPLETED"}
                        </label>
                        <button onClick = {() => handleDeleteTask(task._id)} disabled = {deletingTaskId === task._id}>{deletingTaskId === task._id? "DELETING...": "DELETE"}</button>
                    </div>
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