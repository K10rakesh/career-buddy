import {useState, useEffect} from "react";
import {getTasks, createTask, updateTask, deleteTask} from "../api/taskApi";
import TaskItem from "../components/TaskItem";
import {getTags, createTag, updateTag, deleteTag} from "../api/tagApi";
import TagManager from "../components/TagManager"

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
    const [selectedPriority, setSelectedPriority] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState("default");

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

    async function handleCreateTag(name){
        const newTag = await createTag(name);
        setTags((prevTags) => [...prevTags, newTag]);
    }

    async function handleUpdateTag(id, name){
        setError("");
        const updatedTag = await updateTag(id, name);
        const updatedTags = tags.map((tag) => {
            if (tag.id === updatedTag.id){
                return updatedTag;
            }
            return tag;
        });
        setTags(updatedTags);
    }

    async function handleDeleteTag(id){
        setError("");
        await deleteTag(id);
        const remainingTags = tags.filter((tag) => tag.id !== id);
        setTags(remainingTags);
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

    const sortedTasks = [...filteredTasks];
    const mappedPriority = {Low: 1, Medium: 2, High: 3};
    if (sortBy === "newest"){
        sortedTasks.sort((task1, task2) => {
            const time1 = new Date(task1.createdAt).getTime();
            const time2 = new Date(task2.createdAt).getTime();
            return time2 - time1;
        });
    }
    else if (sortBy === "oldest"){
        sortedTasks.sort((task1, task2) => {
            const time1 = new Date(task1.createdAt).getTime();
            const time2 = new Date(task2.createdAt).getTime();
            return time1 - time2;
        });
    }
    else if (sortBy === "deadlineAsc"){
        sortedTasks.sort((task1, task2) => {
            const hasDeadline1 = task1.deadline !== null;
            const hasDeadline2 = task2.deadline !== null;
            if (hasDeadline1 && hasDeadline2){
                const time1 = new Date(task1.deadline).getTime();
                const time2 = new Date(task2.deadline).getTime();
                return time1 - time2;
            }
            if (hasDeadline1){
                return -1;
            }
            if (hasDeadline2){
                return 1;
            }
            return 0;
        });
    }
    else if (sortBy === "deadlineDesc"){
        sortedTasks.sort((task1, task2) => {
            const hasDeadline1 = task1.deadline !== null;
            const hasDeadline2 = task2.deadline !== null;
            if (hasDeadline1 && hasDeadline2){
                const time1 = new Date(task1.deadline).getTime();
                const time2 = new Date(task2.deadline).getTime();
                return time2 - time1;
            }
            if (hasDeadline1){
                return 1;
            }
            if (hasDeadline2){
                return -1;
            }
            return 0;
        });
    }
    else if (sortBy === "priorityAsc"){
        sortedTasks.sort((task1, task2) => {
            const hasPriority1 = task1.priority !== null;
            const hasPriority2 = task2.priority !== null;
            if (hasPriority1 && hasPriority2){
                const priority1 = mappedPriority[task1.priority];
                const priority2 = mappedPriority[task2.priority];
                return priority1 - priority2;
            }
            if (hasPriority1){
                return -1;
            }
            if (hasPriority2){
                return 1;
            }
            return 0;
        });
    }
    else if (sortBy === "priorityDesc"){
        sortedTasks.sort((task1, task2) => {
            const hasPriority1 = task1.priority !== null;
            const hasPriority2 = task2.priority !== null;
            if (hasPriority1 && hasPriority2){
                const priority1 = mappedPriority[task1.priority];
                const priority2 = mappedPriority[task2.priority];
                return priority2 - priority1;
            }
            if (hasPriority1){
                return 1;
            }
            if (hasPriority2){
                return -1;
            }
            return 0;
        });
    }

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
                        <select 
                            value = {sortBy}
                            onChange = {(e) => setSortBy(e.target.value)}
                        >
                            <option value="default">Default</option>
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="deadlineAsc">Deadline: Earliest first</option>
                            <option value="deadlineDesc">Deadline: Latest first</option>
                            <option value="priorityDesc">Priority: High → Low</option>
                            <option value="priorityAsc">Priority: Low → High</option>
                        </select>
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
            <TagManager
                tags={tags}
                onCreate={handleCreateTag}
                onUpdate = {handleUpdateTag}
                onDelete = {handleDeleteTag}
            />
            {
            tasks.length === 0? (
                <p>No tasks yet.</p>
            ):
            sortedTasks.length === 0 ? (
                <p>No tasks match this search or filter.</p>
            ): (
                sortedTasks.map((task) => {
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