import {createContext, useState, useContext} from 'react';

const AuthContext = createContext(null);

function AuthProvider({children}){
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    return (
        <AuthContext.Provider value = {{user, setUser, token, setToken}}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth(){
    return useContext(AuthContext);
}

export {AuthProvider, useAuth};