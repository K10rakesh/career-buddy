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

    function handleEdit(){
        setEditing(true);
        setEditTitle(task.title);
        setEditDescription(task.description);
    }

    function handleCancelEdit(){
        setEditing(false);
    }

    async function handleSubmit(e){
        e.preventDefault();
        setSaving(true);

        try{
            await onUpdate(task._id, editTitle, editDescription);
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
                    <label>
                        <input 
                            type = "checkbox" 
                            checked = {task.completed}
                            onChange = {() => onToggleCompleted(task)} 
                            disabled = {toggleCompleteTaskId === task._id || deletingTaskId === task._id} 
                        />
                        {toggleCompleteTaskId === task._id? "TOGGLING...": "COMPLETED"}
                    </label>
                    <button onClick = {handleEdit}>
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