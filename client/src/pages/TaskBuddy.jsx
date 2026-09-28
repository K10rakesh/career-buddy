import {useState, useEffect} from "react";
import {getTasks, createTask, updateTask, deleteTask} from "../api/taskApi";
import TaskItem from "../components/TaskItem";
import {getTags, createTag} from "../api/tagApi";

function TaskBuddy(){
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState(null);
    const [toggleCompleteTaskId, setToggleCompleteTaskId] = useState(null);
    const [filters, setFilters] = useState({
        status: "all",
        priority: null,
        tags: []
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [deadlineDate, setDeadlineDate] = useState("");
    const [deadlineTime, setDeadlineTime] = useState("");
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [newTagName, setNewTagName] = useState("");
    const [creatingTag, setCreatingTag] = useState(false);
    const [selectedPriority, setSelectedPriority] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    async function handleCreateTask(e){
        e.preventDefault();
        setError("");

        const hasDate = deadlineDate !== "";
        const hasTime = deadlineTime !== "";

        if (hasDate !== hasTime){
            setError("Please provide both a deadline date and time.");
            return;
        }

        setCreating(true);

        try{
            let deadline = null;
            if (deadlineDate && deadlineTime){
                deadline = new Date(`${deadlineDate}T${deadlineTime}`).toISOString();
            }
            const newTask = await createTask(title, description, deadline, selectedTags, selectedPriority);
            setTasks((prevTasks) => [...prevTasks, newTask]);
            setTitle("");
            setDescription("");
            setDeadlineDate("");
            setDeadlineTime("");
            setSelectedPriority(null);
            setSelectedTags([]);
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

    async function handleUpdateTask(id, title, description, deadline, tags, priority){
        setError("");

        try{
            const updatedTask = await updateTask(id, {
                title,
                description,
                deadline,
                tags,
                priority
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

    async function handleCreateTag(e){
        e.preventDefault();
        setError("");

        if (!newTagName.trim()){
            setError("Tag name cannot be empty.");
            return;
        }

        setCreatingTag(true);

        try{
            const newTag = await createTag(newTagName.trim());
            setTags((prevTags) => [...prevTags, newTag]);
            setNewTagName("");
        }
        catch (err){
            setError(err.message);
        }
        finally{
            setCreatingTag(false);
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

        async function fetchTags(){
            try{
                const data = await getTags();
                setTags(data.tags);
            }
            catch (err){
                console.error("Tag fetch error:", err);
                setError(err.message);
            }
        }

        fetchTasks();
        fetchTags();
    }, []);

    const filteredTasks = tasks.filter((task) => {
        const matchesStatus = (
            (filters.status === "all") || 
            (filters.status === "completed" && task.completed) || 
            (filters.status === "active" && !task.completed)
        );

        const matchesSearch = (
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesPriority = (
            filters.priority === null || task.priority === filters.priority
        );

        const matchesTags = (
            filters.tags.length === 0 || filters.tags.some((tagId) => task.tags.includes(tagId))
        );

        return matchesStatus && matchesSearch && matchesPriority && matchesTags;
    });

    if (loading){
        return (
            <p>Loading tasks...</p>
        );
    }
    return (
        <div>
            <h1>Task Buddy</h1>
            <div>
                <input 
                    type = "text" 
                    placeholder = "search tasks" 
                    value = {searchQuery} 
                    onChange = {(e) => setSearchQuery(e.target.value)} 
                />
            </div>
            <div>
                <button onClick = {() => setShowFilters(!showFilters)} >FILTER</button>
                {showFilters && (
                    <div>
                        <div>
                            <p>STATUS</p>
                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    checked={filters.status === "all"}
                                    onChange={() => {
                                        setFilters((prev) => ({
                                            ...prev,
                                            status: "all"
                                        }));
                                    }}
                                />
                                ALL
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    checked={filters.status === "active"}
                                    onChange={() => {
                                        setFilters((prev) => ({
                                            ...prev,
                                            status: "active"
                                        }));
                                    }}
                                />
                                ACTIVE
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    checked={filters.status === "completed"}
                                    onChange={() => {
                                        setFilters((prev) => ({
                                            ...prev,
                                            status: "completed"
                                        }));
                                    }}
                                />
                                COMPLETED
                            </label>
                        </div>
                        <div>
                            <p>PRIORITY</p>
                            <label>
                                <input
                                    type="radio"
                                    name="priority"
                                    checked={filters.priority === null}
                                    onChange={() => {
                                        setFilters((prev) => ({
                                            ...prev,
                                            priority: null
                                        }));
                                    }}
                                />
                                ANY
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="priority"
                                    checked={filters.priority === "High"}
                                    onChange={() => {
                                        setFilters((prev) => ({
                                            ...prev,
                                            priority: "High"
                                        }));
                                    }}
                                />
                                HIGH
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="priority"
                                    checked={filters.priority === "Medium"}
                                    onChange={() => {
                                        setFilters((prev) => ({
                                            ...prev,
                                            priority: "Medium"
                                        }));
                                    }}
                                />
                                MEDIUM
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="priority"
                                    checked={filters.priority === "Low"}
                                    onChange={() => {
                                        setFilters((prev) => ({
                                            ...prev,
                                            priority: "Low"
                                        }));
                                    }}
                                />
                                LOW
                            </label>
                        </div>
                        <div>
                            <p>TAGS</p>
                            {tags.map((tag) => {
                                return (
                                    <label key = {tag.id}>
                                        <input
                                            type="checkbox"
                                            name="tags"
                                            checked={filters.tags.includes(tag.id)}
                                            onChange={() => {
                                                if (filters.tags.includes(tag.id)){
                                                    setFilters((prevFilters) => ({
                                                        ...prevFilters,
                                                        tags: prevFilters.tags.filter((tagId) => tagId !== tag.id)
                                                    }));
                                                }
                                                else{
                                                    setFilters((prevFilters) => ({
                                                        ...prevFilters,
                                                        tags: [...prevFilters.tags, tag.id]
                                                    }));
                                                }
                                            }}
                                        />
                                        {tag.name}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit = {handleCreateTask}>
                <input 
                    type = "text" 
                    placeholder = "Please enter title" 
                    value = {title} 
                    onChange = {(e) => setTitle(e.target.value)} 
                    disabled = {creating}
                />
                <input 
                    type = "text" 
                    placeholder = "Please enter description" 
                    value = {description} 
                    onChange = {(e) => setDescription(e.target.value)} 
                    disabled = {creating}
                />
                <input
                    type = "date"
                    value = {deadlineDate}
                    onChange = {(e) => setDeadlineDate(e.target.value)}
                    disabled = {creating}
                />
                <input
                    type = "time"
                    value = {deadlineTime}
                    onChange = {(e) => setDeadlineTime(e.target.value)}
                    disabled = {creating}
                />
                <div>
                    <p>Tags:</p>
                    {tags.map((tag) => (
                        <label key = {tag.id}>
                            <input 
                                type = "checkbox" 
                                value = {tag.id} 
                                onChange = {(e) => {
                                    if (selectedTags.includes(e.target.value)){
                                        setSelectedTags(selectedTags.filter((id) => id !== e.target.value));
                                    }
                                    else{
                                        setSelectedTags([...selectedTags, e.target.value]);
                                    }
                                }}
                                checked = {selectedTags.includes(tag.id)} 
                            />
                            {tag.name}
                        </label>
                    ))}
                </div>
                <div>
                    <p>Priority:</p>

                    <label>
                        <input
                            type="radio"
                            value="High"
                            checked={selectedPriority === "High"}
                            onChange={(e) => setSelectedPriority(e.target.value)}
                        />
                        High
                    </label>

                    <label>
                        <input
                            type="radio"
                            value="Medium"
                            checked={selectedPriority === "Medium"}
                            onChange={(e) => setSelectedPriority(e.target.value)}
                        />
                        Medium
                    </label>

                    <label>
                        <input
                            type="radio"
                            value="Low"
                            checked={selectedPriority === "Low"}
                            onChange={(e) => setSelectedPriority(e.target.value)}
                        />
                        Low
                    </label>

                    <label>
                        <input
                            type="radio"
                            value=""
                            checked={selectedPriority === null}
                            onChange={() => setSelectedPriority(null)}
                        />
                        None
                    </label>
                </div>
                {error && <p>{error}</p>}
                <button type = "submit" disabled = {creating}>{creating? "CREATING TASK...": "CREATE"}</button>
            </form>
            <form onSubmit = {handleCreateTag}>
                    <input 
                        type = "text" 
                        placeholder = "New tag name" 
                        value = {newTagName} 
                        onChange = {(e) => setNewTagName(e.target.value)} 
                        disabled = {creatingTag}
                    />
                    <button type = "submit" disabled = {creatingTag}>{creatingTag? "CREATING TAG...": "CREATE"}</button>
            </form>
            {
            tasks.length === 0? (
                <p>No tasks yet.</p>
            ):
            filteredTasks.length === 0 ? (
                <p>No tasks match this search or filter.</p>
            ): (
                filteredTasks.map((task) => {
                    return (
                        <TaskItem 
                            key = {task._id} 
                            task = {task} 
                            onDelete = {handleDeleteTask} 
                            deletingTaskId = {deletingTaskId}
                            onToggleCompleted = {handleToggleCompleted}
                            toggleCompleteTaskId = {toggleCompleteTaskId}
                            onUpdate = {handleUpdateTask}
                            tags = {tags}
                        />
                    );
                })
            )
            }
        </div>
    );
}

export default TaskBuddy;