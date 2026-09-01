const API_URL = import.meta.env.VITE_API_URL;
const TASK_URL = `${API_URL}/api/tasks`;

async function getTasks(){
    const res = await fetch(TASK_URL, {
        method: "GET",
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Failed to fetch tasks.");
    }

    return data;
}

async function createTask(title, description){
    const res = await fetch(TASK_URL, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            description
        })
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Failed to create task.");
    }

    return data;
}

async function updateTask(id, updates){
    const res = await fetch(`${TASK_URL}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Failed to update task.");
    }

    return data.task;
}

async function deleteTask(id){
    const res = await fetch(`${TASK_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Failed to delete task.");
    }

    return data;
}

export {getTasks, createTask, updateTask, deleteTask};