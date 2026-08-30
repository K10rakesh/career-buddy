const API_URL = import.meta.env.VITE_API_URL;
const AUTH_URL = `${API_URL}/api/auth`;

async function login(email, password){
    const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include", 
        body: JSON.stringify({
            email, 
            password
        })
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Login failed.");
    }

    return data;
}

async function getCurrentUser(){
    const res = await fetch(`${AUTH_URL}/me`, {
        method: "GET", 
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Failed to fetch current user.");
    }

    return data;
}

async function logout(){
    const res = await fetch(`${AUTH_URL}/logout`, {
        method: "POST",
        credentials: "include"
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Logout failed.");
    }

    return data;
}

async function register(name, email, password){
    const res = await fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name, 
            email,
            password
        })
    });

    const data = await res.json();

    if (!res.ok){
        throw new Error(data.message || "Registration failed.");
    }

    return data;
}

export {login, getCurrentUser, logout, register};