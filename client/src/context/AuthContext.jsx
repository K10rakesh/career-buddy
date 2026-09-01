import {useState, useEffect} from "react";
import {login as loginApi, getCurrentUser, logout as logoutApi} from "../api/authApi";
import AuthContext from "./AuthContext";

function AuthProvider({children}){
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth(){
            try{
                const data = await getCurrentUser();
                setUser(data.user);
            }
            catch{
                setUser(null);
            }
            finally{
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    async function login(email, password){
        const data = await loginApi(email, password);
        setUser(data.user);
    }

    async function logout(){
        await logoutApi();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{user, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;