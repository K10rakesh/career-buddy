import {useState} from "react";

function TagManager({
    tags, 
    onCreate,
    onUpdate,
    onDelete
}){
    const [newTagName, setNewTagName] = useState("");
    const [creatingTag, setCreatingTag] = useState(false);
    const [error, setError] = useState("");
    const [editingTagId, setEditingTagId] = useState("");
    const [editingTagName, setEditingTagName] = useState("");
    const [updatingTag, setUpdatingTag] = useState(false);
    const [deletingTagId, setDeletingTagId] = useState("");

    async function handleCreateTag(e){
        e.preventDefault();
        setError("");

        if (!newTagName.trim()){
            setError("Tag name cannot be empty.");
            return;
        }

        setCreatingTag(true);
        try{
            await onCreate(newTagName.trim());
            setNewTagName("");
        }
        catch (err){
            setError(err.message || "Error creating new tag.");
        }
        finally{
            setCreatingTag(false);
        }
    }

    function handleStartEditing(tag){
        setEditingTagId(tag.id);
        setEditingTagName(tag.name);
    }

    function handleCancelEdit(){
        setEditingTagId("");
        setEditingTagName("");
    }

    async function handleUpdateTag(e){
        e.preventDefault();
        setError("");

        if (!editingTagName.trim()){
            setError("Tag name cannot be empty.");
            return;
        }

        setUpdatingTag(true);
        try{
            await onUpdate(editingTagId, editingTagName.trim());
            setEditingTagName("");
            setEditingTagId("");
        }
        catch (err){
            setError(err.message || "Error updating tag.");
        }
        finally{
            setUpdatingTag(false);
        }
    }

    async function handleDeleteTag(id){
        setError("");

        setDeletingTagId(id);

        try{
            await onDelete(id);
        }
        catch (err){
            setError(err.message || "Error deleting tag.");
        }
        finally{
            setDeletingTagId("");
        }
    }

    return (
        <div>
            <form onSubmit = {handleCreateTag}>
                    <input 
                        type = "text" 
                        placeholder = "New tag name" 
                        value = {newTagName} 
                        onChange = {(e) => setNewTagName(e.target.value)} 
                        disabled = {creatingTag}
                    />
                    {error && <p>{error}</p>}
                    <button type = "submit" disabled = {creatingTag}>{creatingTag? "CREATING TAG...": "CREATE"}</button>
            </form>
            <div>
                <p>TAGS:</p>
                {tags.map((tag) => {
                    return (
                    tag.id === editingTagId? (
                        <form onSubmit = {handleUpdateTag}>
                            <input 
                                type = "text"
                                placeholder = "Enter new tag name"
                                value = {editingTagName}
                                onChange = {(e) => setEditingTagName(e.target.value)}
                            />
                            <button type = "submit" disabled = {updatingTag}>SAVE</button>
                            <button type = "button" onClick = {handleCancelEdit} disabled = {updatingTag}>CANCEL</button>
                        </form>
                    ): (
                        <div key = {tag.id}>
                            <span>{tag.name}</span>
                            <button type = "button" onClick = {() => handleStartEditing(tag)}>EDIT</button>
                            <button type = "button" onClick = {() => handleDeleteTag(tag.id)} disabled = {deletingTagId === tag.id}>{deletingTagId === tag.id ? "DELETING..." : "DELETE"}</button>
                        </div>
                    )
                    );
                })}
            </div>
        </div>
    );
}

export default TagManager;