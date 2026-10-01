const API_URL = import.meta.env.VITE_API_URL;
const TAG_URL = `${API_URL}/api/tags`;

async function getTags(){
    const res = await fetch(TAG_URL, {
        method: "GET",
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Failed to fetch tags.");
    }

    return data;
}

async function createTag(name){
    const res = await fetch(TAG_URL, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name
        })
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Failed to create tag.");
    }

    return data.tag;
}

async function updateTag(id, name){
    const res = await fetch(`${TAG_URL}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({name})
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Failed to update tag.");
    }

    return data.tag;
}

async function deleteTag(id){
    const res = await fetch(`${TAG_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Failed to delete tag.");
    }

    return data;
}

export {getTags, createTag, updateTag, deleteTag};