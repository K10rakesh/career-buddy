import {useState} from "react";

function TaskItem({
    task, 
    onDelete, 
    deletingTaskId, 
    onToggleCompleted, 
    toggleCompleteTaskId,
    onUpdate
}){
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [editDeadlineDate, setEditDeadlineDate] = useState("");
    const [editDeadlineTime, setEditDeadlineTime] = useState("");
    const [editError, setEditError] = useState("");

    function handleEdit(){
        setEditing(true);
        setEditTitle(task.title);
        setEditDescription(task.description);
        setEditError("");
        
        if (task.deadline){
            const deadline = new Date(task.deadline);

            const year = deadline.getFullYear();
            const month = String(deadline.getMonth() + 1).padStart(2, "0");
            const day = String(deadline.getDate()).padStart(2, "0");
            const hours = String(deadline.getHours()).padStart(2, "0");
            const minutes = String(deadline.getMinutes()).padStart(2, "0");

            setEditDeadlineDate(`${year}-${month}-${day}`);
            setEditDeadlineTime(`${hours}:${minutes}`);
        }
        else{
            setEditDeadlineDate("");
            setEditDeadlineTime("");
        }
    }

    function handleCancelEdit(){
        setEditing(false);
    }

    async function handleSubmit(e){
        e.preventDefault();
        setEditError("");

        const hasDate = editDeadlineDate !== "";
        const hasTime = editDeadlineTime !== "";

        if (hasDate !== hasTime){
            setEditError("Please provide both a deadline date and time.");
            return;
        }

        setSaving(true);

        try{
            let deadline = null;
            if (editDeadlineDate && editDeadlineTime){
                deadline = new Date(`${editDeadlineDate}T${editDeadlineTime}`).toISOString();
            }
            await onUpdate(task._id, editTitle, editDescription, deadline);
            setEditing(false);
        }
        catch{
            //error is already handled by TaskBuddy
        }
        finally{
            setSaving(false);
        }
    }

    return (
        <div>
            {editing? (
                <div>
                    <form onSubmit = {handleSubmit}>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            disabled = {saving}
                        />
                        <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            disabled = {saving}
                        />
                        <input
                            type = "date"
                            value = {editDeadlineDate}
                            onChange = {(e) => setEditDeadlineDate(e.target.value)}
                            disabled = {saving}
                        />
                        <input
                            type = "time"
                            value = {editDeadlineTime}
                            onChange = {(e) => setEditDeadlineTime(e.target.value)}
                            disabled = {saving}
                        />
                        {editError && <p>{editError}</p>}
                        <button type="submit" disabled = {saving}>
                            {saving? "SAVING...": "SAVE"}
                        </button>
                    </form>

                    <button onClick={handleCancelEdit} disabled = {saving}>
                        CANCEL
                    </button>
                </div>
            ): (
                <div>
                    <h2>{task.title}</h2>
                    <p>{task.description}</p>
                    {task.deadline && (
                        <p>Deadline: {new Date(task.deadline).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}</p>
                    )}
                    <label>
                        <input 
                            type = "checkbox" 
                            checked = {task.completed}
                            onChange = {() => onToggleCompleted(task)} 
                            disabled = {toggleCompleteTaskId === task._id || deletingTaskId === task._id} 
                        />
                        {toggleCompleteTaskId === task._id? "TOGGLING...": "COMPLETED"}
                    </label>
                    <button onClick = {handleEdit} disabled = {editing}>
                        EDIT
                    </button>
                    <button 
                        onClick = {() => onDelete(task._id)} 
                        disabled = {deletingTaskId === task._id}
                    >
                    {deletingTaskId === task._id? "DELETING..." : "DELETE"}
                    </button>
                </div>
            )}
        </div>
    )
}

export default TaskItem;